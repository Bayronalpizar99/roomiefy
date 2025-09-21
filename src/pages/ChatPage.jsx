import React, { useState, useEffect } from 'react';
import './PageStyles.css';
import './ChatPage.css';
import { fetchConversations } from '../services/api';
import { PaperPlaneIcon } from '@radix-ui/react-icons';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  useEffect(() => {
    const getConversations = async () => {
      try {
        setLoading(true);
        const data = await fetchConversations();
        setConversations(data);
        setLoading(false);
      } catch (err) {
        setError('Error al cargar las conversaciones');
        setLoading(false);
        console.error('Error al cargar las conversaciones:', err);
      }
    };

    getConversations();
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return <div className="loading-container">Cargando conversaciones...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="chat-page-container">
      <h1>Mis Conversaciones</h1>
      
      <div className="chat-layout">
        <div className="conversations-list">
          <h2>Chats</h2>
          {conversations.length === 0 ? (
            <p>No hay conversaciones disponibles.</p>
          ) : (
            <ul>
              {conversations.map((conversation) => (
                <li 
                  key={conversation.id} 
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
                  onClick={() => handleSelectConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    <img src={conversation.avatar || 'https://via.placeholder.com/40'} alt="Avatar" />
                  </div>
                  <div className="conversation-info">
                    <h3>{conversation.name}</h3>
                    <p>{conversation.lastMessage}</p>
                  </div>
                  <div className="conversation-time">
                    {conversation.lastMessageTime}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="chat-messages">
          {selectedConversation ? (
            <>
              <div className="chat-header">
                <div className="conversation-avatar">
                  <img src={selectedConversation.avatar || 'https://via.placeholder.com/40'} alt="Avatar" />
                </div>
                <h2>{selectedConversation.name}</h2>
              </div>
              <div className="messages-container">
                {selectedConversation.messages?.map((message) => (
                  <div 
                    key={message.id} 
                    className={`message ${message.sender === 'me' ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.content}</div>
                    <div className="message-time">{message.time}</div>
                  </div>
                )) || <p>No hay mensajes en esta conversación.</p>}
              </div>
              <div className="message-input">
                <div className="search-bar">
                  <input type="text" placeholder="Escribe un mensaje..." />
                </div>
                <PaperPlaneIcon className="send-icon" />
                <button>Enviar</button>
              </div>
            </>
          ) : (
            <div className="no-conversation-selected">
              <p>Selecciona una conversación para comenzar a chatear</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;