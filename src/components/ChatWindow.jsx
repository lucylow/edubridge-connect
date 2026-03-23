import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Send, Loader2 } from 'lucide-react';

export default function ChatWindow({ sessionId }) {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const bottomRef = useRef();
  const typingTimeoutRef = useRef();

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Chat socket connected');
      setIsConnected(true);
      newSocket.emit('join-session', sessionId);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Chat socket connection error:', err);
      setIsConnected(false);
    });

    newSocket.on('disconnect', () => {
      console.log('Chat socket disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    // Listen for typing indicators
    newSocket.on('user-typing', (data) => {
      if (data.userId !== user.id) {
        setIsTyping(true);
        setTypingUser(data.userName);
      }
    });

    newSocket.on('user-stopped-typing', (data) => {
      if (data.userId !== user.id) {
        setIsTyping(false);
        setTypingUser(null);
      }
    });

    newSocket.on('user-joined', (data) => {
      if (data.userId !== user.id) {
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          type: 'system',
          message: `${data.userName} joined the session`,
          timestamp: data.timestamp,
        }]);
      }
    });

    newSocket.on('user-left', (data) => {
      if (data.userId !== user.id) {
        setMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          type: 'system',
          message: `${data.userName} left the session`,
          timestamp: data.timestamp,
        }]);
      }
    });

    setSocket(newSocket);

    // Load previous messages from server (if implemented)
    loadPreviousMessages(sessionId, token);

    return () => {
      newSocket.emit('leave-session', sessionId);
      newSocket.close();
    };
  }, [sessionId, token, user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadPreviousMessages = async (sessionId, token) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/sessions/${sessionId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load previous messages:', err);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected) return;

    socket.emit('send-message', {
      sessionId,
      message: input.trim(),
    });

    setInput('');
    handleStopTyping();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);

    if (!socket || !isConnected) return;

    // Emit typing indicator
    socket.emit('typing-start', { sessionId });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (socket && isConnected) {
      socket.emit('typing-stop', { sessionId });
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Connected</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {msg.message}
                  </div>
                </div>
              );
            }

            const isOwn = msg.userId === user.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {msg.userName}
                    </p>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing indicator */}
        {isTyping && typingUser && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 rounded-bl-none">
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">
                {typingUser}
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {!isConnected && (
          <div className="mb-2 text-center text-sm text-yellow-600 dark:text-yellow-400">
            Reconnecting...
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onBlur={handleStopTyping}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Type a message..."
            rows="2"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
            title="Send message"
          >
            {isConnected ? (
              <Send className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
