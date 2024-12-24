import React, { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Button, TextField, Typography, Box } from "@mui/material";
import { API_URL } from "../../http";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

interface RoomCreatedPayload {
  roomId: string;
}

interface SignalPayload {
  roomId: string;
  type: "offer" | "answer" | "candidate";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface SignalEventPayload {
  type: "offer" | "answer" | "candidate";
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

const VideoCall: React.FC = () => {
  const [roomId, setRoomId] = useState<string>("");
  const [joined, setJoined] = useState<boolean>(false);
  const [created, setCreated] = useState<boolean>(false);
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

    // Комната создана
    socket.on("room-created", ({ roomId }: RoomCreatedPayload) => {
      setRoomId(roomId);
      setCreated(true);
    });

    // Присоединение к комнате
    socket.on("room-joined", () => {
      setJoined(true);
    });

    // Оба клиента готовы — начинаем обмен SDP
    socket.on("ready", () => {
      setReady(true);
      startCall();
    });

    // Обработка сигналинга (SDP offer/answer/ICE candidates)
    socket.on(
      "signal",
      async ({ type, sdp, candidate }: SignalEventPayload) => {
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
      }
    );

    // Второй участник отключился
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, socket]);

  const createRoom = () => {
    socket?.emit("create-room");
  };

  const joinRoom = () => {
    if (roomId) {
      socket?.emit("join-room", { roomId });
    }
  };

  const startCall = async () => {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    if (!pcRef.current) return;

    pcRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket?.emit("signal", {
          roomId,
          type: "candidate",
          candidate: event.candidate.toJSON(),
        } as SignalPayload);
      }
    };

    pcRef.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current.getTracks().forEach((track) => {
        pcRef.current?.addTrack(track, localStreamRef.current as MediaStream);
      });

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
    } catch (error) {
      console.error("Error getting user media", error);
    }

    // Если мы создатель комнаты и второй присоединился, шлем offer
    if (created && pcRef.current) {
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      socket?.emit("signal", {
        roomId,
        type: "offer",
        sdp: offer,
      } as SignalPayload);
    }
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
        <Typography variant="body1">Вы в комнате: {roomId}</Typography>
      )}
      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", sm: "45%" },
            aspectRatio: "16/9", // Сохраняет пропорции 16:9
            border: "1px solid #ccc",
            overflow: "hidden",
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", // Сохраняет обрезку по размеру контейнера
              transform: "rotateY(180deg)",
            }}
            muted
          />
        </Box>
        <Box
          sx={{
            width: { xs: "100%", sm: "45%" },
            aspectRatio: "16/9",
            border: "1px solid #ccc",
            overflow: "hidden",
          }}
        >
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "rotateY(180deg)",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default VideoCall;