from django.shortcuts import render
from QAgenerator.forms import QuizForm, AssignmentForm, NoCodeQuizForm
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
            {"role": "user", "content": "Given the following quiz, provide a correct answer for each question asked. Ensure it is correct, especially for code questions. Do not add any excessive explanation, and do not add any questions that are not present in the quiz. Provide only one sentance explaining what would qualify the student for earning full points in the question.\nThe quiz is as follows:\n" + quiz}
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    return response.json()

def turn_to_html(quiz, answer_key):
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"
    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    sample_quiz = """
                Quiz on For Loops in Python Question 1: Write a for loop that will print out the numbers 1 to 5. Question 2: Given the following list of numbers: `nums = [2, 4, 6, 8, 10]`, write a for loop that will print out each number in the list. Question 3: Fill in the missing code below to add up all the numbers in the list `nums` using a for loop and print out the result: ``` nums = [5, 10, 15, 20] total = 0 for num in nums: # missing code print(total) ```
                """
    sample_answer_key = """
                1. `for i in range(1, 6): print(i)` 2. ``` for num in nums: print(num) ``` 3. ``` nums = [5, 10, 15, 20] total = 0 for num in nums: total += num print(total) ```
                """
    sample_html = """
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quiz on For Loops in Python</title>
        <style>
            code {
                font-family: monospace;
                background-color: #f2f2f2;
                padding: 2px 4px;
                display: block;
            }
        </style>
    </head>
    <body>
        <h1>Quiz on For Loops in Python</h1>
        <div id="quiz">
            <p><b>Question 1:</b> Write a for loop that will print out the numbers 1 to 5.</p>
            <p><b>Question 2:</b> Given the following list of numbers: <code>nums = [2, 4, 6, 8, 10]</code>, write a for loop that will print out each number in the list.</p>
            <p><b>Question 3:</b> Fill in the missing code below to add up all the numbers in the list <code>nums</code> using a for loop and print out the result: 
                <code>
                    nums = [5, 10, 15, 20] <br>
                    total = 0 <br>
                    for num in nums: <br>
                    &nbsp;   # missing code <br>
                    print(total)
                </code>
            </p>
        </div>

        <h2>Answer Key:</h2>
        <div id="answer-key">
            <p><b>1.</b> 
                <code>for i in range(1, 6): print(i)</code>
            </p>
            <p><b>2.</b>
                <code>
                    for num in nums: <br>
                    &nbsp;   print(num)
                </code>
            </p>
            <p><b>3.</b> 
                <code>
                    nums = [5, 10, 15, 20] <br>
                    total = 0 <br>
                    for num in nums: <br>
                    &nbsp;   total += num <br>
                    print(total)
                </code>
            </p>
        </div>
    </body>
    """


    data = {
        "messages": [
            {"role": "system", "content": "You are a highly skilled HTML developer that is easily able to format blocks of text into readable and working HTML code."},
            {"role": "user", "content": "Given the following quiz and answer key, make executable HTML code that I can manually insert into an HTML file to show the questions of the quiz and the answer key. If there is any code present in the questions or answer key, please format them in a way that will make them look like it is code.\nQUIZ:\n" + sample_quiz + "\nANSWER KEY:\n" + sample_answer_key},
            {"role": "assistant", "content": sample_html},
            {"role": "user", "content": "Given the following quiz and answer key, make executable HTML code that I can manually insert into an HTML file to show the questions of the quiz and the answer key. If there is any code present in the questions or answer key, please format them in a way that will make them look like it is code.\nQUIZ:\n" + quiz + "\nANSWER KEY:\n" + answer_key},
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    response = response.json()
    return response['choices'][0]['message']['content']



def no_code_quiz_form(request):
    html = ""
    if request.method == "POST":
        form = NoCodeQuizForm(request.POST, request.FILES)
        if form.is_valid():
            data = form.cleaned_data

            user_message = f"Write a {data['difficulty_level']} difficulty level quiz with exactly {data['num_questions']} questions, do not go over this number. The quiz should be in a {data['question_style']} format that ensures that the student is tested on their understanding of the topic and complexities behind the question. The topics for this quiz are {data['topic_explanation']}, so ensure that each topic is covered in the quiz. The difficulty level of the quiz should be {data['difficulty_level']}."
            if data['difficulty_level'] == 'elementary':
                user_message+= " The questions should be simple and straightforward."
            elif data['difficulty_level'] == 'intermediate':
                user_message+= " The questions should be a bit complex and require a bit more thought than first glance."
            elif data['difficulty_level'] == 'advanced':
                user_message+= " The questions should be complex and require a lot of thought."
            
            if data['question_style'] == 'short_answer' or data['question_style'] == 'short_answer_and_multiple_choice':
                user_message+= " The types of short answer style questions present in the quiz are ones that challenge the student to elaborate on their answer so that it is clear they understand the answer. These can include fill in the blank, short response, etc."
            

            user_message+= "\n In regards to formatting, don't include the type of question in the question itself. For example, don't say 'Question 1 (syntax)', just say 'Question 1'. Also, don't include the answer in the question itself. For example, don't say 'Question 1: What is the output of the following code? print(1+1) Answer: 2', just say 'Question 1: What is the output of the following code? print(1+1)'. Also do not include any notes from the TA in the quiz. Do not include the answer key."
            user_message+= "\n Double check all questions to ensure that they are correct."
            
            response = send_message_to_openai(user_message)
            answer_key = get_quiz_answer_key(response)

            # html = turn_to_html(response['choices'][0]['message']['content'], answer_key['choices'][0]['message']['content'])

            return render(request, 'results.html', {"response": response, "answer_key": answer_key, "original_quiz": response['choices'][0]['message']['content'], "html": html})
    else:
        form = NoCodeQuizForm()
    return render(request, 'quiz_form.html', {"form": form})


def quiz_form(request):
    html = ""
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
            
            if data['question_style'] == 'short_answer' or data['question_style'] == 'short_answer_and_multiple_choice':
                user_message+= " There are two types of short answer style questions present in the quiz. The first is questions that give the student a very small snippet of code in the language selected and they must respond with what it will output. The second is questions that ask for a very small snippet of code in the language that fulfils a request."
            
            user_message+= f"\nThis quiz will be graded for a total of {data['total_points']} points. Please show the total points at the top of the quiz."
            if data['fixed_points_per_question']:
                user_message+= " Each question will be worth the same amount of points."
            else:
                user_message+= " Each question will be worth a different amount of points. The points for each question should vary based on the difficulty of the question, but the total points of the collective questions should not exceed the number of points of the quiz. "
            user_message+= "Please include the number of points each question is worth in the question itself. For example, 'Question 1 (5 Points)'."
            
            user_message+= "\n In regards to formatting, don't include the type of question in the question itself. For example, don't say 'Question 1 (syntax)', just say 'Question 1'. Also, don't include the answer in the question itself. For example, don't say 'Question 1: What is the output of the following code? print(1+1) Answer: 2', just say 'Question 1: What is the output of the following code? print(1+1)'. Also do not include any notes from the TA in the quiz."
            user_message+= "\n Double check all questions including the code snippets to ensure that they are correct."
            

            response = send_message_to_openai(user_message)
            answer_key = get_quiz_answer_key(response)

            # html = turn_to_html(response['choices'][0]['message']['content'], answer_key['choices'][0]['message']['content'])

            return render(request, 'results.html', {"response": response, "answer_key": answer_key, "original_quiz": response['choices'][0]['message']['content'], "html": html})
    else:
        form = QuizForm()
    return render(request, 'quiz_form.html', {"form": form})

def modify_quiz(request):
    html = ""
    if request.method == "POST":
        original_quiz = request.POST['original_quiz']
        modifications = request.POST['modifications']

        # Concatenate the original request with modifications
        new_request = "Given the following quiz:" + original_quiz + "\nPlease make the following modifications, but keep absolutely everything else the same except for the question numbers(if questions are removed).\nModifications:" + modifications

        new_request+= "\nIn regards to formatting, don't include the type of question in the question itself. For example, don't say 'Question 1 (syntax) (5 Points)', just say 'Question 1 (5 Points)'. Also, don't include the answer in the question itself. For example, don't say 'Question 1: What is the output of the following code? print(1+1) Answer: 2', just say 'Question 1: What is the output of the following code? print(1+1)'. Also do not include any notes from the TA in the quiz."

        response = send_message_to_openai(new_request)
        answer_key = get_quiz_answer_key(response)
        
        # html = turn_to_html(response['choices'][0]['message']['content'], answer_key['choices'][0]['message']['content'])

        return render(request, 'results.html', {"response": response, "answer_key": answer_key, "original_quiz": response['choices'][0]['message']['content'], "html": html})

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
            return render(request, 'assig.html', {"response": response})
    else:
        form = AssignmentForm()
    return render(request, 'assignment_form.html', {"form": form})


