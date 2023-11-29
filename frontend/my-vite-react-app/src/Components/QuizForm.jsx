import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/QuizForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

function QuizFormComponent() {
	const navigate = useNavigate();
	const [responseContent, setResponseContent] = useState('');
	const [questionTypeOpen, setQuestionTypeOpen] = useState(false);
	const [questionStyleOpen, setQuestionStyleOpen] = useState(false);

	const [errorMessage, setErrorMessage] = useState(null);

	const [formData, setFormData] = useState({
		difficulty_level: '',
		topic_explanation: '',
		programming_language: '', // set default to python,
		num_questions: '',
		question_type: [],
		question_style: [],
		limit_to_uploaded: false,
		fixed_points_per_question: false,
		total_points: '',
		uploaded_material: null,
	});

	const handleChange = (e) => {
		const { name, type, value, files } = e.target;

		if (type === 'file') {
			const file = files[0];

			// Allowed MIME types for PDF, PPT, and PPTX files
			const allowedTypes = [
				'application/pdf',
				'application/vnd.ms-powerpoint',
				'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			];

			// Check if the file type is allowed
			if (!allowedTypes.includes(file.type)) {
				alert('Please upload a PDF, PPT, or PPTX file.');
				return;
			}

			// Check if the file size is less than or equal to 5 MB
			if (file.size > 5 * 1024 * 1024) {
				alert('File size must be less than or equal to 5 MB.');
				return;
			}

			setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
		} else if (type === 'checkbox') {
			setFormData((prevState) => ({ ...prevState, [name]: e.target.checked }));
		} else {
			setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

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

		// Validation check for uploading file
		if (formData.limit_to_uploaded && !formData.uploaded_material) {
			alert(
				"You must upload a file when 'Limit to Uploaded' is checked.\nUncheck if you do not want to upload a file"
			);
			return; // This stops the execution of the handleSubmit function
		} else {
			setErrorMessage(null); // Reset any previous error messages
		}

		// Validatation for number_of_questions
		const numberOfQuestions = parseInt(formData.num_questions);
		if (
			isNaN(numberOfQuestions) ||
			numberOfQuestions < 1 ||
			numberOfQuestions > 50
		) {
			alert(
				'Please enter a valid positive integer as a minimum of 1 question to maximum of 50 questions'
			);
			return;
		}

		const data = new FormData();
		for (const key in formData) {
			// If limit_to_uploaded is true and uploaded_material is not set, skip other fields
			if (formData.limit_to_uploaded && !formData.uploaded_material && key !== 'limit_to_uploaded' && key !== 'fixed_points_per_question') {
				continue;
			}
		
			// If the field is an array (like question_type) and it's empty, skip it
			if (Array.isArray(formData[key]) && formData[key].length === 0) {
				continue;
			}
		
			// If the field is a string and it's empty, skip it
			if (typeof formData[key] === 'string' && formData[key].trim() === '') {
				continue;
			}
		
			// Append non-empty fields to the FormData object
			if (Array.isArray(formData[key])) {
				formData[key].forEach((value) => data.append(key, value));
			} else {
				data.append(key, formData[key]);
			}
		}
		

		let endpoint = '/quiz_form/'; // default endpoint

		//Update formData when we don't have a programming language and question type for no_code_quiz_form function
		if (formData.programming_language === 'no coding') {
			endpoint = '/no_code_quiz_form/';
			delete formData.programming_language;
			delete formData.question_type;
		}

		axios
			.post(`http://127.0.0.1:8000/QAgenerator${endpoint}`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
			.then((response) => {
				console.log(formData)
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
						{/*if it is not coding, then set header to No Coding Quiz */}
						{formData.programming_language === 'no coding' ? (
							<h1>No Coding Quiz Form</h1>
						) : 
							<h1>Coding Quiz Form</h1>
}
						<form onSubmit={handleSubmit}>
							<div className='quiz-upload-container'>
								<label
									data-tooltip-id='label-tooltip'
									data-tooltip-content='Specify number of questions from 1 as minimum to 50 as maximum'
									id='label-header'
									className='block-display'
								>
									Question Count:
									<input
										type='number'
										name='num_questions'
										min='1'
										max='100'
										value={formData.num_questions}
										onChange={handleChange}
										className='quiz-input'
										placeholder='1-50'
									/>
								</label>
								{/* Tooltip Component */}
								<Tooltip id='label-tooltip' />
								<div className='upload-material'>
									<label
										id='label-header'
										data-tooltip-id='label-tooltip-upload'
										data-tooltip-content='Upload pdfs up to 5 MB'
									>
										Uploaded Material:
									</label>
									<input
										type='file'
										id='uploaded_material' // Add an ID to associate with the label
										name='uploaded_material'
										onChange={handleChange}
										style={{ display: 'none' }} // Hide the default input
									/>
									<Tooltip id='label-tooltip-upload' />
									<div className='upload-section'>
										<input
											type='file'
											onChange={(e) =>
												handleChange(e, setStudentAnswersFile)
											}
											accept='application/pdf'
										/>
									</div>
								</div>
							</div>

							<div className='programming-languages'>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-language'
										data-tooltip-content='Select 1 programming language'
									>
										Programming Language:
									</span>
								</label>
								<Tooltip id='label-tooltip-language' />
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
											['no coding', 'No coding'],
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
											//value={formData.programming_language}
											onChange={handleChange}
											className='other-language'
										/>
									)}
								</div>
							</div>

							<div className='difficulty-flex-container'>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-diff'
										data-tooltip-content='Select 1 difficulty level 
									'
									>
										Difficulty Level:
									</span>
								</label>
								<Tooltip id='label-tooltip-diff' />
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
							{formData.programming_language !== 'no coding' && (
								<div className='question-type'>
									<label id='label-header'>
										<span
											data-tooltip-id='label-tooltip-qtype'
											data-tooltip-content='Select at least 1 or more question types'
										>
											Question Type(s):
										</span>
									</label>
									<Tooltip id='label-tooltip-qtype' />
									<div className='dropdown-container'>
										<button
											type='button'
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
							)}

							<div className='question-style'>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-qstyle'
										data-tooltip-content='Select at least 1 or more question styles'
									>
										Question Style(s):
									</span>
								</label>
								<Tooltip id='label-tooltip-qstyle' />
								<div className='dropdown-container'>
									<button
										type='button'
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
								placeholder='Briefly explain the topic you want to generate. For example, "generate questions about iterators in Python"'
							/>

							<div>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-limit'
										data-tooltip-content='Optional to checkbox to reflect uploaded material'
									>
										Limit to Uploaded:
									</span>
									<input
										type='checkbox'
										name='limit_to_uploaded'
										checked={formData.limit_to_uploaded}
										onChange={handleChange}
									/>
								</label>
								<Tooltip id='label-tooltip-limit' />
							</div>
							{/**Fixed points per question */}
							<div className='form-field'>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-points'
										data-tooltip-content='Optional to checkbox if points for each question should be equal or not'
									>
										Fixed Points Per Question:
									</span>

									<input
										type='checkbox'
										id='fixedPointsPerQuestion'
										name='fixed_points_per_question'
										checked={formData.fixed_points_per_question}
										onChange={handleChange}
									/>
								</label>
								<Tooltip id='label-tooltip-points' />
							</div>

							<div className='total-points-container'>
								<label id='label-header' className='block-display'>
									<span
										data-tooltip-id='label-tooltip-totalpoints'
										data-tooltip-content='Enter number of points that quiz/assignment should be worth'
									>
										Total Points:
									</span>

									<input
										type='number'
										name='total_points'
										min='1'
										value={formData.total_points}
										onChange={handleChange}
										className='quiz-input'
									/>
								</label>
								<Tooltip id='label-tooltip-totalpoints' />
							</div>
							{errorMessage && <p className='error-message'>{errorMessage}</p>}
							<button type='submit' id='submitButton'>
								Submit
							</button>
						</form>
					</div>

					<Link to='/' className='back-to-homepage'>
						Back to Homepage
					</Link>
				</div>
			</div>
		</>
	);
}

export default QuizFormComponent;
