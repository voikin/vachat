import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket
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

@WebSocketGateway(8001, {
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private rooms = new Map<string, Set<string>>();

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      socket.disconnect(true);
      return;
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [roomId, clients] of this.rooms.entries()) {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);

        if (clients.size === 0) {
          this.rooms.delete(roomId);
        }

        this.server.to(roomId).emit('peer-disconnected');
        break;
      }
    }
  }

  @SubscribeMessage('create-room')
  handleCreateRoom(@ConnectedSocket() socket: Socket) {
    const roomId = Math.random().toString(36).substr(2, 9);
    this.rooms.set(roomId, new Set([socket.id]));
    socket.join(roomId);
    socket.emit('room-created', { roomId });
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() data: JoinRoomPayload) {
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

    if (room.size === 2) {
      this.server.to(roomId).emit('ready', { roomId });
    }
  }

  @SubscribeMessage('signal')
  handleSignal(@ConnectedSocket() socket: Socket, @MessageBody() data: SignalPayload) {
    const { roomId, type, sdp, candidate } = data;

    socket.to(roomId).emit('signal', { type, sdp, candidate });
  }
}