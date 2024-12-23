import {
	FieldErrors,
	SubmitErrorHandler,
	SubmitHandler,
	useForm,
} from 'react-hook-form'
import { useEffect, useState } from 'react'
import { ILoginForm } from './LoginForm.interface'
import { useMutation } from 'react-query'
import AuthService from '../../services/AuthService'
import { AuthResponse } from '../../models/response/AuthResponse'
import { useAuthStore } from '../../stores/authStore'
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Grid,
	Paper,
	TextField,
	Typography,
	styled,
} from '@mui/material'
import { Link, useNavigate } from 'react-router-dom'

const StyledLink = styled(Link)`
	color: inherit;
	text-decoration: none;

	&:hover {
		color: inherit;
	}
`

export default function LoginForm() {
	const { login, isAuth } = useAuthStore()
	const [errorMessage, setErrorMessage] = useState('')
	const navigate = useNavigate()

	const loginMutation = useMutation(AuthService.login, {
		onSuccess: (data: AuthResponse) => login(data),
		onError: (e: Error) => setErrorMessage('Ошибка входа: ' + e.message),
	})

	const {
		register,
		handleSubmit,
		formState: { errors },
		clearErrors,
	} = useForm<ILoginForm>()

	const submitHandler: SubmitHandler<ILoginForm> = async (data: ILoginForm) => {
		loginMutation.mutate(data)
	}

	const errorHandler: SubmitErrorHandler<ILoginForm> = (
		errors: FieldErrors<ILoginForm>
	) => console.log(errors)

	useEffect(() => clearErrors(), [clearErrors])

	if (isAuth) navigate('/')

	return (
		<Paper
			sx={{
				padding: '24px 32px',
				mt: '64px',
				borderRadius: '1rem',
				width: '350px',
			}}
			elevation={2}
		>
			<form onSubmit={handleSubmit(submitHandler, errorHandler)}>
				{errorMessage && (
					<Alert severity='error' sx={{ marginBottom: '16px' }}>
						{errorMessage}
					</Alert>
				)}
				<Box display='flex' flexDirection='column' alignItems='center'>
					<Typography component='h1' variant='h5' marginTop='normal'>
						Вход
					</Typography>
					<TextField
						margin='normal'
						helperText={errors.email ? errors?.email?.message : ''}
						error={!!errors?.email}
						label='Электронный адрес'
						autoComplete='login-email'
						fullWidth
						autoFocus
						{...register('email', {
							required: 'Это поле обязательное',
							pattern: {
								value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
								message: 'Некорректно указана почта',
							},
						})}
					/>
					<TextField
						margin='normal'
						fullWidth
						label='Пароль'
						type='password'
						autoComplete='login-current-password'
						{...register('password', {
							required: 'Это поле обязательное',
						})}
					/>
					<Button
						variant='contained'
						disabled={loginMutation.isLoading}
						disableElevation
						type='submit'
						fullWidth
						sx={{
							marginTop: '16px',
						}}
					>
						{loginMutation.isLoading ? (
							<CircularProgress size={24} />
						) : (
							<Typography>Войти</Typography>
						)}
					</Button>
					<Grid container marginTop='16px'>
						<Grid item xs>
							<StyledLink to='#'>
								<Typography>Забыли пароль?</Typography>
							</StyledLink>
						</Grid>
						<Grid item>
							<StyledLink to='/signup'>
								<Typography>Зарегистрироваться</Typography>
							</StyledLink>
						</Grid>
					</Grid>
				</Box>
			</form>
		</Paper>
	)
}
