from django import template
import re

register = template.Library()

@register.filter
def format_quiz(text_block):
    # Detect code snippets between triple backticks
    code_blocks = re.findall(r'```(.*?)```', text_block, re.DOTALL)
    
    # Replace code snippets with HTML tags for styling
    for block in code_blocks:
        formatted_block = f"<pre><code>{block}</code></pre>"
        text_block = text_block.replace(f'```{block}```', formatted_block)

    # Replace Variations header with HTML tags for styling
    variation_headers = re.findall(r'Variation \d+:', text_block)
    for header in variation_headers:
        text_block = text_block.replace(header, f"<h2>{header}</h2>")

    
    # Replace Questions and Answers headers with HTML tags for styling
    text_block = text_block.replace("Quiz:", "<h2>Quiz:</h2>").replace("Question", "<p><strong>Question</strong>")
    text_block = text_block.replace("Answer Key:", "<h2>Answer Key:</h2>").replace("Answer:", "<p><strong>Answer:</strong>")

    return text_block

@register.filter
def format_answer_key(text_block):
    # Replace single quotes with HTML tags for code styling
    text_block = re.sub(r"'(.*?)'", r'<code>\1</code>', text_block)
    
    # Replace inline code with HTML tags for code styling
    text_block = re.sub(r'`(.*?)`', r'<code>\1</code>', text_block)
    
    # Identify numbered answer sections and bold them
    text_block = re.sub(r'(\d+\.)', r'<p><strong>\1</strong></p>', text_block)

    # Add additional formatting for numbered answers with specified points
    text_block = re.sub(r'(Question \d+ \(\d+ Points\):)', r'<p><strong>\1</strong></p>', text_block)
    
    # Replace Answer headers with HTML tags for styling
    text_block = re.sub(r'Answer (\d+:)', r'<p><strong>Answer \1</strong></p>', text_block)

    # Add formatting to code snippets
    # (assumes that code snippets are either within single quotes or backticks)
    text_block = re.sub(r"def ([\w_]+)\(", r'<code>def \1(</code>', text_block)
    
    return text_block
