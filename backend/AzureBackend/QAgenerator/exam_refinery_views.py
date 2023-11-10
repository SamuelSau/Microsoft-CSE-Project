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
def create_quiz_variations(file_content: str, num_variations: int):
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"

    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    data = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that takes previous exams or content, and creates variations into quiz material. Where the quizes to be the exact same level of difficulty and same concepts as shown in the content, but the ordering should be different and would make it difficult for a student to cheat. If you are not given an exam, please create three questions, where each question is a random topic from the provided content"},
            {"role": "user", "content": "Keep the formatting the exact same and do not stray too far from what is seen in the provided quiz. Include the original quiz in the response so we can visually see what the changes are from. Also, if any code is written, please surround it with '```' on each side so I can format it properly on the front end. I want the original quiz at the top, with the following number of variations of the quiz. Please make exactly " + str(num_variations) + " variations of the following quiz:\n\n" + file_content},
            {"role": "assistant", "content": "Here are the variations of the quiz, each variation having a title 'Variation #' at the beginning, you do not need to number the questions, and all code blocks, please check if you provide any, must be surrounded by three '`' to indicate it is code, but otherwise do not"}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()
    
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