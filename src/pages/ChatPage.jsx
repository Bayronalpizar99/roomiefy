import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './PageStyles.css';
import './ChatPage.css';
import { fetchConversations, sendMessage, fetchConversation, markConversationAsRead } from '../services/api';
import { PaperPlaneIcon, CheckIcon } from '@radix-ui/react-icons';

const ChatPage = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messageInputRef = useRef(null);
  const hasSetPrefilledMessage = useRef(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const getConversations = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchConversations();
        if (error) {
          setError('Error al cargar las conversaciones');
          setConversations([]);
        } else {
          const list = Array.isArray(data) ? data : [];
          setConversations(list);

          // Si hay una conversación preseleccionada desde la navegación
          if (location.state?.selectedConversation) {
            setSelectedConversation(location.state.selectedConversation);
            // No establecer el mensaje prefijado aquí, lo manejaremos en otro efecto
          }
        }
      } catch (err) {
        setError('Error al cargar las conversaciones');
        // Error al cargar conversaciones
      } finally {
        setLoading(false);
      }
    };

    getConversations();
  }, []); // Eliminamos location.state de las dependencias
  
  // Efecto separado para manejar el mensaje prefijado
  useEffect(() => {
    if (location.state?.prefilledMessage && !hasSetPrefilledMessage.current) {
      setNewMessage(location.state.prefilledMessage);
      hasSetPrefilledMessage.current = true;
      
      // Opcional: hacer foco en el campo de mensaje
      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }
  }, [location.state?.prefilledMessage]);

  const handleSelectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    setNewMessage('');
    
    // Marcar conversación como leída
    if (conversation.id && user?.id) {
      await markConversationAsRead(conversation.id, user.id);

      // Cargar conversación con sus mensajes desde la API de conversación/{id}
      try {
        const { data: convData, error } = await fetchConversation(conversation.id);
        if (!error && convData) {
          let messages = [];
          if (Array.isArray(convData)) {
            // La API devuelve un arreglo de conversaciones; buscar la que coincida por id
            const found = convData.find(c => String(c?.id) === String(conversation.id));
            messages = Array.isArray(found?.messages) ? found.messages : [];
          } else if (Array.isArray(convData?.messages)) {
            messages = convData.messages;
          } else if (convData && convData.messages) {
            messages = Array.isArray(convData.messages) ? convData.messages : [];
          }
          
          // Obtener el ID del usuario actual
          let currentUserId = '';
          try { 
            currentUserId = localStorage.getItem('roomiefy_user_id') || '';
          } catch (e) {
            console.error('Error al obtener el ID del usuario:', e);
          }
          
          // Asegurarse de que los mensajes tengan el formato correcto
          messages = messages.map(msg => {
            // Determinar el remitente del mensaje
            const senderId = String(msg.sender || msg.sender_id || '');
            const isCurrentUser = currentUserId && senderId === String(currentUserId);
            
            return {
              ...msg,
              // Si el remitente es el usuario actual, asegurarse de que el ID coincida exactamente
              sender: isCurrentUser ? currentUserId : senderId,
              sender_id: isCurrentUser ? currentUserId : senderId,
              // Asegurar que el formato de tiempo sea consistente
              time: msg.time || (msg.timestamp 
                ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
            };
          });
          setSelectedConversation(prev => ({
            ...prev,
            messages
          }));
        }
      } catch (error) {
        // Error al cargar la conversación
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return;

    const content = newMessage.trim();
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const tempId = `temp-${Date.now()}`;

    // Obtener el ID del usuario actual de forma segura
    let currentUserId = '';
    try { 
      currentUserId = localStorage.getItem('roomiefy_user_id') || ''; 
    } catch (e) {
      console.error('Error al obtener el ID del usuario:', e);
    }

    // Crear mensaje optimista con el ID del remitente
    const optimisticMessage = { 
      id: tempId, 
      sender: currentUserId, 
      sender_id: currentUserId,
      content, 
      time, 
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    // Actualizar la UI de forma optimista
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
      // Enviar el mensaje al servidor con el sender_id
      const created = await sendMessage(selectedConversation.id, content, currentUserId);
      if (created && created.id) {
        const isRead = (created.status === 'read') || created.isRead || created.seen || created.responded;
        const serverSenderRaw = created.sender || created.sender_id;
        const normalizedSender = !serverSenderRaw || serverSenderRaw === 'unknown' ? currentUserId : serverSenderRaw;
        const serverMessage = {
          id: created.id,
          sender: normalizedSender,
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
      // Error al enviar el mensaje
    } finally {
      setSending(false);
    }
  };

  // Auto-resize del textarea
  useEffect(() => {
    const el = messageInputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  }, [newMessage, selectedConversation]);

  if (loading) {
    return <div className="loading-container">Cargando conversaciones...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="main-content chat-main">
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
                  {selectedConversation.messages && selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((message) => {
                      // Obtener el ID del usuario actual de forma segura
                      let currentUserId = '';
                      try {
                        currentUserId = localStorage.getItem('roomiefy_user_id') || '';
                      } catch (e) {
                        console.error('Error al obtener el ID del usuario:', e);
                      }
                      
                      // Determinar el remitente del mensaje
                      const senderId = String(message.sender || message.sender_id || '');
                      const isCurrentUser = currentUserId && senderId === String(currentUserId);
                      
                      return (
                        <div 
                          key={message.id}
                          className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                        >
                          <div className="message-content">{message.content}</div>
                          <div className="message-meta">
                            <span className="message-time">{message.time}</span>
                            {isCurrentUser && (
                              <span className={`message-status ${
                                (message.status === 'read' || message.isRead || message.seen || message.responded) 
                                  ? 'read' 
                                  : 'sent'
                              }`}>
                                <CheckIcon className="check one" />
                                <CheckIcon className="check two" />
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No hay mensajes en esta conversación.</p>
                  )}
                </div>
                <div className="message-input">
                  <div className="search-bar">
                    <textarea
                      ref={messageInputRef}
                      placeholder="Escribe un mensaje... (Ctrl+Enter para enviar)"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
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