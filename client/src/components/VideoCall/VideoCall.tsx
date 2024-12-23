import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Button, TextField, Typography, Box } from "@mui/material";
import { API_URL } from "../../http";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate, useParams } from "react-router-dom";

const VideoCall: React.FC = () => {
  const { roomId: roomIdFromUrl } = useParams<{ roomId: string }>();
  const [roomId, setRoomId] = useState<string>(roomIdFromUrl || "");
  const [joined, setJoined] = useState<boolean>(false);
  const [created, setCreated] = useState<boolean>(false);
  const [roomLink, setRoomLink] = useState<string>("");
  const [, setReady] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | undefined>(undefined);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const { isAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }

    const newSocket = io(API_URL, {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-created", ({ roomId, roomLink }: any) => {
      setRoomId(roomId);
      setRoomLink(roomLink);
      setCreated(true);
    });

    socket.on("room-joined", () => {
      setJoined(true);
    });

    socket.on("ready", () => {
      setReady(true);
      startCall();
    });

    socket.on("signal", async ({ type, sdp, candidate }: any) => {
      if (!pcRef.current) return;

      if (type === "offer" && sdp) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("signal", { roomId, type: "answer", sdp: answer });
      } else if (type === "answer" && sdp) {
        await pcRef.current.setRemoteDescription(
          new RTCSessionDescription(sdp)
        );
      } else if (type === "candidate" && candidate) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate", e);
        }
      }
    });

    socket.on("peer-disconnected", () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    return () => {
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("ready");
      socket.off("signal");
      socket.off("peer-disconnected");
    };
  }, [roomId, socket]);

  const createRoom = () => {
    socket?.emit("create-room");
  };

  const joinRoom = () => {
    if (roomId) {
      socket?.emit("join-room", { roomId });
    }
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomLink);
  };

  const startCall = async () => {
    // Логика вызова остается без изменений
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Видеозвонок</Typography>
      {!created && !joined && (
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button variant="contained" onClick={createRoom}>
            Создать комнату
          </Button>
          <TextField
            label="ID комнаты"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <Button variant="contained" onClick={joinRoom}>
            Подключиться
          </Button>
        </Box>
      )}
      {(created || joined) && (
        <>
          <Typography variant="body1">Вы в комнате: {roomId}</Typography>
          {created && (
            <Button variant="contained" onClick={copyRoomLink}>
              Скопировать ссылку
            </Button>
          )}
        </>
      )}
      {/* Остальная часть UI */}
    </Box>
  );
};

export default VideoCall;
