import { create } from 'zustand'
import { IUser } from '../models/IUser'
import { immer } from 'zustand/middleware/immer'
import { AuthResponse } from '../models/response/AuthResponse'

interface UserState {
	user: IUser
	isAuth: boolean
	isMailSended: boolean
	login: (data: AuthResponse) => void
	logout: () => void
	sendMail: () => void
}

export const useAuthStore = create<UserState>()(
	immer((set) => ({
		user: {} as IUser,
		isAuth: false,
		isMailSended: false,

		sendMail: async () =>
			set((state) => {
				state.isMailSended = true
			}),

		login: async (data: AuthResponse) => {
			localStorage.setItem('accessToken', data.accessToken)
			set((state) => {
				state.user = data.authDto
				state.isAuth = true
				state.isMailSended = false
			})
		},

		logout: async () => {
			localStorage.removeItem('accessToken')
			return set((state) => {
				state.isAuth = false
				state.user = {}
			})
		},
	}))
)
