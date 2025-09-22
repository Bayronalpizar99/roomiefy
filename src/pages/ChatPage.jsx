import React, { useState, useEffect } from 'react';
import './PageStyles.css';
import './ChatPage.css';
import { fetchConversations, sendMessage } from '../services/api';
import { PaperPlaneIcon, CheckIcon } from '@radix-ui/react-icons';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

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
    setNewMessage('');
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return;

    const content = newMessage.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = { id: tempId, sender: 'me', content, time, status: 'sent' };
    const updatedSelected = {
      ...selectedConversation,
      messages: [...(selectedConversation.messages || []), optimisticMessage],
      lastMessage: content,
      lastMessageTime: time,
    };

    setSelectedConversation(updatedSelected);
    setConversations(prev => prev.map(c => c.id === selectedConversation.id ? updatedSelected : c));
    setNewMessage('');
    setSending(true);

    try {
      const created = await sendMessage(selectedConversation.id, content);
      if (created && created.id) {
        const isRead = (created.status === 'read') || created.isRead || created.seen || created.responded;
        const serverMessage = {
          id: created.id,
          sender: created.sender || 'me',
          content: created.content ?? content,
          time: created.time || time,
          status: isRead ? 'read' : 'sent',
        };

        setSelectedConversation(prevSel => {
          if (!prevSel || prevSel.id !== selectedConversation.id) return prevSel;
          const messages = (prevSel.messages || []).map(m => m.id === tempId ? serverMessage : m);
          return {
            ...prevSel,
            messages,
            lastMessage: serverMessage.content,
            lastMessageTime: serverMessage.time,
          };
        });

        setConversations(prev => prev.map(c => {
          if (c.id !== selectedConversation.id) return c;
          const messages = (c.messages || []).map(m => m.id === tempId ? serverMessage : m);
          return {
            ...c,
            messages,
            lastMessage: serverMessage.content,
            lastMessageTime: serverMessage.time,
          };
        }));
      }
    } catch (e) {
      console.error('Error al enviar el mensaje:', e);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Cargando conversaciones...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="main-content">
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
                      <p className="last-message">{conversation.lastMessage}</p>
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
                      <div className="message-meta">
                        <span className="message-time">{message.time}</span>
                        {message.sender === 'me' && (
                          <span className={`message-status ${(
                            message.status === 'read' || message.isRead || message.seen || message.responded
                          ) ? 'read' : 'sent'}`}>
                            <CheckIcon className="check one" />
                            <CheckIcon className="check two" />
                          </span>
                        )}
                      </div>
                    </div>
                  )) || <p>No hay mensajes en esta conversación.</p>}
                </div>
                <div className="message-input">
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <PaperPlaneIcon
                    className="send-icon"
                    onClick={handleSendMessage}
                    title={sending ? 'Enviando...' : 'Enviar'}
                  />
                  <button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                    {sending ? 'Enviando...' : 'Enviar'}
                  </button>
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
    </div>
  );
};

export default ChatPage;