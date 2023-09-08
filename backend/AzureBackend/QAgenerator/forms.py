from django import forms

class QuizForm(forms.Form):
    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("middle", "Middle School"),
        ("high", "High School"),
        ("early_college", "Early College"),
        ("adv_college", "Advanced College"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
        ("both", "Multiple Choice and Short Answer"),
    )
    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.RadioSelect)
    num_questions = forms.IntegerField(min_value=1, max_value=100)
    question_style = forms.ChoiceField(choices=Q_STYLE_CHOICES, widget=forms.RadioSelect)
    limit_to_uploaded = forms.BooleanField(required=True, widget=forms.CheckboxInput(attrs={'checked': 'checked'}))