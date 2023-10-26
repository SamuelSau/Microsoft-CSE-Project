from django import template
import re

register = template.Library()

@register.filter(name='split_questions')
def split_questions(value):
    # Split based on question numbers like "1.", "2.", etc.
    questions = re.split(r'\d+\.', value)
    # Filter out any empty strings
    questions = [q.strip() for q in questions if q.strip()]
    # Add back the question numbers
    return [f"{i + 1}. {q}" for i, q in enumerate(questions)]
