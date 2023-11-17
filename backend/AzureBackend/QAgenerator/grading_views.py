from django.shortcuts import render
import time
from io import BytesIO
import pdfplumber
import requests
from decouple import config
from skimage.transform import rotate
import os
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from msrest.authentication import CognitiveServicesCredentials
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes

from .forms import UploadFileForm

from deskew import determine_skew
from io import BytesIO
import numpy as np    
import cv2
# from cv2 import cv2
import base64
import pytesseract
import numpy as np
from io import BytesIO
from PIL import Image
# pylint: disable=no-member



SECRET_KEY1 = config("SECRET_KEY1")
SECRET_KEY2 = config("SECRET_KEY2")
RESOURCE_NAME = config("RESOURCE_NAME")
MODEL_NAME = config("MODEL_NAME")

VISION_KEY1 = config("VISION_KEY1")
VISION_KEY2 = config("VISION_KEY2")
VISION_RESOURCE_NAME = config("VISION_RESOURCE_NAME")
VISION_MODEL_NAME = config("VISION_MODEL_NAME")

def get_student_score(quiz, answer_key, student_answers):
    url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"

    headers = {
        "Content-Type": "application/json",
        "api-key": f"{SECRET_KEY1}"
    }

    data = {
        "messages": [
            {"role": "system", "content": "You are a professor who is grading a student's quiz. \
                The quiz questions, answer key, and student's answers are below:"},

            {"role": "user", "content": "In the quiz, the total number of points per question is \
                specified, and in the answer key, an explanation of what would be an acceptable \
                answer is described. Please evaluate the student's response and provide a score for \
                the quiz, with explanation on where the student went wrong in incorrect responses. \
                Give points awarded for each question. Keep in mind that the student answers will contain \
                only the answers in a numbered order where an answer number corresponds to the question \
                number from the quiz.\n" + "Quiz: " + quiz + "\n\nAnswer Key: " + answer_key + "\n\nStudent's Answers:" + student_answers},

            {"role": "assistant", "content": "Of course, here is the students responses structured in a \
                format as Quiz Name, and Total Points Possible on the quiz, followed by an array where each element is in form of  Question Nnumber, Points Scored per question \
                (if correct, full points; if partially correct, partial credit; if incorrect, 0 points), Feedback, Total Points scored where each line is separate by a new line:"
            }
        ]
    }

    response = requests.post(url, headers=headers, json=data)
    
    return response.json()


def extract_text_from_pdf(file):
    # extract text from a PDF file using pdfplumber and an in-memory file
    with pdfplumber.open(file) as pdf:
        text = " ".join(page.extract_text() for page in pdf.pages)
    return text

def preprocess_image_for_ocr(image_bytes):
    # Read the image from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    original_image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Convert image to grayscale
    gray_image = cv2.cvtColor(original_image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian Blur to reduce noise
    blurred_image = cv2.GaussianBlur(gray_image, (5, 5), 0)

    # Apply binary thresholding
    _, thresholded_image = cv2.threshold(blurred_image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Apply dilation to strengthen the edges
    kernel = np.ones((2,2), np.uint8)
    dilated_image = cv2.dilate(thresholded_image, kernel, iterations = 1)

    # # Determine skew angle and deskew
    # coords = np.column_stack(np.where(dilated_image > 0))
    # angle = cv2.minAreaRect(coords)[-1]
    # if angle < -45:
    #     angle = -(90 + angle)
    # else:
    #     angle = -angle
    # (h, w) = dilated_image.shape[:2]
    # center = (w // 2, h // 2)
    # M = cv2.getRotationMatrix2D(center, angle, 1.0)
    # deskewed_image = cv2.warpAffine(dilated_image, M, (w, h),
    #                                 flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)

    # Convert the processed image back to bytes
    is_success, buffer = cv2.imencode(".png", dilated_image)
    io_buf = BytesIO(buffer)

    
    
    return io_buf


def writing_to_text(image_bytes):
    # Simplified function to extract text from an image
    credentials = CognitiveServicesCredentials(VISION_KEY1)
    client = ComputerVisionClient(
        endpoint=f"https://{VISION_RESOURCE_NAME}.cognitiveservices.azure.com/",
        credentials=credentials
    )

    # Use the recognize_printed_text_in_stream method
    # results = client.recognize_printed_text_in_stream(image=BytesIO(image_bytes))
    
    results = client.recognize_printed_text_in_stream(image=image_bytes)

    # Extract and concatenate text from the results
    text = ''
    for region in results.regions:
        for line in region.lines:
            for word in line.words:
                text += word.text + ' '
            text += '\n'
    
    print(text)
    return text


def upload_files_to_grade(request):
    if request.method == 'POST':
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            quiz_file = request.FILES['quiz_file']
            answer_key_file = request.FILES['answer_key_file']
            student_answers_file = request.FILES['student_answers']

            # Extract text from PDFs
            quiz_text = extract_text_from_pdf(quiz_file)
            answer_key_text = extract_text_from_pdf(answer_key_file)

            # Extract text from student's answers (image)
            student_answers_bytes = student_answers_file.read()

            # Preprocess image for OCR
            student_answers_bytes = preprocess_image_for_ocr(student_answers_bytes)

            # Encode image to base64 so we can display it in the browser
            base64_encoded_result = base64.b64encode(student_answers_bytes.getvalue()).decode('utf-8')
            
            # Extract text from student's answers (text)
            student_text = writing_to_text(student_answers_bytes)

            # Get student score
            student_score = get_student_score(quiz_text, answer_key_text, student_text)
            student_score = student_score['choices'][0]['message']['content']
            student_score = print_resp(student_score)

            return render(request, 'student_results.html', {'text': student_score, 'base64_encoded_result': base64_encoded_result})
    else:
        form = UploadFileForm()

    return render(request, 'upload_files.html', {'form': form})


def print_resp(input_string):
    arr = []
    first_question_index = input_string.find("Question")

    if first_question_index != -1:
        # Split the input_string into two parts: before and after the first "Question"
        before_question = input_string[:first_question_index].strip()
        after_question = input_string[first_question_index:].strip()

        arr.append(before_question)

        # Split the part after the first "Question" into smaller strings at each "Question"
        split_strings = after_question.split("Question")

        # Remove any leading or trailing whitespace from each split string
        split_strings = [f'Question {split_strings[s].strip()}' for s in range(1, len(split_strings))]

        # Filter out empty strings, if any
        split_strings = [s for s in split_strings if s]
        
        for i in range(len(split_strings)-1):
            arr.append(split_strings[i])

        temp = split_strings[-1].split("Quiz")
        arr.append(temp[0])

        if len(temp) > 1:
            arr.append("Quiz" + temp[1])

        temp = split_strings[-1].split("Total")
        if len(temp) > 1:
            arr.append("Total" + temp[1])
        
    return arr