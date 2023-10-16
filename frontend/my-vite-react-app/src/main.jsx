import React from 'react';
import ReactDOM from 'react-dom/client';
import QuizForm from './Components/QuizForm';
import AssignmentForm from './Components/AssignmentForm.jsx';
import Homepage from './Components/HomePage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
]);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
