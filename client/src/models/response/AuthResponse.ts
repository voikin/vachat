import { IUser } from '../IUser'

export interface AuthResponse {
	accessToken: string
	authDto: IUser
}
