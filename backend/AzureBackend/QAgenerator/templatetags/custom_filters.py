from django import template
import re

register = template.Library()

@register.filter(name='markdown_to_html')
def markdown_to_html(value):
    # Replace code snippets with <pre> and </pre> tags
    value = re.sub(r"```python", "<pre><code>", value)
    value = re.sub(r"```", "</code></pre>", value)
    
    # Handle "Title of Quiz"
    value = re.sub(r"Title of Quiz: (.+?) ", r"<strong>\1</strong><br><br>", value)

    # Separate questions and their answers with line breaks
    value = re.sub(r"(\d+\.)", r"<br>\1", value)
    value = re.sub(r" Answer:", r"<br>Answer:", value)

    return value
