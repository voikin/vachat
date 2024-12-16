import axios from 'axios'
import { AuthResponse } from '../models/response/AuthResponse'

export const API_URL = 'http://localhost:8080/'

const $api = axios.create({
	withCredentials: true,
	baseURL: API_URL,
})

$api.interceptors.request.use((config) => {
	const accessToken = localStorage.getItem('accessToken')
	if (accessToken) config.headers.Authorization = 'Bearer ' + accessToken
	return config
})

$api.interceptors.response.use(
	(config) => config,
	async (error) => {
		const originRequest = error.config
		if (error.response.status == 401 && !error.config._isRetry) {
			originRequest._isRetry = true
			const response = await axios.get<AuthResponse>(`${API_URL}auth/refresh`, {
				withCredentials: true,
			})
			if (response.status == 401) {
				localStorage.removeItem('accessToken')
				return
			}
			localStorage.setItem('accessToken', response.data.accessToken)
			return $api.request(originRequest)
		}
	}
)

export default $api
