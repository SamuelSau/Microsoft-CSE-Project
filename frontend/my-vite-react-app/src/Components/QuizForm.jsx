import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/QuizForm.css';
import ResponseAI from './ResponseAI';
import { Link, useNavigate } from 'react-router-dom';

function QuizFormComponent() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		difficulty_level: '',
		topic_explanation: '',
		programming_language: '',
		num_questions: '',
		question_type: [],
		question_style: [],
		limit_to_uploaded: false,
		total_points: '',
	});

	const [responseContent, setResponseContent] = useState('');

	// Before making the POST request
	let csrfCookie = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='));

	const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
	
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

	const [questionTypeOpen, setQuestionTypeOpen] = useState(false);
	const [questionStyleOpen, setQuestionStyleOpen] = useState(false);

	function handleCheckboxChange(event) {
		const { name, value } = event.target;

		// Create a copy of the current form data
		const updatedFormData = { ...formData };

		if (updatedFormData[name].includes(value)) {
			// If the value already exists, remove it
			updatedFormData[name] = updatedFormData[name].filter(
				(item) => item !== value
			);
		} else {
			// Otherwise, add the value
			updatedFormData[name] = [...updatedFormData[name], value];
		}

		setFormData(updatedFormData);
	}

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
				navigate('/response', { state: { responseData: response.data } });
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
					<div className='inner-container'>
						<h1>Quiz Form</h1>
						<form onSubmit={handleSubmit}>
							<div className='quiz-upload-container'>
								<label id='label-header' className='block-display'>
									Quiz Length:
									<input
										type='number'
										name='num_questions'
										min='1'
										max='100'
										value={formData.num_questions}
										onChange={handleChange}
										className='quiz-input'
									/>
								</label>
								<div className='upload-material'>
									<label id='label-header'>Uploaded Material:</label>
									<input
										type='file'
										id='uploaded_material' // Add an ID to associate with the label
										name='uploaded_material'
										onChange={handleChange}
										style={{ display: 'none' }} // Hide the default input
									/>
									<label
										htmlFor='uploaded_material'
										className='custom-upload-button'
									>
										<img
											src='/svgs/upload-svgrepo-com.svg'
											alt='Upload Icon'
											className='upload-icon'
										/>
									</label>
								</div>
							</div>

							<div className='programming-languages'>
								<label id='label-header'>Programming Language:</label>
								<div className='language-flex-container'>
									<select
										name='programming_language'
										value={formData.programming_language}
										onChange={handleChange}
									>
										{[
											['python', 'Python'],
											['java', 'Java'],
											['c', 'C'],
											['other', 'Other'],
										].map(([value, label]) => (
											<option key={value} value={value}>
												{label}
											</option>
										))}
									</select>

									{formData.programming_language === 'other' && (
										<input
											type='text'
											placeholder='Enter language'
											name='other_programming_language'
											value={formData.other_programming_language || ''}
											onChange={handleChange}
											className='other-language'
										/>
									)}
								</div>
							</div>

							<div class='difficulty-flex-container'>
								<label id='label-header'>Difficulty Level:</label>
								<select
									name='difficulty_level'
									value={formData.difficulty_level}
									onChange={handleChange}
								>
									<option value='elementary'>Elementary</option>
									<option value='intermediate'>Intermediate</option>
									<option value='advanced'>Advanced</option>
								</select>
							</div>
							<div className='question-type'>
								<label id='label-header'>Question Type(s):</label>
								<div className='dropdown-container'>
									<button
										onClick={() => setQuestionTypeOpen(!questionTypeOpen)}
									>
										Select Question Type(s)
									</button>
									{questionTypeOpen && (
										<div className='dropdown-menu'>
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
									)}
								</div>
							</div>

							<div className='question-style'>
								<label id='label-header'>Question Style(s):</label>
								<div className='dropdown-container'>
									<button
										onClick={() => setQuestionStyleOpen(!questionStyleOpen)}
									>
										Select Question Style(s)
									</button>
									{questionStyleOpen && (
										<div className='dropdown-menu'>
											{[
												['multiple_choice', 'Multiple Choice'],
												['short_answer', 'Short Answer'],
												// ... add more styles if needed
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
									)}
								</div>
							</div>

							<textarea
								name='topic_explanation'
								value={formData.topic_explanation}
								onChange={handleChange}
								placeholder='Topic Explanation'
							/>

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
							<div className='total-points-container'>
								<label id='label-header' className='block-display'>
									Total Points:
									<input
										type='number'
										name='total_points'
										min='1'
										value={formData.total_points}
										onChange={handleChange}
										className='quiz-input'
									/>
								</label>
							</div>
							<button type='submit' id='submitButton'>
								Submit
							</button>
						</form>
					</div>
					{/* <div className='response-section'>
					<ResponseAI response={responseContent} />
				</div> */}

					<Link to='/' className='back-to-homepage'>
						Back to Homepage
					</Link>
				</div>
			</div>
		</>
	);
}

export default QuizFormComponent;
