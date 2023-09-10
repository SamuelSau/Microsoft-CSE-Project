from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('send_post_request/', views.send_post_request, name='send_post_request'),
]