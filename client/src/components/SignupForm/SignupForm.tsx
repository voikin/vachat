import {
	FieldErrors,
	SubmitErrorHandler,
	SubmitHandler,
	useForm,
} from 'react-hook-form'
import styles from './SignupForm.module.css'
import { useEffect, useRef, useState } from 'react'
import { ISignupForm } from './SignupForm.interface'
import { useMutation } from 'react-query'
import AuthService from '../../services/AuthService'
import { useAuthStore } from '../../stores/authStore'
import {
	Paper,
	Box,
	TextField,
	CircularProgress,
	Typography,
	Button,
	Alert,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function SignupForm() {
	const { isAuth } = useAuthStore()

	const [isMailSended, setIsMailSended] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')

	const signupMutation = useMutation(AuthService.signup, {
		onSuccess: (data) => {
			console.log(data)
			setErrorMessage('')
			setIsMailSended(true)
		},
		onError: (error: Error) =>
			setErrorMessage('Ошибка регистрации: ' + error.message),
	})

	const navigate = useNavigate()

	const {
		register,
		handleSubmit,
		formState: { errors },
		clearErrors,
		watch,
	} = useForm<ISignupForm>({ mode: 'onChange' })

	const password = useRef({})
	password.current = watch('password', '')

	const submitHandler: SubmitHandler<ISignupForm> = async (
		data: ISignupForm
	) => {
		setErrorMessage('')
		signupMutation.mutate(data)
	}

	const errorHandler: SubmitErrorHandler<ISignupForm> = (
		errors: FieldErrors<ISignupForm>
	) => {
		const keys = Object.keys(errors) as Array<keyof FieldErrors<ISignupForm>>
		for (const key of keys) {
			if (errors[key]?.message) {
				setErrorMessage('Ошибка валидации: ' + errors[key]?.message)
				return
			}
		}
	}

	useEffect(() => clearErrors(), [])

	useEffect(() => {
		if (isMailSended) {
			const redirectTimer = setTimeout(() => {
				navigate('/login')
				setIsMailSended(true)
			}, 5000)
			return () => clearTimeout(redirectTimer)
		}
	}, [isMailSended])

	if (isAuth)
		return (
			<>
				<div className={styles['login-card']}>
					<div className={styles['login-card__message']}>
						Вход выполнен успешно!
					</div>
				</div>
			</>
		)

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
				{isMailSended && (
					<Alert severity='success' sx={{ marginTop: '16px' }}>
						Пожалуйста, подтвердите аккаунт в электронном письме. После этого
						авторизуйтесь на сервисе
					</Alert>
				)}
				{errorMessage && (
					<Alert severity='error' sx={{ marginBottom: '16px' }}>
						{errorMessage}
					</Alert>
				)}
				<Box display='flex' flexDirection='column' alignItems='center'>
					<Typography component='h1' variant='h5' marginTop='normal'>
						Регистрация
					</Typography>
					<TextField
						margin='normal'
						helperText={errors.email ? errors?.email?.message : ''}
						error={!!errors?.email}
						label='Электронный адрес'
						autoComplete='signup-email'
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
						autoComplete='signup-current-password'
						{...register('password', {
							required: 'Это обязательное поле',
							minLength: {
								value: 6,
								message: 'Пароль должен состоять минимум из 6 символов',
							},
						})}
					/>
					<TextField
						margin='normal'
						fullWidth
						label='Подтвердите пароль'
						type='password'
						autoComplete='sign-up-confirm-password'
						{...register('confirmPassword', {
							required: 'Это обязательное поле',
							validate: (value) =>
								value === password.current || 'Пароли не совпадают',
						})}
					/>
					<Button
						variant='contained'
						disabled={signupMutation.isLoading}
						disableElevation
						type='submit'
						fullWidth
						sx={{
							marginTop: '16px',
						}}
					>
						{signupMutation.isLoading ? (
							<CircularProgress size={24} />
						) : (
							<Typography>Отправить</Typography>
						)}
					</Button>
				</Box>
			</form>
		</Paper>
	)
}
