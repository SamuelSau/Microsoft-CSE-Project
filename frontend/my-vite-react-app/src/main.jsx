import React from 'react';
import ReactDOM from 'react-dom/client';
import QuizForm from './Components/QuizForm';
import AssignmentForm from './Components/AssignmentForm.jsx';
import Homepage from './Components/HomePage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ResponseAI from './Components/ResponseAI';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Homepage />,
	},
	{
		path: '/assignment',
		element: <AssignmentForm />,
	},
	{
		path: '/quiz',
		element: <QuizForm />,
	},
	{
		path: '/response',
		element: <ResponseAI />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
