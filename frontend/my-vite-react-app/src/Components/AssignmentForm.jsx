import React, { useState } from 'react';
import '../CSS/QuizForm.css';
import axios from 'axios'; // Add this import
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

function AssignmentForm() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		topic_explanation: '',
		programming_language: '',
		constraints: '',
		limit_to_uploaded: false,
		fixed_points_per_question: false,
		uploaded_material: null,
	});

	const [responseContent, setResponseContent] = useState('');
	const [errorMessage, setErrorMessage] = useState('');

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

	const handleSubmit = (e) => {
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

		const data = new FormData();
		for (const key in formData) {
			// If limit_to_uploaded is true and uploaded_material is not set, skip other fields
			if (
				formData.limit_to_uploaded &&
				!formData.uploaded_material &&
				key !== 'limit_to_uploaded' &&
				key !== 'fixed_points_per_question'
			) {
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
		axios
			.post('http://127.0.0.1:8000/QAgenerator/assignment_form/', data, {
				headers: {
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
						<h1>Assignment Form</h1>
						<form onSubmit={handleSubmit}>
							<div className='quiz-upload-container'>
								<Tooltip id='label-tooltip' />
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
												onChange={handleChange}
												className='other-language'
											/>
										)}
									</div>
								</div>
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
							<textarea
								name='topic_explanation'
								value={formData.topic_explanation}
								onChange={handleChange}
								placeholder='Briefly explain the topic you want to generate. For example, "generate questions about iterators in Python"'
							/>

							<textarea
								name='constraints'
								value={formData.constraints}
								onChange={handleChange}
								placeholder='Write constraints that apply to the content. E.g. "Make the questions easy for an intro to programming course"'
							/>

							<div>
								<label id='label-header'>
									<span
										data-tooltip-id='label-tooltip-limit'
										data-tooltip-content='Optional to checkbox and want to reflect uploaded material'
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

export default AssignmentForm;
