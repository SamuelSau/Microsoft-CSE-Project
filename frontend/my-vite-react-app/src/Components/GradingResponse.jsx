import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../CSS/GradingResponse.css';

function GradingResponse() {
	const location = useLocation();
	const { result } = location.state || {};

	const studentScore = result?.student_score || [];
	const base64EncodedImage = result?.base64_encoded_image;

	return (
		<>
			<div className='grading-container'>
				<h1>Grading Results</h1>

				{/* Display each item of the student score */}
				<div className='student-score'>
					{studentScore.map((item, index) => (
						<p key={index}>{item}</p>
					))}
				</div>

				{/* Display the image if it exists */}
				{base64EncodedImage && (
					<div className='student-answer-image'>
						<h2>Student's Answer Image</h2>
						<img
							src={`data:image/jpeg;base64,${base64EncodedImage}`}
							alt='Student Answer'
							className='answer-image'
						/>
					</div>
				)}
			</div>
			<Link to='/' className='back-to-homepage'>
				Back to Homepage
			</Link>
		</>
	);
}

export default GradingResponse;
