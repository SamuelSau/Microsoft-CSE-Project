import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload.jsx';	

function App() {
	const [message, setMessage] = useState('');
	const [response, setResponse] = useState(null);
	const [selectedFile, setSelectedFile] = useState(null);

	const handleFileSelect = (file) => {
		setSelectedFile(file);
	};


	const sendMessage = async () => {
		try {
			const res = await fetch(
				'http://127.0.0.1:8000/QAgenerator/send_post_request/',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						// Include CSRF token if necessary
					},
					body: JSON.stringify({ message }),
				}
			);
			const data = await res.json();
			const messageContent = data.choices[0].message.content;
			setResponse(messageContent);
		} catch (error) {
			console.error('Error:', error);
		}
	};

	return (
		<div>
            <h2>Upload your lecture slides or notes:</h2>
            <FileUpload onFileSelect={handleFileSelect} />	

			<input
				type='text'
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button onClick={sendMessage}>Send</button>
			{response && <div>{response}</div>}
		</div>
	);
}

export default App;
