import { AuthResponse } from './../models/response/AuthResponse'
import axios from 'axios'
import $api, { API_URL } from '../http'
import { LoginRequest, SignupRequest } from '../models/requests/AuthRequests'

export default class AuthService {
	static async login(credentials: LoginRequest): Promise<AuthResponse> {
		try {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			const response = await $api.post<AuthResponse>('/auth/login', credentials)
			console.log(response)
			return response.data
		} catch (e) {
			throw new Error('Неверные почта или пароль')
		}
	}

	static async signup(credentials: SignupRequest): Promise<any> {
		try {
			await new Promise((resolve) => setTimeout(resolve, 2000))
			const response = await $api.post('/auth/signup', credentials)
			if (response) {
				return response
			} else {
				throw new Error('Адрес электронной почты уже занят')
			}
		} catch (e) {
			throw new Error('Адрес электронной почты уже занят')
		}
	}

	static async logout(): Promise<void> {
		return $api.get('/auth/logout')
	}

	static async checkAuth() {
		const response = await axios.get<AuthResponse>(`${API_URL}auth/refresh`, {
			withCredentials: true,
		})
		return response.data
	}
}
