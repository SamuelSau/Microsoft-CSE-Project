from django import forms

class QuizForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"))

    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
        ("both", "Multiple Choice and Short Answer"),
    )
    Q_TYPE_CHOICES = (
        ("syntax", "Syntax"),
        ("logic", "Logic"),
        ("bug_fix", "Bug Fix"),
        ("bug_identification", "Bug Identification"),
        ("code_analysis", "Code Analysis"),
        ("code_completion", "Code Completion"),
        ("code_output", "Code Output"),
        ("code_writing", "Code Writing"),

    )
    topic_explanation = forms.CharField(max_length=10000)
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.RadioSelect)
    other_language = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Specify other language'}))

    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.RadioSelect)
    num_questions = forms.IntegerField(min_value=1, max_value=100)
    question_type = forms.MultipleChoiceField(choices=Q_TYPE_CHOICES, widget=forms.CheckboxSelectMultiple)
    question_style = forms.ChoiceField(choices=Q_STYLE_CHOICES, widget=forms.RadioSelect)
    # limit_to_uploaded = forms.BooleanField(required=True)
    # uploaded_material = forms.FileField(required=False)

class AssignmentForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"))

    topic_explanation = forms.CharField(max_length=10000)
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.RadioSelect)
    
    # note that you will need to show this field if the user selects "other" for programming_language
    other_language = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Specify other language'}))
    constraints = forms.CharField(max_length=10000)
    # limit_to_uploaded = forms.BooleanField(required=True)
    # uploaded_material = forms.FileField(required=False)


class NoCodeQuizForm(forms.Form):

    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
        ("both", "Multiple Choice and Short Answer"),
    )

    topic_explanation = forms.CharField(max_length=10000)
    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.RadioSelect)
    num_questions = forms.IntegerField(min_value=1, max_value=100)
    question_style = forms.ChoiceField(choices=Q_STYLE_CHOICES, widget=forms.RadioSelect)