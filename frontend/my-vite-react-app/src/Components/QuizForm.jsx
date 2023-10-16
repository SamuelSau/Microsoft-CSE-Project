import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/QuizForm.css';
import ResponseAI from './ResponseAI';
import { Link } from 'react-router-dom';

function QuizFormComponent() {
	const [formData, setFormData] = useState({
		difficulty_level: '',
		topic_explanation: '',
		programming_language: '',
		num_questions: '',
		question_type: [],
		question_style: [],
		limit_to_uploaded: false,
	});

	const [responseContent, setResponseContent] = useState('');

	// Before making the POST request
	const csrfToken = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='))
		.split('=')[1];

	const [response, setResponse] = useState(null);
	const [errors, setErrors] = useState(null);

	const handleChange = (e) => {
		const { name, type, value, files } = e.target;
		if (type === 'file') {
			setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
		} else if (type === 'checkbox') {
			setFormData((prevState) => ({ ...prevState, [name]: e.target.checked }));
		} else {
			setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleCheckboxChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevState) => {
			if (prevState[name].includes(value)) {
				// If the checkbox was previously checked, we remove its value from the array
				return {
					...prevState,
					[name]: prevState[name].filter((item) => item !== value),
				};
			} else {
				// Otherwise, we add the checkbox's value to the array
				return { ...prevState, [name]: [...prevState[name], value] };
			}
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const data = new FormData();
		for (const key in formData) {
			data.append(key, formData[key]);
		}
		axios
			.post('http://127.0.0.1:8000/QAgenerator/quiz_form/', data, {
				headers: {
					'X-CSRFToken': csrfToken,
					'Content-Type': 'multipart/form-data',
				},
				withCredentials: true,
			})
			.then((response) => {
				setResponseContent(response.data);
			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code
					console.error('Response Data:', error.response.data);
					console.error('Response Status:', error.response.status);
					console.error('Response Headers:', error.response.headers);
				} else if (error.request) {
					// The request was made but no response was received
					console.error('No response received:', error.request);
				} else {
					// Something happened in setting up the request that triggered an Error
					console.error('Axios error:', error.message);
				}
				console.error('Error config:', error.config);
			});
	};

	return (
		<>
			<div className='quiz-ai-container'>
				<div className='form-container'>
					<h3>Quiz Form</h3>
					<form onSubmit={handleSubmit}>
						<textarea
							name='topic_explanation'
							value={formData.topic_explanation}
							onChange={handleChange}
							placeholder='Topic Explanation'
						/>
						<label id='label-header'>Programming Language:</label>
						<div className='flex-container'>
							{[
								['python', 'Python'],
								['java', 'Java'],
								['c', 'C'],
								['other', 'Other'],
							].map(([value, label]) => (
								<label key={value}>
									<input
										type='radio'
										name='programming_language'
										value={value}
										checked={formData.programming_language === value}
										onChange={handleChange}
									/>
									{label}
								</label>
							))}
						</div>
						<label id='label-header'>Difficulty Level:</label>
						<div className='flex-container'>
							{[
								['elementary', 'Elementary'],
								['intermediate', 'Intermediate'],
								['advanced', 'Advanced'],
							].map(([value, label]) => (
								<label key={value}>
									<input
										type='radio'
										name='difficulty_level'
										value={value}
										checked={formData.difficulty_level === value}
										onChange={handleChange}
									/>
									{label}
								</label>
							))}
						</div>

						<div>
							<label id='label-header'>
								Number of Questions:
								<input
									type='number'
									name='num_questions'
									min='1'
									max='100'
									value={formData.num_questions}
									onChange={handleChange}
								/>
							</label>
						</div>
						<label id='label-header'>Question Type:</label>
						<div className='flex-container'>
							{[
								['syntax', 'Syntax'],
								['logic', 'Logic'],
								['bug_fix', 'Bug Fix'],
								['bug_identification', 'Bug Identification'],
								['code_analysis', 'Code Analysis'],
								['code_completion', 'Code Completion'],
								['code_output', 'Code Output'],
								['code_writing', 'Code Writing'],
							].map(([value, label]) => (
								<label key={value}>
									<input
										type='checkbox'
										name='question_type'
										value={value}
										checked={formData.question_type.includes(value)}
										onChange={handleCheckboxChange}
									/>
									{label}
								</label>
							))}
						</div>
						<div className='flex-container'>
							<label id='label-header'>Question Style:</label>
							{[
								['multiple_choice', 'Multiple Choice'],
								['short_answer', 'Short Answer'],
							].map(([value, label]) => (
								<label key={value}>
									<input
										type='checkbox'
										name='question_style'
										value={value}
										checked={formData.question_style.includes(value)}
										onChange={handleCheckboxChange}
									/>
									{label}
								</label>
							))}
						</div>

						<div>
							<label id='label-header'>
								Limit to Uploaded:
								<input
									type='checkbox'
									name='limit_to_uploaded'
									checked={formData.limit_to_uploaded}
									onChange={handleChange}
								/>
							</label>
						</div>

						<div>
							<label id='label-header'>
								Uploaded Material:
								<input
									type='file'
									name='uploaded_material'
									onChange={handleChange}
								/>
							</label>
						</div>
						<button type='submit' id='submitButton'>
							Submit
						</button>
					</form>
				</div>
				<div className='response-section'>
					<ResponseAI response={responseContent} />
				</div>
				<Link to='/' className='back-to-homepage'>
					Back to Homepage
				</Link>
			</div>
		</>
	);
}

export default QuizFormComponent;
