from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('quiz_form/', views.quiz_form, name='quiz_form'),
    path('assignment_form/', views.assignment_form, name='assignment_form'),
    path('modify_quiz/', views.modify_quiz, name='modify_quiz'),
]
