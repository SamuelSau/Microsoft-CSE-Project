from django.shortcuts import render, redirect
from .forms import QuizRefineryForm
import requests
import pdfplumber  # for extracting text from PDFs
from io import BytesIO 
import requests
from decouple import config
from django.shortcuts import redirect
from django.http import JsonResponse

SECRET_KEY1 = config("SECRET_KEY1")
SECRET_KEY2 = config("SECRET_KEY2")
RESOURCE_NAME = config("RESOURCE_NAME")
MODEL_NAME = config("MODEL_NAME")

def extract_text_from_pdf(file):
    # Extract text from a PDF file using pdfplumber and an in-memory file
    with pdfplumber.open(file) as pdf:
        text = " ".join(page.extract_text() for page in pdf.pages)
    return text

def create_quiz_variations(file_content, num_variations):
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"

    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    data = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that takes previous exams, and creates variations, allowing the quizes to be the exact same level of difficulty and same concepts, just in different order and would make it diffictult for a student to cheat."},
            {"role": "user", "content": "Keep the formatting the exact same and do not stray too far from what is seen in the provided quiz. Include the original quiz in the response so we can visually see what the changes are from. Also, if any code is written, please surround it with '```' on each side so I can format it properly on the front end. I want the original quiz at the top, with the following number of variations of the quiz. Please make exactly " + str(num_variations) + " variations of the following quiz:\n\n" + file_content},
            {"role": "assistant", "content": "Here are the variations of the quiz, each variation having a title 'Variation #' at the beginning, and all code blocks surrounded by three '`' to indicate it is code:"}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()
    

def exam_refine_form(request):
    if request.method == "POST":
            form = QuizRefineryForm(request.POST, request.FILES)
            if form.is_valid():
                num_variations = form.cleaned_data['num_variations']
                uploaded_file = request.FILES['upload_file']
                
                # Handle PDF in-memory without saving it permanently
                file_in_memory = BytesIO(uploaded_file.read())
                
                # Extract text from the PDF
                extracted_text = extract_text_from_pdf(file_in_memory)

                # Create quiz variations using OpenAI API
                response = create_quiz_variations(extracted_text, num_variations)
                
                #return render(request, 'exam_variations.html', {"response": response})
            
                return JsonResponse({
                "response": response,
            })
                
    #else:
        #form = QuizRefineryForm()
    return JsonResponse({"status": "Form not submitted", "message": "Please submit the form using POST method."})
