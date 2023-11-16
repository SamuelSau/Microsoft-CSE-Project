import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../CSS/ResponseAI.css';
import { jsPDF } from 'jspdf';

function ResponseAI(props) {
	const [messageContent, setMessageContent] = useState('');
	const [originalQuiz, setOriginalQuiz] = useState('');
	const [originalAssignment, setOriginalAssignment] = useState('');
	const [quizName, setQuizName] = useState('');
	const [quizVariations, setQuizVariations] = useState([]); // State to store quiz variations
	const location = useLocation();
	const [modifications, setModifications] = useState('');
	const [responseType, setResponseType] = useState('');
	const [modifiedQuizFormData, setModifiedQuizFormData] = useState({
		original_quiz: '',
		modifications: '',
	});
	const [modifiedAssignmentFormData, setModifiedAssignmentFormData] = useState({
		original_assignment: '',
		modifications: '',
	});
	const [modifiedFormData, setModifiedFormData] = useState({});

	const handleChange = (e) => {
		const { name, type, value, files } = e.target;

		if (type === 'file') {
			setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
		}
	};

	const downloadPdf = () => {
		const doc = new jsPDF();

		// Add content to the PDF here
		if (responseType === 'quiz') {
			doc.text(quizName, 10, 10);
			doc.text(originalQuiz, 10, 20); // You might need to format this correctly
			doc.addPage();
			doc.text('Answer Key', 10, 10);
			doc.text(messageContent, 10, 20); // Again, format as needed
		} else if (responseType === 'assignment') {
			doc.text('Assignment', 10, 10);
			doc.text(originalAssignment, 10, 20); // Format as needed
		} else if (responseType === 'variations') {
			doc.text('Variations', 10, 10);
			doc.text(quizVariations, 10, 20); // Format as needed
		}

		// Save the PDF
		doc.save('response.pdf');
	};

	const handleModify = async (e) => {
		try {
			e.preventDefault();

			// Determine the endpoint based on the responseType state
			let endpoint;
			let modifiedFormData;

			if (responseType === 'assignment') {
				endpoint = 'http://127.0.0.1:8000/QAgenerator/modify_assignment/';
				modifiedFormData = modifiedAssignmentFormData;
			} else if (responseType === 'quiz') {
				endpoint = 'http://127.0.0.1:8000/QAgenerator/modify_quiz/';
				modifiedFormData = modifiedQuizFormData;
			}

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(modifiedFormData),
			});

			const responseData = await response.json();

			if (responseData.modified_quiz) {
				setOriginalQuiz(responseData.modified_quiz); // Update the original quiz with the modified content
				setMessageContent(responseData.answer_key); // Update the answer key based on your state variable name
				setQuizName(
					responseData?.response?.choices?.[0].message?.content.split('\n')[0]
				); //Update the Quiz name as well
				setModifications(''); // Clear the textarea
			} else if (responseData.modified_assignment) {
				setOriginalAssignment(
					responseData?.modified_assignment?.choices?.[0].message?.content
				);
				setModifications('');
			}
		} catch (error) {
			console.error('Error modifying the quiz:', error);
		}
	};

	useEffect(() => {
		setModifiedQuizFormData({
			original_quiz: originalQuiz,
			modifications: modifications,
		});
	}, [originalQuiz, modifications]);

	useEffect(() => {
		setModifiedAssignmentFormData({
			original_assignment: originalAssignment,
			modifications: modifications,
		});
	}, [originalAssignment, modifications]);

	//Logic for when we check what type of response we got whatever form we submitted
	useEffect(() => {
		const responseData = location.state?.responseData;

		if (responseData?.assignment?.type === 'assignment') {
			// Process and set state for AssignmentForm response
			// Assuming some hypothetical structure for demonstration
			const assignmentContent =
				responseData?.assignment.choices?.[0]?.message?.content;
			if (assignmentContent) {
				setOriginalAssignment(assignmentContent); // Set original quiz or assignment text
				setResponseType('assignment');
			}
		} else if (responseData?.response?.type === 'quiz') {
			const answerKeyContent =
				responseData?.answer_key?.choices?.[0]?.message?.content;
			const originalQuizContent = responseData?.original_quiz;
			const content = responseData?.response?.choices?.[0].message?.content;
			const quizName = content.split('\n')[0];
			setResponseType('quiz');
			if (answerKeyContent) {
				setMessageContent(answerKeyContent);
			}
			if (originalQuizContent) {
				setOriginalQuiz(originalQuizContent);
			}

			if (quizName) {
				setQuizName(quizName);
			}
		} else if (responseData?.response?.type === 'variation') {
			// Handling quiz variations
			const variations = responseData?.response?.choices[0]?.message?.content;
			console.log(variations); // Assuming 'quiz_variations' is the key in the response
			if (variations) {
				setQuizVariations(variations); // Set the variations
			}
			setResponseType('variations');
		}
	}, [props]);

	return (
		<>
			<div className='outer-container'>
				<div className='response-container'>
					<div className='questions'>
						{responseType === 'quiz' ? (
							<div>
								<h1>{quizName}</h1>
								<pre>{originalQuiz}</pre>
							</div>
						) : responseType === 'assignment' ? (
							<div className='questions'>
								<h1>Assignment</h1> {/* Change this as needed */}
								<pre>{originalAssignment}</pre>
							</div>
						) : null}
						{responseType === 'variations' && (
							<div className='questions'>
								<h1>Variation</h1> {/* Change this as needed */}
								<pre>{quizVariations}</pre>
							</div>
						)}

						{/* Modifications Wrapper - Only show for quizzes and assignments */}
						{(responseType === 'quiz' || responseType === 'assignment') && (
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
						)}

						<div className='download-material'>
							<button onClick={downloadPdf} className='download-button'>
								Download as PDF
							</button>
						</div>

					</div>

					{responseType === 'quiz' && (
						<div className='answers'>
							<h1>Answer Key</h1>
							<pre>{messageContent}</pre>
						</div>
					)}

					<Link to='/' className='back-to-homepage'>
						Back to Homepage
					</Link>
				</div>
			</div>
		</>
	);
}

export default ResponseAI;
