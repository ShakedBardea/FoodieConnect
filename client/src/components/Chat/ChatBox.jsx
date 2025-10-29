import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../../context/AuthContext';
import jqueryAPI from '../../services/jqueryAPI';
import './Chat.css';

const ChatBox = ({ receiverId, receiverName, onMessageReceived, onChatOpened }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);


  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);

    newSocket.emit('user_online', user._id);

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
      
      // Notify parent component about new message (only if not from current user)
      if (onMessageReceived && message.sender._id !== user._id) {
        onMessageReceived(message);
      }
    });

    newSocket.on('user_typing', ({ userId, isTyping: typing }) => {
      if (userId === receiverId) {
        setIsTyping(typing);
      }
    });

    newSocket.on('connect', () => {
    });

    newSocket.on('disconnect', () => {
    });

    newSocket.on('message_sent', (message) => {
    });

    newSocket.on('message_error', (error) => {
      console.error('Message error:', error);
    });

    return () => {
      newSocket.close();
    };
  }, [user._id, receiverId]);

  const fetchMessages = () => {
    jqueryAPI.chat.getChatHistory(receiverId)
      .done((response) => {
        const messages = response.messages || response || [];
        setMessages(messages);
      })
      .fail((xhr, status, error) => {
        console.error('Error fetching messages:', error);
        console.error('Error details:', xhr.responseJSON);
        console.error('Error status:', xhr.status);
        setMessages([]);
      });
  };

  useEffect(() => {
    fetchMessages();
    // Notify that chat was opened
    if (onChatOpened) {
      onChatOpened();
    }
  }, [receiverId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Prevent sending messages to yourself
    if (user._id === receiverId) {
      setError('You cannot send messages to yourself!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const newMsg = {
      _id: Date.now().toString(),
      message: newMessage,
      sender: { _id: user._id, username: user.username },
      createdAt: new Date().toISOString()
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, newMsg]);

    // Try to send via socket if available
    if (socket) {
      socket.emit('send_message', {
        senderId: user._id,
        receiverId,
        message: newMessage
      });
      socket.emit('stop_typing', { senderId: user._id, receiverId });
    }

    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (socket) {
      socket.emit('typing', { senderId: user._id, receiverId });
      setTimeout(() => {
        socket.emit('stop_typing', { senderId: user._id, receiverId });
      }, 1000);
    }
  };

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>Chat with {receiverName}</h3>
      </div>

      <div className="chat-messages">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        {messages.map((msg, idx) => {
          return (
            <div
              key={idx}
              className={`message ${msg.sender._id === user._id ? 'sent' : 'received'}`}
            >
              <div className="message-content">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          );
        })}
        {isTyping && <div className="typing-indicator">typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="chat-input"
        />
        <button type="submit" className="btn-send">Send</button>
      </form>
    </div>
  );
};

export default ChatBox;
