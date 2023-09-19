from django import forms

class QuizForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"))

    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("middle", "Middle School"),
        ("high", "High School"),
        ("early_college", "Early College"),
        ("advanced_college", "Advanced College"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
        ("both", "Multiple Choice and Short Answer"),
    )
    topic_explanation = forms.CharField(max_length=10000)
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.RadioSelect)
    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.RadioSelect)
    num_questions = forms.IntegerField(min_value=1, max_value=100)
    question_style = forms.ChoiceField(choices=Q_STYLE_CHOICES, widget=forms.RadioSelect)
    limit_to_uploaded = forms.BooleanField(required=True)
    uploaded_material = forms.FileField(required=False)

class AssignmentForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"))

    topic_explanation = forms.CharField(max_length=10000)
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.RadioSelect)
    
    # note that you will need to show this field if the user selects "other" for programming_language
    other_language = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Specify other language'}))
    constraints = forms.CharField(max_length=10000)
    limit_to_uploaded = forms.BooleanField(required=True)
    uploaded_material = forms.FileField(required=False)

