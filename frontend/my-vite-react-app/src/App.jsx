import React, { useState } from 'react';
import './App.css';

function App() {
	const [message, setMessage] = useState('');
	const [response, setResponse] = useState(null);

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
