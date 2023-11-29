import React, { useState } from 'react';
import '../CSS/GradingQuiz.css';
import axios from 'axios'; // Add this import
import { Link, useNavigate } from 'react-router-dom';

function GradingQuiz() {
	const [quizFile, setQuizFile] = useState(null);
	const [answerKeyFile, setAnswerKeyFile] = useState(null);
	const [studentAnswersFile, setStudentAnswersFile] = useState(null);
    const navigate = useNavigate();

	const validatePdfFile = (file) => {
        const isPdf = file.type === 'application/pdf';
        const isLessThan5MB = file.size <= 5000000;
        return isPdf && isLessThan5MB;
    };

    const validateImageFile = (file) => {
        const isImage = file.type.startsWith('image/');
        const isLessThan5MB = file.size <= 5000000;
        return isImage && isLessThan5MB;
    };

    const handleFileChange = (event, setFile, fileType) => {
        const file = event.target.files[0];
        let isValidFile = false;

        if (fileType === 'pdf') {
            isValidFile = validatePdfFile(file);
        } else if (fileType === 'image') {
            isValidFile = validateImageFile(file);
        }

        if (file && isValidFile) {
            setFile(file);
        } else {
            alert(`File must be a ${fileType.toUpperCase()} and less than 5 MB.`);
        }
    };

	const handleSubmit = async () => {
		const formData = new FormData();
		formData.append('quiz_file', quizFile);
		formData.append('answer_key_file', answerKeyFile);
		formData.append('student_answers', studentAnswersFile);
            // Log formData entries as an array or object
        console.log(Array.from(formData.entries()));
            
		try {
			const response = await fetch('http://127.0.0.1:8000/QAgenerator/grade/', {
				method: 'POST',
				body: formData,
			});
            
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const result = await response.json();
            navigate('/grading/response', { state: { result } });            

		} catch (error) {
			console.error(
				'There has been a problem with your fetch operation:',
				error
			);
			alert('Error uploading files');
		}
	};

    return (
        <>
            <div className='container'>
                <h1>Upload Student Quiz And Answers</h1>
                <div className='upload-section'>
                    <label>Upload quiz file:</label>
                    <input
                        type='file'
                        onChange={(e) => handleFileChange(e, setQuizFile, 'pdf')} // Add 'pdf' fileType
                        accept='application/pdf'
                    />
                </div>
                <div className='upload-section'>
                    <label>Upload answer key file:</label>
                    <input
                        type='file'
                        onChange={(e) => handleFileChange(e, setAnswerKeyFile, 'pdf')} // Add 'pdf' fileType
                        accept='application/pdf'
                    />
                </div>
                <div className='upload-section'>
                    <label>Upload student's answers:</label>
                    <input
                        type='file'
                        onChange={(e) => handleFileChange(e, setStudentAnswersFile, 'image')} // 'image' fileType already here
                        accept='image/*'
                    />
                </div>
                <div className='upload-grade'>
                    <button onClick={handleSubmit}>Upload and Grade</button>
                </div>
            </div>
            <Link to='/' className='back-to-homepage'>
                Back to Homepage
            </Link>
        </>
    );
}

export default GradingQuiz;
