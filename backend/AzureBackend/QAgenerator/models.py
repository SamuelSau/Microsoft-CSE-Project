from django.db import models
from django.conf import settings


User = settings.AUTH_USER_MODEL

# Create your models here.
class GeneratedText(models.Model):
    title = models.CharField(max_length=200)
    assignment_text = models.CharField(max_length=10000)
    def __str__(self):
        return self.assignment_text
    
class AnswerKey(models.Model):
    quiz_or_assignment = models.ForeignKey(GeneratedText, on_delete=models.CASCADE)
    answer_key_text = models.CharField(max_length=10000)
    def __str__(self):
        return self.assignment_text