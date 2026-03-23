import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuth } from '../context/AuthContext';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorOff } from 'lucide-react';

export default function VideoCall({ sessionId }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const myVideoRef = useRef();
  const remoteVideoRef = useRef();
  const peerRef = useRef();
  const screenStreamRef = useRef();

  useEffect(() => {
    let mounted = true;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Initialize Socket.io connection
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      if (mounted) {
        setSocket(newSocket);
        newSocket.emit('join-session', sessionId);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      if (mounted) {
        setError('Failed to connect to server');
        setIsConnecting(false);
      }
    });

    newSocket.on('user-joined', (data) => {
      console.log('User joined:', data);
    });

    newSocket.on('user-left', (data) => {
      console.log('User left:', data);
      if (mounted) {
        setRemoteStream(null);
        setIsConnected(false);
      }
    });

    // Initialize media stream
    const initMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        if (!mounted) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }

        setStream(mediaStream);
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = mediaStream;
        }

        // Create peer connection
        const newPeer = new Peer({
          initiator: true,
          trickle: true,
          stream: mediaStream,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
            ],
          },
        });

        peerRef.current = newPeer;
        setPeer(newPeer);

        newPeer.on('signal', (data) => {
          console.log('Sending signal');
          newSocket.emit('offer', { sessionId, offer: data });
        });

        newPeer.on('stream', (remoteStream) => {
          console.log('Received remote stream');
          if (mounted) {
            setRemoteStream(remoteStream);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
            setIsConnected(true);
            setIsConnecting(false);
          }
        });

        newPeer.on('connect', () => {
          console.log('Peer connected');
          if (mounted) {
            setIsConnected(true);
            setIsConnecting(false);
          }
        });

        newPeer.on('error', (err) => {
          console.error('Peer error:', err);
          if (mounted) {
            setError('Connection failed: ' + err.message);
            setIsConnecting(false);
          }
        });

        newPeer.on('close', () => {
          console.log('Peer connection closed');
          if (mounted) {
            setIsConnected(false);
          }
        });

        // Listen for answer and ICE candidates
        newSocket.on('answer', (data) => {
          console.log('Received answer from:', data.fromName);
          if (peerRef.current && !peerRef.current.destroyed) {
            peerRef.current.signal(data.answer);
          }
        });

        newSocket.on('ice-candidate', (data) => {
          if (peerRef.current && !peerRef.current.destroyed) {
            peerRef.current.signal(data.candidate);
          }
        });

        // Handle incoming offers (for the second peer)
        newSocket.on('offer', (data) => {
          console.log('Received offer from:', data.fromName);
          if (!peerRef.current) {
            const answerPeer = new Peer({
              initiator: false,
              trickle: true,
              stream: mediaStream,
              config: {
                iceServers: [
                  { urls: 'stun:stun.l.google.com:19302' },
                  { urls: 'stun:stun1.l.google.com:19302' },
                ],
              },
            });

            peerRef.current = answerPeer;
            setPeer(answerPeer);

            answerPeer.on('signal', (answerData) => {
              newSocket.emit('answer', { sessionId, answer: answerData });
            });

            answerPeer.on('stream', (remoteStream) => {
              if (mounted) {
                setRemoteStream(remoteStream);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = remoteStream;
                }
                setIsConnected(true);
                setIsConnecting(false);
              }
            });

            answerPeer.on('error', (err) => {
              console.error('Answer peer error:', err);
              if (mounted) {
                setError('Connection failed: ' + err.message);
                setIsConnecting(false);
              }
            });

            answerPeer.signal(data.offer);
          }
        });

        setIsConnecting(false);
      } catch (err) {
        console.error('Media access error:', err);
        if (mounted) {
          setError('Failed to access camera/microphone: ' + err.message);
          setIsConnecting(false);
        }
      }
    };

    initMedia();

    // Cleanup
    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
      if (newSocket) {
        newSocket.emit('leave-session', sessionId);
        newSocket.close();
      }
    };
  }, [sessionId, token]);

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }

      // Restore camera
      if (stream && peer) {
        const videoTrack = stream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      }

      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        });

        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peer._pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        // Update local video to show screen
        if (myVideoRef.current) {
          myVideoRef.current.srcObject = screenStream;
        }

        // Handle when user stops sharing via browser UI
        screenTrack.onended = () => {
          toggleScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
        setError('Failed to share screen');
      }
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (socket) {
      socket.emit('leave-session', sessionId);
      socket.close();
    }
    window.history.back();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Error message */}
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 text-center">
          {error}
        </div>
      )}

      {/* Connecting status */}
      {isConnecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg z-10">
          Connecting...
        </div>
      )}

      {/* Connected status */}
      {isConnected && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg z-10">
          Connected
        </div>
      )}

      {/* Video grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {/* Local video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
            You {isScreenSharing && '(Sharing Screen)'}
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-white text-center">
                <VideoOff className="w-16 h-16 mx-auto mb-2" />
                <p>Camera Off</p>
              </div>
            </div>
          )}
        </div>

        {/* Remote video */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden">
          {remoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                Remote User
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="text-white text-center">
                <Video className="w-16 h-16 mx-auto mb-2 opacity-50" />
                <p>Waiting for other participant...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 bg-gray-800">
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${isAudioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${isVideoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={toggleScreenShare}
          className={`p-4 rounded-full ${isScreenSharing ? 'bg-primary hover:bg-primary/80' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-colors`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
        </button>

        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
