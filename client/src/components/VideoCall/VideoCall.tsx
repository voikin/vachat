import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Slider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useSocket } from "../../hooks/useSocket";
import { API_URL } from "../../http";

/* Импортируем наш CSS-модуль */
import styles from "./VideoCall.module.css";

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

  const [remoteVolume, setRemoteVolume] = useState<number>(1);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const { isAuth } = useAuthStore();
  const navigate = useNavigate();

  const { socket, ping } = useSocket({
    url: API_URL,
    authToken: localStorage.getItem("accessToken") || "",
    pingInterval: 1000,
  });

  const {
    pcRef,
    isCamOn,
    isMicOn,
    initPeerConnection,
    getMediaStream,
    addLocalTracksToConnection,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    toggleCamera,
    toggleMicrophone,
  } = useWebRTC({
    onRemoteStream: (stream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    },
    onIceCandidate: (candidate) => {
      if (!roomId || !socket) return;
      socket.emit("signal", {
        roomId,
        type: "candidate",
        candidate: candidate.toJSON(),
      } as SignalPayload);
    },
    onError: (error) => {
      console.error("WebRTC Error: ", error);
    },
  });

  useEffect(() => {
    if (!isAuth) {
      navigate("/login");
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    if (!socket) return;

    socket.on("room-created", ({ roomId }: RoomCreatedPayload) => {
      setRoomId(roomId);
      setCreated(true);
    });

    socket.on("room-joined", () => {
      setJoined(true);
    });

    socket.on("ready", () => {
      setReady(true);
      startCall();
    });

    socket.on(
      "signal",
      async ({ type, sdp, candidate }: SignalEventPayload) => {
        if (!pcRef.current) return;

        if (type === "offer" && sdp) {
          await setRemoteDescription(sdp);
          const answer = await createAnswer();
          if (answer) {
            socket.emit("signal", { roomId, type: "answer", sdp: answer });
          }
        } else if (type === "answer" && sdp) {
          await setRemoteDescription(sdp);
        } else if (type === "candidate" && candidate) {
          await addIceCandidate(candidate);
        }
      }
    );

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
  }, [
    socket,
    roomId,
    pcRef,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
  ]);

  const createRoom = () => {
    socket?.emit("create-room");
  };

  const joinRoom = () => {
    if (roomId) {
      socket?.emit("join-room", { roomId });
    }
  };

  const startCall = async () => {
    initPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const stream = await getMediaStream();
    if (!stream) return;

    addLocalTracksToConnection();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    if (created) {
      const offer = await createOffer();
      if (offer && socket) {
        socket.emit("signal", {
          roomId,
          type: "offer",
          sdp: offer,
        } as SignalPayload);
      }
    }
  };

  const handleVolumeChange = (_: Event, newValue: number | number[]) => {
    const volume = Array.isArray(newValue) ? newValue[0] : newValue;
    setRemoteVolume(volume);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.volume = volume;
    }
  };

  const copyRoomIdToClipboard = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Не удалось скопировать:", error);
    }
  };

  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const handleCloseSnackbar = () => setSnackbarOpen(false);

  return (
    <div className={styles.container}>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={handleCloseSnackbar}>
          ID скопирован!
        </Alert>
      </Snackbar>

      <Typography variant="h5" className={styles.videoCallTitle}>
        Видеозвонок
      </Typography>

      {(created || joined) && (
        <Typography variant="caption">Пинг: {ping}</Typography>
      )}

      {!created && !joined && (
        <div className={styles.roomForm}>
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
        </div>
      )}

      {(created || joined) && (
        <>
          <div className={styles.roomInfoContainer}>
            <Typography variant="body1">Вы в комнате: {roomId}</Typography>
            <Button variant="outlined" onClick={copyRoomIdToClipboard}>
              Скопировать ID
            </Button>
          </div>

          <div className={styles.controlButtons}>
            <Button
              variant="contained"
              color={!isCamOn ? "primary" : "secondary"}
              onClick={toggleCamera}
            >
              {isCamOn ? "Отключить камеру" : "Включить камеру"}
            </Button>
            <Button
              variant="contained"
              color={!isMicOn ? "primary" : "secondary"}
              onClick={toggleMicrophone}
            >
              {isMicOn ? "Отключить микрофон" : "Включить микрофон"}
            </Button>
          </div>

          <div className={styles.volumeSliderContainer}>
            <Typography gutterBottom>Громкость собеседника</Typography>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={remoteVolume}
              onChange={handleVolumeChange}
            />
          </div>
        </>
      )}

      <div className={styles.videoRow}>
        <div className={styles.videoBox}>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            className={styles.videoElement}
            muted
          />
        </div>

        <div className={styles.videoBox}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={styles.videoElement}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
