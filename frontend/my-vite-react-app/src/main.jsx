import React from 'react';
import ReactDOM from 'react-dom/client';
import QuizForm from './Components/QuizForm';
import AssignmentForm from './Components/AssignmentForm.jsx';
import Homepage from './Components/HomePage';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ResponseAI from './Components/ResponseAI';
import QuizVariation from './Components/QuizVariation.jsx';
import GradingQuiz from './Components/GradingQuiz.jsx';
import GradingResponse from './Components/GradingResponse.jsx';

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
	{
		path: '/variation',
		element: <QuizVariation />,
	},
	{
		path: '/grading',
		element: <GradingQuiz />,
	},
	{
		path: '/grading/response',
		element: <GradingResponse />,
	}
]);

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>
);
