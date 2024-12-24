import { useRef, useState } from "react";

interface UseWebRTCProps {
  onRemoteStream?: (stream: MediaStream) => void;
  onIceCandidate?: (candidate: RTCIceCandidate) => void;
  onError?: (error: unknown) => void;
}

export function useWebRTC({
  onRemoteStream,
  onIceCandidate,
  onError,
}: UseWebRTCProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [isCamOn, setIsCamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  /**
   * Инициализация PeerConnection
   */
  const initPeerConnection = (config?: RTCConfiguration) => {
    pcRef.current = new RTCPeerConnection(config);

    // Событие, когда получаем ICE-кандидата
    pcRef.current.onicecandidate = (event) => {
      if (event.candidate && onIceCandidate) {
        onIceCandidate(event.candidate);
      }
    };

    // Событие, когда получаем трек от собеседника
    pcRef.current.ontrack = (event) => {
      if (onRemoteStream) {
        onRemoteStream(event.streams[0]);
      }
    };
  };

  /**
   * Получаем доступ к камере/микрофону
   */
  const getMediaStream = async () => {
    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      return localStreamRef.current;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  };

  /**
   * Добавляем локальные треки в PeerConnection
   */
  const addLocalTracksToConnection = () => {
    if (!pcRef.current || !localStreamRef.current) return;

    localStreamRef.current.getTracks().forEach((track) => {
      pcRef.current?.addTrack(track, localStreamRef.current as MediaStream);
    });
  };

  /**
   * Создаём offer (когда мы — инициаторы)
   */
  const createOffer = async (): Promise<RTCSessionDescriptionInit | null> => {
    try {
      if (!pcRef.current) return null;
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      return offer;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  };

  /**
   * Создаём answer (когда мы принимаем offer)
   */
  const createAnswer = async (): Promise<RTCSessionDescriptionInit | null> => {
    try {
      if (!pcRef.current) return null;
      const answer = await pcRef.current.createAnswer();
      await pcRef.current.setLocalDescription(answer);
      return answer;
    } catch (error) {
      if (onError) onError(error);
      return null;
    }
  };

  /**
   * Устанавливаем удалённое описание (offer или answer)
   */
  const setRemoteDescription = async (desc: RTCSessionDescriptionInit) => {
    if (!pcRef.current) return;
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(desc));
  };

  /**
   * Добавляем полученную ICE-кандидату
   */
  const addIceCandidate = async (candidate: RTCIceCandidateInit) => {
    if (!pcRef.current) return;
    try {
      await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      if (onError) onError(e);
    }
  };

  /**
   * Переключает состояние камеры
   */
  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    const videoTracks = localStreamRef.current.getVideoTracks();
    videoTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsCamOn((prev) => !prev);
  };

  /**
   * Переключает состояние микрофона
   */
  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;
    const audioTracks = localStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });
    setIsMicOn((prev) => !prev);
  };

  return {
    pcRef,
    localStreamRef,

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
  };
}
