// client/src/services/RoomsService.ts
import $api from '../http'

// Интерфейс ответа при создании комнаты
export interface RoomResponse {
    roomId: string;
}

export default class RoomsService {
    static async createRoom(): Promise<RoomResponse> {
        // Создаём комнату, бэкенд вернёт { roomId: string }
        const response = await $api.post<RoomResponse>('/rooms')
        return response.data
    }

    static async deleteRoom(roomId: string): Promise<{ message?: string; error?: string }> {
        // Удаляем комнату по roomId
        const response = await $api.delete(`/rooms/${roomId}`)
        return response.data
    }
}
