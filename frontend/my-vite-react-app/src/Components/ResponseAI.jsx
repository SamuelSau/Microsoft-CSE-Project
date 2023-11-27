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

	// Helper function to add text with page overflow handling
	const addTextWithPageHandling = (doc, text, maxWidth) => {
		let yPos = 10; // Starting y-position
		const lines = doc.splitTextToSize(text, maxWidth);

		lines.forEach((line) => {
			if (yPos > 280) {
				// Check if the current position is near the bottom of the page
				doc.addPage();
				yPos = 10; // Reset the position for the new page
			}
			doc.text(line, 10, yPos);
			yPos += 10; // Increment the y-position for the next line
		});
	};

	const createPdfForVariation = (
		variationContent,
		variationNumber,
		answerKey
	) => {
		const doc = new jsPDF();
		const maxWidth = 180; // adjust as needed

		addTextWithPageHandling(doc, variationContent, maxWidth);

		if (answerKey) {
			doc.addPage(); // Start the answer key on a new page
			addTextWithPageHandling(doc, 'Answer Key\n' + answerKey, maxWidth);
		}

		doc.save(`variation_${variationNumber}.pdf`);
	};

	const downloadPdf = () => {
		if (responseType === 'quiz' || responseType === 'assignment') {
			const doc = new jsPDF();
			const maxWidth = 180;
			let content, title, answerKey;

			if (responseType === 'quiz') {
				title = 'Quiz';
				content = originalQuiz;
				answerKey = messageContent;
			} else if (responseType === 'assignment') {
				title = 'Assignment';
				content = originalAssignment;
				answerKey = messageContent;
			}

			addTextWithPageHandling(doc, content, maxWidth);

			doc.addPage(); // Start the answer key on a new page
			addTextWithPageHandling(doc, 'Answer Key\n' + answerKey, maxWidth);

			doc.save(`${title.toLowerCase()}_response.pdf`);
		} else if (responseType === 'variations') {
			const variationRegex = /Variation \d+/g;
			let startIndex = 0;
			let variationNumber = 1;

			quizVariations.split(variationRegex).forEach((variation, index) => {
				if (index === 0) return;

				const endIndex = quizVariations.indexOf(variation, startIndex);
				const variationContent = quizVariations.substring(
					startIndex,
					endIndex !== -1 ? endIndex : undefined
				);
				startIndex = endIndex !== -1 ? endIndex : quizVariations.length;

				const answerKey = answerKeys[`Variation ${variationNumber}`];
				createPdfForVariation(variationContent, variationNumber, answerKey);
				variationNumber++;
			});
		}
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
			const originalAssignmentContent = responseData?.original_assignment;
			const answerKeyContent =
				responseData?.answer_key?.choices?.[0]?.message.content;
			if (assignmentContent) {
				setOriginalAssignment(assignmentContent); // Set original quiz or assignment text
				setResponseType('assignment');
			}
			if (answerKeyContent) {
				setMessageContent(answerKeyContent);
			}
			if (originalAssignmentContent) {
				setOriginalAssignment(originalAssignmentContent);
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
			const variations =
				responseData?.response?.response?.choices?.[0]?.message?.content;
			const answerKeyContent =
				responseData?.response?.answer_key?.choices?.[0]?.message?.content;
			if (variations) {
				setQuizVariations(variations); // Set the variations
			}
			if (answerKeyContent) {
				setMessageContent(answerKeyContent);
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
							<button onClick={downloadPdf} className='custom-download-button'>
								Download as PDF
								<img
									src='/svgs/download-svgrepo-com.svg'
									alt='Download Icon'
									className='download-icon'
								/>
							</button>
						</div>
						{/* Footer with disclaimer */}
						<div className='ai-disclaimer-footer'>
							<p className='disclaimer-text'>
								Warning: Content for questions and answer keys are AI-generated.
							</p>
						</div>
					</div>

					{responseType === 'quiz' && (
						<div className='answers'>
							<h1>Answer Key</h1>
							<pre>{messageContent}</pre>
						</div>
					)}
					{responseType === 'assignment' && (
						<div className='answers'>
							<h1>Answer Key</h1>
							<pre>{messageContent}</pre>
						</div>
					)}
					{responseType === 'variations' && (
						<div className='answers'>
							<h1>Variations</h1>
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
