from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from QAgenerator.forms import QuizForm, AssignmentForm
import requests
from decouple import config
from django.shortcuts import redirect


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

def get_quiz_answer_key(response):
    quiz =  response['choices'][0]['message']['content']
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"
    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }
    data = {
        "messages": [
            {"role": "system", "content": "You are a highly skilled TA that grades quizzes and assignments for educators."},
            {"role": "user", "content": "Given the following quiz, provide a correct answer for each question asked. Ensure it is correct, especially for code questions. Do not add any excessive explanation, and do not add any questions that are not present in the quiz. Provide consice explanations.\nThe quiz is as follows:" + quiz}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def quiz_form(request):
    if request.method == "POST":
        form = QuizForm(request.POST, request.FILES)
        if form.is_valid():
            data = form.cleaned_data

            user_message = f"Write a coding quiz in the programming language {data['programming_language']} with exactly {data['num_questions']} questions, do not go over this number. The quiz should be in a {data['question_style']} format that ensures that the student is tested on their understanding of syntax and logic. The topics for this quiz are {data['topic_explanation']}. So ensure that each topic is covered in the quiz. The type of questions that can be on this quiz are: {data['question_type']}. The difficulty level of the quiz should be {data['difficulty_level']}."
            if data['difficulty_level'] == 'elementary':
                easy_q = """def greet(name):
                                return "Hello, " + name + "!"
                            message = greet("Alice")

                            After the above code is executed, what will the variable message contain? 
                        """
                user_message+= " The questions should be simple and straightforward. An example of an elementary question would be: " + easy_q
            elif data['difficulty_level'] == 'intermediate':
                medium_q = """def process_data(nums):
                                return [x for x in nums if x%2==0 and x%3!=0]

                            data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                            result = process_data(data)

                            After executing the above code, what will the result list will contain? 
                        """
                user_message+= " The questions should be a bit complex and require a bit more thought than first glance. An example of an intermediate question would be: " + medium_q
            elif data['difficulty_level'] == 'advanced':
                hard_q = """def f(x):
                                if x == 0:
                                    return 0
                                else:
                                    return x + f(x-1)

                            What is the value of f(3)?
                        """
                user_message+= " The questions should be complex and require a lot of thought. An example of an advanced question would be: " + hard_q
            
            if data['programming_language'] == 'other':
                user_message += f" The specified language is {data['other_language']}."
            
            if data['question_style'] == 'short_answer' or data['question_style'] == 'both':
                user_message+= " The types of short answer style questions present in the quiz. The first is questions that give the student a very small snippet of code in the language selected and they must respond with what it will output. The second is questions that ask for a very small snippet of code in the language that fulfils a request."
            

            user_message+= "\n In regards to formatting, don't include the type of question in the question itself. For example, don't say 'Question 1 (syntax)', just say 'Question 1'. Also, don't include the answer in the question itself. For example, don't say 'Question 1: What is the output of the following code? print(1+1) Answer: 2', just say 'Question 1: What is the output of the following code? print(1+1)'. Also do not include any notes from the TA in the quiz."
            user_message+= "\n Double check all questions including the code snippets to ensure that they are correct."
            
            response = send_message_to_openai(user_message)
            answer_key = get_quiz_answer_key(response)

            return render(request, 'results.html', {"response": response, "answer_key": answer_key, "original_quiz": response['choices'][0]['message']['content']})
    else:
        form = QuizForm()
    return render(request, 'quiz_form.html', {"form": form})

def modify_quiz(request):
    if request.method == "POST":
        original_quiz = request.POST['original_quiz']
        modifications = request.POST['modifications']

        # Concatenate the original request with modifications
        new_request = "Given the following quiz:" + original_quiz + "\nPlease make the following modifications, but keep absolutely everything else the same except for the question numbers(if questions are removed).\nModifications:" + modifications

        new_request+= "\nIn regards to formatting, don't include the type of question in the question itself. For example, don't say 'Question 1 (syntax)', just say 'Question 1'. Also, don't include the answer in the question itself. For example, don't say 'Question 1: What is the output of the following code? print(1+1) Answer: 2', just say 'Question 1: What is the output of the following code? print(1+1)'. Also do not include any notes from the TA in the quiz."

        response = send_message_to_openai(new_request)
        answer_key = get_quiz_answer_key(response)

        return render(request, 'results.html', {"response": response, "answer_key": answer_key, "original_quiz": response['choices'][0]['message']['content']})

    # Redirect to home or some error page if not a POST request
    return redirect('home')


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


