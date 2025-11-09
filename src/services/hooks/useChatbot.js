import { useState, useCallback } from 'react';

/**
 * Hook personalizado para manejo del estado del chatbot
 * Maneja mensajes, estado de escritura y funciones de chat
 */
export const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  // Función para agregar un mensaje
  const addMessage = useCallback((message) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      ...message
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Función para enviar mensaje
  const sendMessage = useCallback(async (text, chatbotService) => {
    if (!text.trim()) return;

    // Agregar mensaje del usuario
    addMessage({
      text: text.trim(),
      sender: 'user'
    });

    setIsTyping(true);

    try {
      // Enviar mensaje al servicio de chatbot
      const response = await chatbotService.sendMessage(text.trim());
      
      if (response.success && response.data) {
        // Extraer el mensaje de la respuesta
        let botMessage = 'Sin respuesta';
        
        if (typeof response.data === 'string') {
          botMessage = response.data;
        } else if (response.data.message) {
          botMessage = response.data.message;
        } else if (response.data.text) {
          botMessage = response.data.text;
        } else if (response.data.response) {
          botMessage = response.data.response;
        } else {
          // Si es un objeto complejo, convertir a JSON legible
          botMessage = JSON.stringify(response.data, null, 2);
        }
        
        // Agregar respuesta exitosa del bot
        addMessage({
          text: botMessage,
          sender: 'bot'
        });
      } else {
        // Agregar mensaje de fallback si hay error
        addMessage({
          text: response.fallback || 'Lo siento, hubo un problema al procesar tu mensaje.',
          sender: 'bot',
          error: true
        });
      }

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      // Agregar mensaje de error
      addMessage({
        text: 'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        sender: 'bot',
        error: true
      });
    } finally {
      setIsTyping(false);
    }
  }, [addMessage]);

  // Función para limpiar mensajes
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Función para obtener el último mensaje
  const getLastMessage = useCallback(() => {
    return messages[messages.length - 1] || null;
  }, [messages]);

  return {
    messages,
    isTyping,
    sendMessage,
    addMessage,
    clearMessages,
    getLastMessage
  };
};

export default useChatbot;
