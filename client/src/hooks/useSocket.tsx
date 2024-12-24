import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface UseSocketProps {
  url: string;
  authToken?: string;
  pingInterval?: number;

  onError?: (error: unknown) => void;
}

export function useSocket({ url, authToken, onError, pingInterval = 5000 }: UseSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [ping, setPing] = useState<number>(0);

  useEffect(() => {
    const newSocket = io(url, {
      auth: {
        token: authToken,
      },
    });

    newSocket.on("connect_error", (err) => {
      if (onError) onError(err);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url, authToken, onError]);

  useEffect(() => {
    if (!socket) return;

    const intervalId = setInterval(() => {
      const startTime = Date.now();
      socket.emit("ping", null, () => {
        const latency = Date.now() - startTime;
        setPing(latency);
      });
    }, pingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [socket, pingInterval]);

  return { socket, ping };
}
