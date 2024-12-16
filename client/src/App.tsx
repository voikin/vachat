import { RouterProvider, createBrowserRouter } from 'react-router-dom'
// import './App.module.css'
import LoginPage from './pages/LoginPage/LoginPage'
import HomePage from './pages/HomePage/HomePage'
import SignupPage from './pages/SignupPage/SignupPage'
import LayoutPage from './pages/LayoutPage/LayoutPage'
import { useMutation } from 'react-query'
import { useEffect } from 'react'
import { useAuthStore } from './stores/authStore'
import AuthService from './services/AuthService'
import UserProfilePage from './pages/UserProfilePage/UserProfilePage'
import { Box, CircularProgress } from '@mui/material'
import {RoomPage} from "./pages/RoomPage/RoomPage.tsx";
import {RoomsPage} from "./pages/RoomsPage/RoomsPage.tsx";

const router = createBrowserRouter([
	{
		path: '/',
		element: <LayoutPage />,
		children: [
			{
				path: '/',
				element: <HomePage />,
			},
			{
				path: 'login',
				element: <LoginPage />,
			},
			{
				path: 'signup',
				element: <SignupPage />,
			},
			{
				path: 'rooms',
				element: <RoomsPage />,
			},
			{
				path: 'room/:id',
				element: <RoomPage />,
			}
		],
	},
])

const App = () => {
	const { login } = useAuthStore()

	const loginMutation = useMutation(AuthService.checkAuth, {
		onSuccess: (data) => {
			login(data)
		},
		onError: (error) => {
			console.log(error)
		},
	})

	useEffect(() => {
		const accessToken = localStorage.getItem('accessToken')
		if (accessToken) loginMutation.mutate()
	}, [])

	return (
		<>
			{loginMutation.isLoading ? (
				<Box
					width='100vw'
					height='100vh'
					display='flex'
					justifyContent='center'
					alignItems='center'
				>
					<CircularProgress size={64} />
				</Box>
			) : (
				<RouterProvider router={router} />
			)}
		</>
	)
}

export default App
