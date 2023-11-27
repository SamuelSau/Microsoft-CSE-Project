from django.shortcuts import render, redirect
from .forms import QuizRefineryForm
import requests
import pdfplumber  # for extracting text from PDFs
from io import BytesIO 
import requests
from decouple import config
from django.shortcuts import redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponseServerError
import logging
import PyPDF2
from pptx import Presentation
import json 
import spacy 
import nltk
from nltk.tokenize import word_tokenize
from typing import List
from django.http import HttpResponse

SECRET_KEY1 = config("SECRET_KEY1")
SECRET_KEY2 = config("SECRET_KEY2")
SECRET_KEY3 = config("SECRET_KEY3")
RESOURCE_NAME = config("RESOURCE_NAME")
MODEL_NAME = config("MODEL_NAME")

nltk.download('punkt')


def limit_tokens_in_string(text: str, max_tokens: int) -> str:
    tokens = word_tokenize(text)
    
    # If the number of tokens is below the maximum limit, return the original text
    if len(tokens) <= max_tokens:
        return text
    
    # Otherwise, return the truncated text
    truncated_tokens = tokens[:max_tokens]
    return ' '.join(truncated_tokens)

@csrf_exempt
def extract_text_from_pdf(file):
    # Extract text from a PDF file using pdfplumber and an in-memory file
    with pdfplumber.open(file) as pdf:
        text = " ".join(page.extract_text() for page in pdf.pages)
    return text

@csrf_exempt
def get_variant_answer_key(response):
    print(response)
    quiz =  response['choices'][0]['message']['content']
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"
    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }
    data = {
        "messages": [
            {"role": "system", "content": "You are a highly skilled TA that grades quizzes for educators. Please analyze the quiz below and if and only if the formatting is unusual and not a quiz structure, please generate a total of 3 questions related to any 3 topics from that list. If you are given the questions, please give the correct answers to the respective questions also including if multiple variations were specified."},
            {"role": "user", "content": "Given the following quiz, provide a correct answer for each question asked. Ensure it is correct, especially for code questions. Do not add any excessive explanation, and do not add any questions that are not present in the quiz. \nThe quiz is as follows:\n" + quiz},
            {"role": "assistant", "content": "Here is the answer key for the quiz corresponding respectively to each question. The formatting for the response will be: Original Quiz: 1. 2. Variation 1: 1. 2. Variation 2: 1. 2. Where 1 and 2 are the answers to the questions, make sure each answer are numbered that corresponds to that question. Do not include the questions with the answers, just have the answers."}
        ]
    }
    variantResponse = requests.post(url, headers=headers, json=data)
    return variantResponse.json()

@csrf_exempt
def create_quiz_variations(file_content: str, num_variations: int):
    
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"

    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    data = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that takes previous exams and creates variations as quizzes to be the exact same level of difficulty and same concepts. The order of the questions and difficulty should vary for each student to make it difficult to cheat. Do not provide the answer key here."},
            {"role": "user", "content": "Keep the formatting the exact same and do not stray too far from what is seen in the quiz. Firstly, create an original quiz then then include the original quiz in the response on top. Also, if any code is written, please surround it with '```' on each side so I can format it properly on the front end. I want the original quiz at the top, with the following number of variations of the quiz. Please make exactly " + str(num_variations) + " variations of the following content:\n\n" + file_content},
            {"role": "assistant", "content": f"Here are the variations of the quiz, each variation having a title 'Variation #' at the beginning, and all code blocks surrounded by three '`' to indicate it is code. Here is an example of the formatting for the response: Original Quiz: Q1. Q2. Variation 1: Q1. Q2. Variation 2: Q1. Q2. Q1 and Q2 are followed with different questions. Do not include the answer key, only the questions! Please remember to make exactly {str(num_variations)}"}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    response_json = response.json()  # Get the JSON content of the response
    answer_key = get_variant_answer_key(response_json)
    combined_data = {
        "response": response_json,
        "answer_key": answer_key
    }

    # Convert the combined dictionary to a JSON string
    return combined_data
    
# Set up logging
logger = logging.getLogger(__name__)

@csrf_exempt
def exam_refine_form(request):
    if request.method == "POST":
        try:
            form = QuizRefineryForm(request.POST, request.FILES)
            if form.is_valid():
                num_variations = form.cleaned_data['num_variations']
                uploaded_file = request.FILES['upload_file']
                file_extension = uploaded_file.name.split('.')[-1].lower()  # Extract file extension here

                file_in_memory = BytesIO(uploaded_file.read())
                file_in_memory.seek(0)  # Reset file pointer to the start
                extracted_text = extract_content_from_file(file_in_memory, file_extension)
                response = create_quiz_variations(extracted_text, num_variations)
                response['type'] = 'variation'
                return JsonResponse({"response": response})
            else:
                return JsonResponse({"status": "Invalid Form", "message": "Form data is not valid."})
        except Exception as e:
            # Log the error
            logger.error('Error in exam_refine_form: %s', str(e))

            # Optionally, return a more descriptive error response
            return HttpResponseServerError('Internal Server Error')
    else:
        return JsonResponse({"status": "Form not submitted", "message": "Please submit the form using POST method."})

def extract_content_from_file(uploaded_file, file_extension) -> str:
    content = ""

    if file_extension == "pdf":
        # Extract content from PDF
        pdf_reader = PyPDF2.PdfReader(uploaded_file)
        for page_num in range(len(pdf_reader.pages)):
            content += pdf_reader.pages[page_num].extract_text() + "\n"
    
    #needs to fixing 
    elif file_extension in ["ppt", "pptx"]:

        # Extract content from PPT
        uploaded_file.seek(0)

        # Extract content from PPT or PPTX
        presentation = Presentation(uploaded_file)

        for slide in presentation.slides:
            for shape in slide.shapes:
                if hasattr(shape, "text"):
                    content += shape.text + "\n"
                
    entities = extract_entities_from_azure(content)    
    entities_str = '\n'.join([' '.join(phrase_list) for phrase_list in entities])  # Convert list of lists to a string
    limited_str = limit_tokens_in_string(entities_str,4500)
    return limited_str

def extract_entities_from_azure(text: str) -> List[List]:
        
    SECRET_KEY3 = config("SECRET_KEY3")
    endpoint = "https://usfcslangservice.cognitiveservices.azure.com/"
    
    entity_recognition_url = endpoint + "/text/analytics/v3.0/keyPhrases"
    
    headers = {
        "Ocp-Apim-Subscription-Key": SECRET_KEY3,
        "Content-Type": "application/json"
    }
    max_chars_per_document = 5120
    chunks = [text[i:i + max_chars_per_document] for i in range(0, len(text), max_chars_per_document)]
    
    documents = [{"id": str(idx), "language": "en", "text": chunk} for idx, chunk in enumerate(chunks)]
    

    MAX_DOCS_PER_REQUEST = 5
    responses = []
    for i in range(0, len(documents), MAX_DOCS_PER_REQUEST):
        batch = documents[i:i+MAX_DOCS_PER_REQUEST]
        response = requests.post(entity_recognition_url, headers=headers, json={"documents": batch})
        responses.extend(response.json().get('documents', []))

    
    all_entities = [doc.get('keyPhrases', []) for doc in responses]
    
    return all_entities