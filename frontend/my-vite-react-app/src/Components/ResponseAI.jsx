import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../CSS/ResponseAI.css';

function ResponseAI(props) {
	const [messageContent, setMessageContent] = useState('');
	const [originalQuiz, setOriginalQuiz] = useState('');
	const [quizName, setQuizName] = useState('');
	const location = useLocation();
	const [modifications, setModifications] = useState('');

	// Before making the POST request
	let csrfCookie = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='));

	const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;

	const handleModify = async (e) => {
		try {
			e.preventDefault();
			const data = new FormData();
			for (const key in formData) {
				data.append(key, formData[key]);
			}

			const response = await fetch(
				'http://127.0.0.1:8000/QAgenerator/modify_quiz/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'multipart/form-data',
						'X-CSRFToken': csrfToken, // Here's the important part!
					},
					body: formData,
				}
			);

			const responseData = await response.json();
			setOriginalQuiz(responseData.original_quiz); // Update the original quiz with the modified content
			setMessageContent(responseData.answer_key); // Update the answer key based on your state variable name
			setModifications(''); // Clear the textarea
		} catch (error) {
			console.error('Error modifying the quiz:', error);
		}
	};

	useEffect(() => {
		const responseData = location.state?.responseData;
		const answerKeyContent =
			responseData?.answer_key?.choices?.[0]?.message?.content;
		const originalQuizContent = responseData?.original_quiz;
		const content = responseData?.response?.choices?.[0].message?.content;
		const quizName = content.split('\n')[0];

		if (answerKeyContent) {
			setMessageContent(answerKeyContent);
		}
		if (originalQuizContent) {
			setOriginalQuiz(originalQuizContent);
		}

		if (quizName) {
			setQuizName(quizName);
		}
	}, [props]);

	return (
		<div className='outer-container'>
			<div className='response-container'>
				<div className='questions'>
					<h1>{quizName}</h1>
					<pre>{originalQuiz}</pre>
					<div className='modifications-wrapper'>
						<textarea
							className='modifications-textarea'
							placeholder='Type your modifications here...'
							value={modifications}
							onChange={(e) => setModifications(e.target.value)}
						/>
						<button className='modify-button' onClick={handleModify}>
							Modify
						</button>
					</div>
				</div>
				<div className='answers'>
					<h1>Answer Key</h1>
					<pre>{messageContent}</pre>
				</div>
			</div>
		</div>
	);
}

export default ResponseAI;
