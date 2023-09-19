from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from QAgenerator.forms import QuizForm, AssignmentForm
import requests
from decouple import config

SECRET_KEY1 = config("SECRET_KEY1")
SECRET_KEY2 = config("SECRET_KEY2")
RESOURCE_NAME = config("RESOURCE_NAME")
MODEL_NAME = config("MODEL_NAME")

def home(request):
    return render(request, 'home.html')

def send_message_to_openai(message_content):
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"

    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    data = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant that generates quizzes and assignments for educators."},
            {"role": "user", "content": message_content}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()


def quiz_form(request):
    if request.method == "POST":
        form = QuizForm(request.POST, request.FILES)
        if form.is_valid():
            data = form.cleaned_data
            user_message = f"Generate a {data['difficulty_level']} level quiz on {data['topic_explanation']} in the programming language {data['programming_language']} with {data['num_questions']} questions in {data['question_style']} format. If it is a college level quiz, please make it difficult, no easy questions, we want to test the students understanding of syntax and logic."
            if data['question_style'] == 'short_answer':
                user_message+= " There should be two types of short answer style questions present in the quiz. The first is questions that give the student a very small snippet of code in the language selected and they must respond with what it will output. The second is questions that ask for a very small snippet of code in the language that fulfils a request."

            if data['limit_to_uploaded']:
                user_message += " The quiz should be limited to the uploaded material."
            response = send_message_to_openai(user_message)
            return render(request, 'results.html', {"response": response})
    else:
        form = QuizForm()
    return render(request, 'quiz_form.html', {"form": form})

def assignment_form(request):
    if request.method == "POST":
        form = AssignmentForm(request.POST, request.FILES)
        if form.is_valid():
            data = form.cleaned_data
            user_message = f"Generate an assignment on {data['topic_explanation']} in {data['programming_language']} language with the following constraints: {data['constraints']}."

            if data['programming_language'] == 'other':
                user_message += f" The specified language is {data['other_language']}."

            response = send_message_to_openai(user_message)
            return render(request, 'results.html', {"response": response})
    else:
        form = AssignmentForm()
    return render(request, 'assignment_form.html', {"form": form})



# @require_POST
# @csrf_exempt
# def send_post_request(request):
#     if request.method == 'POST':
#         url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"
        
#         body_unicode = request.body.decode('utf-8')
#         body_data = json.loads(body_unicode)
#         user_message = body_data.get('message')

#         headers = {
#             "Content-Type": "application/json",
#             "api-key": f"{SECRET_KEY1}"
#         }
        
#         data = {
            
#             "messages": [
#                 {"role": "system", "content": "You are a helpful assistant that generates quizzes and assignments for educators."},
#                 {"role": "user", "content": user_message}
#             ]
#         }
        
#         response = requests.post(url, headers=headers, json=data)
        
#         return JsonResponse(response.json(), safe=False)
#     else:
#         return JsonResponse({'error': 'Only POST method is allowed'}, status=400)
