from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import requests
import json
from decouple import config

SECRET_KEY1 = config("SECRET_KEY1")
SECRET_KEY2 = config("SECRET_KEY2")
RESOURCE_NAME = config("RESOURCE_NAME")
MODEL_NAME = config("MODEL_NAME")

def index(request):
    return HttpResponse("Hello, world. You're at the QAGENERATOR index.")

@require_POST
@csrf_exempt
def send_post_request(request):
    if request.method == 'POST':
        url = f"https://{RESOURCE_NAME}.openai.azure.com/openai/deployments/{MODEL_NAME}/chat/completions?api-version=2023-05-15"
        
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode)
        user_message = body_data.get('message')

        headers = {
            "Content-Type": "application/json",
            "api-key": f"{SECRET_KEY1}"
        }
        
        data = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that generates quizzes and assignments for educators."},
                {"role": "user", "content": user_message}
            ]
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        return JsonResponse(response.json(), safe=False)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=400)
