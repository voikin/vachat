import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import * as jwt from 'jsonwebtoken';

interface JoinRoomPayload {
  roomId: string;
}

interface SignalPayload {
  roomId: string;
  type: 'offer' | 'answer' | 'candidate';
  sdp?: any;
  candidate?: any;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private rooms = new Map<string, Set<string>>();

  async handleConnection(socket: Socket) {
    // Валидация JWT из query параметров или заголовка (например, через query)
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      // Проверяем токен (ключ для jwt.verify возьмите тот же, что и в вашем AuthModule)
      jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      console.error(err);
      socket.disconnect(true);
      return;
    }
  }

  handleDisconnect(socket: Socket) {
    // Удаляем сокет из всех комнат, где он был
    for (const [roomId, clients] of this.rooms.entries()) {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        // Если комната пустая, можно ее удалить
        if (clients.size === 0) {
          this.rooms.delete(roomId);
        }
        // Оповестить второго, что пользователь покинул комнату
        this.server.to(roomId).emit('peer-disconnected');
        break;
      }
    }
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(@ConnectedSocket() socket: Socket) {
    const roomId = Math.random().toString(36).substr(2, 9); // Пример генерации уникального ID
    this.rooms.set(roomId, new Set([socket.id]));
    socket.join(roomId);
    socket.emit('room-created', { roomId });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: JoinRoomPayload,
  ) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);

    if (!room) {
      socket.emit('error', { message: 'Комната не найдена' });
      return;
    }

    if (room.size >= 2) {
      socket.emit('error', { message: 'Комната уже заполнена' });
      return;
    }

    room.add(socket.id);
    socket.join(roomId);
    socket.emit('room-joined', { roomId });

    // Если теперь в комнате 2 пользователя, оповещаем, что можно начать сигналинг
    if (room.size === 2) {
      this.server.to(roomId).emit('ready', { roomId });
    }
  }

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: SignalPayload,
  ) {
    const { roomId, type, sdp, candidate } = data;
    // Пересылаем сигналинг-сообщение всем в комнате, кроме отправителя
    socket.to(roomId).emit('signal', { type, sdp, candidate });
  }

  @SubscribeMessage('ping')
  handlePing() {
    return 'pong';
  }
}
