import React, { useState } from 'react';
import '../CSS/AssignmentForm.css';
import ResponseAI from './ResponseAI';
import axios from 'axios'; // Add this import
import { Link } from 'react-router-dom';

function AssignmentForm() {
	const [formData, setFormData] = useState({
		topic_explanation: '',
		programming_language: '',
		other_language: '',
		constraints: '',
		limit_to_uploaded: false,
		uploaded_material: null,
	});

	const [responseContent, setResponseContent] = useState('');

	// Before making the POST request
	const csrfToken = document.cookie
		.split('; ')
		.find((row) => row.startsWith('csrftoken='))
		.split('=')[1];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileChange = (e) => {
		setFormData((prev) => ({
			...prev,
			uploaded_material: e.target.files[0],
		}));
	};

	const handleCheckboxChange = (e) => {
		const { name, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: checked,
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const data = new FormData();
		for (const key in formData) {
			data.append(key, formData[key]);
		}
		axios
			.post('http://127.0.0.1:8000/QAgenerator/assignment_form/', data, {
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
					<h2>Assignment Form</h2>
					<form onSubmit={handleSubmit}>
						<div className='form-group'>
							<label htmlFor='topic_explanation'>Topic Explanation</label>
							<textarea
								id='topic_explanation'
								name='topic_explanation'
								value={formData.topic_explanation}
								onChange={handleInputChange}
								required
							></textarea>
						</div>

						<div className='form-group language-group'>
							<label>Programming Language</label>
							<div className='language-options'>
								{[
									{ value: 'python', label: 'Python' },
									{ value: 'java', label: 'Java' },
									{ value: 'c', label: 'C' },
									{ value: 'c++', label: 'C++' },
									{ value: 'other', label: 'Other' },
								].map((lang) => (
									<div key={lang.value} className='language-option'>
										<input
											type='radio'
											id={lang.value}
											name='programming_language'
											value={lang.value}
											onChange={handleInputChange}
											required
										/>
										<label htmlFor={lang.value}>{lang.label}</label>
									</div>
								))}
							</div>
						</div>

						{formData.programming_language === 'other' && (
							<div className='form-group'>
								<label htmlFor='other_language'>Specify Other Language</label>
								<input
									type='text'
									id='other_language'
									name='other_language'
									value={formData.other_language}
									onChange={handleInputChange}
									placeholder='Specify other language'
									required
								/>
							</div>
						)}

						<div className='form-group'>
							<label htmlFor='constraints'>Constraints</label>
							<textarea
								id='constraints'
								name='constraints'
								value={formData.constraints}
								onChange={handleInputChange}
								required
							></textarea>
						</div>

						<div className='form-group'>
							<label htmlFor='limit_to_uploaded'>
								Limit to Uploaded Material
								<input
									type='checkbox'
									id='limit_to_uploaded'
									name='limit_to_uploaded'
									checked={formData.limit_to_uploaded}
									onChange={handleCheckboxChange}
								/>
							</label>
						</div>

						<div className='form-group'>
							<label htmlFor='uploaded_material'>Uploaded Material</label>
							<input
								type='file'
								id='uploaded_material'
								name='uploaded_material'
								onChange={handleFileChange}
							/>
						</div>

						<div className='form-group'>
							<button id='submitButton' type='submit'>
								Submit
							</button>
						</div>
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

export default AssignmentForm;
