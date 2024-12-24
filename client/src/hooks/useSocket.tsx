import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";

interface UseSocketProps {
  url: string;
  authToken?: string;
  onError?: (error: unknown) => void;
}

export function useSocket({ url, authToken, onError }: UseSocketProps) {
  const [socket, setSocket] = useState<Socket | null>(null);

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

  return { socket };
}
