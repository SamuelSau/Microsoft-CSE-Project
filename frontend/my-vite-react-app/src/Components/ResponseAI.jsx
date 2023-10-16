import React, { useState, useEffect } from 'react';
import '../CSS/ResponseAI.css';

function ResponseAI({ response }) {
	const [messageContent, setMessageContent] = useState('');
	const [originalQuiz, setOriginalQuiz] = useState('');
	
	useEffect(() => {

		const answerKeyContent = response?.answer_key?.choices?.[0]?.message?.content;
		const originalQuizContent = response?.original_quiz;

		if (answerKeyContent) {
			setMessageContent(answerKeyContent);
		}
		if (originalQuizContent) {
			setOriginalQuiz(originalQuizContent);
		}
	}, [response]);

	return (
		<div className='response-container'>
			<h3>Generated Content</h3>
			<div className='scrollable-content'>
				<h4>Original Quiz</h4>
				<pre>{originalQuiz}</pre>
				
				<h4>Answer Key</h4>
				<pre>{messageContent}</pre>
			</div>
		</div>
	);
}

export default ResponseAI;
