from django import forms

class QuizForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"), ("no specific language, No specific language"))

    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
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

    #Free form text
    topic_explanation = forms.CharField(max_length=100, required=False)
    
    # Select dropdowns
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.Select, required=False)
    other_language = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Specify other language'})) #fill out if different language than what's shown

    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.Select, required=False)
    num_questions = forms.IntegerField(min_value=1, max_value=50, required=False)
    
    total_points = forms.IntegerField(min_value=1, max_value=100, required=False)
    fixed_points_per_question = forms.BooleanField(required=False)

    #Multi-select dropdowns
    question_type = forms.MultipleChoiceField(choices=Q_TYPE_CHOICES, widget=forms.SelectMultiple, required=False)
    question_style = forms.MultipleChoiceField(choices=Q_STYLE_CHOICES, widget=forms.SelectMultiple, required=False)
    limit_to_uploaded = forms.BooleanField(required=False, label="Limit to uploaded material?")
    uploaded_material = forms.FileField(required=False, help_text="Upload lecture slides or notes.")

class AssignmentForm(forms.Form):
    LANGUAGE_CHOICES = (("python", "Python"), ("java", "Java"), ("c", "C"), ("c++", "C++"), ("other", "Other"), ("no specific language, No specific language"))

    topic_explanation = forms.CharField(max_length=100, required=False)
    programming_language = forms.ChoiceField(choices=LANGUAGE_CHOICES, widget=forms.Select, required=False)
    
    other_language = forms.CharField(max_length=100, required=False, widget=forms.TextInput(attrs={'placeholder': 'Specify other language'}))
    total_points = forms.IntegerField(min_value=1, max_value=100, required=False)

    constraints = forms.CharField(max_length=10000, required=False)
    fixed_points_per_question = forms.BooleanField(required=False)

    limit_to_uploaded = forms.BooleanField(required=False, label="Limit to uploaded material?")
    uploaded_material = forms.FileField(required=False, help_text="Upload lecture slides or notes.")

class NoCodeQuizForm(forms.Form):

    DIFFICULTY_CHOICES =(
        ("elementary", "Elementary"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    )
    Q_STYLE_CHOICES = (
        ("multiple_choice", "Multiple Choice"),
        ("short_answer", "Short Answer"),
        ("short_answer_and_multiple_choice", "Multiple Choice and Short Answer"),
    )

    topic_explanation = forms.CharField(max_length=10000, required=False)
    difficulty_level = forms.ChoiceField(choices=DIFFICULTY_CHOICES, widget=forms.Select, required=False)
    num_questions = forms.IntegerField(min_value=1, max_value=50, required=False)

    #Multiselect dropdown
    question_style = forms.MultipleChoiceField(choices=Q_STYLE_CHOICES, widget=forms.SelectMultiple, required=False)
    limit_to_uploaded = forms.BooleanField(required=False, label="Limit to uploaded material?")
    uploaded_material = forms.FileField(required=False, help_text="Upload lecture slides or notes.")

class QuizRefineryForm(forms.Form):
    num_variations = forms.IntegerField(min_value=1, max_value=10, required=False)
    upload_file = forms.FileField(required=False)

class UploadFileForm(forms.Form):
    quiz_file = forms.FileField(required=False)
    answer_key_file = forms.FileField(required=False)
    student_answers = forms.ImageField()