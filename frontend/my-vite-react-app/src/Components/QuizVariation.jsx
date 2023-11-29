import React, { useState } from 'react';
import axios from 'axios';
import '../CSS/QuizForm.css';
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

function QuizVariation() {
	const navigate = useNavigate();
	const [responseContent, setResponseContent] = useState('');
	const [uploadedFileName, setUploadedFileName] = useState(''); // State to store the filename

	const [formData, setFormData] = useState({
		num_variations: 0,
		upload_file: null,
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

			setUploadedFileName(file.name);

			// If the file passes the checks, update the state
			setFormData((prevState) => ({ ...prevState, [name]: file }));
		} else {
			setFormData((prevState) => ({ ...prevState, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = new FormData();
		for (const key in formData) {
			data.append(key, formData[key]);
		}

		if (!formData.num_variations) {
			alert('Please enter positive value for number of variations');
			return;
		}

		// Validation check for uploading file
		if (!formData.upload_file) {
			alert('You must upload a file to create variations');
			return;
		}

		axios
			.post(`http://127.0.0.1:8000/QAgenerator/exam_refinery/`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
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
			<div className='form-container'>
				<div className='inner-container'>
					<h1>Create variations</h1>
					<form onSubmit={handleSubmit}>
						<div className='quiz-upload-container'>
							<div className='child'>
							<label
								data-tooltip-id='label-tooltip'
								data-tooltip-content='Specify number of variations for this content'
								id='label-header'
								className='block-display'
							>
								Number of variations:
								<input
									type='number'
									name='num_variations'
									min='1'
									max='10'
									value={formData.num_variations}
									onChange={handleChange}
									className='quiz-input'
									placeholder='1-10'
								/>
							</label>
							{/* Tooltip Component */}
							<Tooltip id='label-tooltip' />
							</div>
							<div className='child'>
								<label>Upload file</label>
								<input
									type='file'
									onChange={(e) => handleChange(e, setStudentAnswersFile)}
									accept='application/pdf'
								/>
							</div>
							<Tooltip id='label-tooltip-upload' />
							<div className='child'>
							<button type='submit' id='submitButton'>
								Submit
							</button>
							</div>
						</div>
					</form>
					<Link to='/' className='back-to-homepage'>
						Back to Homepage
					</Link>
				</div>
			</div>
		</>
	);
}

export default QuizVariation;
