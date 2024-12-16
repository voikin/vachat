import { UserInfoResponse } from './../models/response/UserInfoResponse'
import $api from '../http'

export interface FetchUserDataArgs {
	fields?: string[]
	otherParam?: string
}

export default class UserService {
	static async fetchUserData(): Promise<UserInfoResponse> {
		const response = await $api.post<UserInfoResponse>('/api/user')
		await new Promise((resolve) => setTimeout(resolve, 3000))
		return response.data
	}
}
