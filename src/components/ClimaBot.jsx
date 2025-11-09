import React, { useState, useEffect } from 'react';
import { chatbotService, useChatbot } from '../services/index.js';

function ClimaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [currentContext, setCurrentContext] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // ✅ Usar el nuevo hook personalizado
  const {
    messages,
    isTyping,
    sendMessage: sendChatMessage,
    addMessage,
    clearMessages
  } = useChatbot();

  // Estado para manejar errores de conexión
  const [connectionError, setConnectionError] = useState(null);

  // Cerrar con tecla Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Escuchar evento personalizado para abrir ClimaBot con pregunta contextual
  useEffect(() => {
    const handleOpenClimaBot = async (event) => {
      const { question, context, autoSend, useGemini } = event.detail;
      
      console.log('🤖 ClimaBot recibió evento:', { question, context, autoSend, useGemini });
      
      // Abrir el chat si no está abierto
      if (!isOpen) {
        setIsOpen(true);
      }
      
      // Si autoSend es true, enviar la pregunta automáticamente
      if (autoSend && question) {
        // Esperar un poco para que el chat se abra completamente
        setTimeout(async () => {
          try {
            if (useGemini) {
              // Usar Gemini para análisis avanzado
              console.log('🧠 Enviando pregunta a Gemini...');
              
              // Agregar mensaje del usuario
              addMessage({
                text: "🧠 Analiza estos datos con IA avanzada",
                sender: 'user'
              });
              
              try {
                const response = await chatbotService.explainWithGemini(question);
                
                // Agregar respuesta de Gemini
                addMessage({
                  text: response.data?.response || response.data?.message || response.message || 'Error obteniendo respuesta de Gemini',
                  sender: 'bot',
                  model: 'gemini-pro'
                });
                
                console.log('✅ Respuesta de Gemini agregada al chat');
              } catch (error) {
                console.error('❌ Error con Gemini:', error);
                addMessage({
                  text: 'Error obteniendo respuesta de Gemini. Inténtalo de nuevo.',
                  sender: 'bot',
                  error: true
                });
              }
              
            } else {
              // Usar chatbot normal
              await sendChatMessage(question, chatbotService);
            }
            console.log('✅ Pregunta contextual enviada automáticamente');
          } catch (error) {
            console.error('❌ Error enviando pregunta contextual:', error);
          }
        }, 500);
      } else if (question) {
        // Solo establecer la pregunta en el input
        setInput(question);
      }
    };

    window.addEventListener('openClimaBot', handleOpenClimaBot);
    
    return () => {
      window.removeEventListener('openClimaBot', handleOpenClimaBot);
    };
  }, [isOpen, sendChatMessage, addMessage]);

  // ✅ Verificar conexión y enviar saludo inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen, messages.length]);

  // Función para inicializar el chat
  const initializeChat = async () => {
    try {
      // Verificar estado del servidor
      const healthStatus = await chatbotService.getHealthStatus();
      setIsConnected(healthStatus.status !== 'unhealthy');
      
      if (healthStatus.status === 'unhealthy') {
        setConnectionError('Servidor no disponible');
        return;
      }

      // Enviar mensaje de saludo inicial
      await sendChatMessage('hola', chatbotService);
      setConnectionError(null);
    } catch (error) {
      console.error('Error inicializando chat:', error);
      setIsConnected(false);
      setConnectionError('Error de conexión');
    }
  };

  // Detectar contexto basado en las respuestas del bot
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'bot') {
      const text = lastMessage.text;

      // Detectar menú de estaciones
      if (text.includes('📍 *Estaciones disponibles:*') ||
          text.includes('💡 *Escribe el número de la estación*') ||
          text.includes('Estación') && text.includes('📍')) {
        setCurrentContext('estaciones');
      }
      // Detectar menú educativo/conceptos
      else if (text.includes('📘 *Modo educativo activado!*') ||
               text.includes('💡 *Escribe la letra* de la pregunta') ||
               text.includes('conceptos') && text.includes('📚')) {
        setCurrentContext('conceptos');
      }
      // Limpiar contexto en menú principal, respuestas o fuera de scope
      else if (text.includes('🅰️ Ver estaciones disponibles') ||
               text.includes('💡 Escribe "a" para ver otras estaciones') ||
               text.includes('💡 Escribe "b" para ver otros conceptos') ||
               text.includes('🤔 Tu pregunta sobre') ||  // fuera de scope
               text.includes('Soy especialista en') ||   // fuera de scope
               text.includes('¡Hola! 👋') ||             // saludo inicial
               text.includes('asistente de datos climáticos')) {
        setCurrentContext(null);
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    setInput("");
    
    try {
      await sendChatMessage(trimmed, chatbotService);
      setConnectionError(null);
      setIsConnected(true);
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      setConnectionError('Error enviando mensaje');
      setIsConnected(false);
    }
  };

  // 🆕 Función para obtener placeholder dinámico
  const getPlaceholder = () => {
    if (!isConnected) {
      return "Sin conexión al servidor...";
    }
    
    if (currentContext === 'estaciones') {
      return "Escribe el número de la estación (1, 2, 3...)";
    } else if (currentContext === 'conceptos') {
      return "Escribe la letra del concepto (A, B, C...) o una pregunta";
    } else {
      return "Escribe tu mensaje o haz una pregunta...";
    }
  };

  // 🆕 Función para obtener sugerencias rápidas
  const getQuickSuggestions = () => {
    if (currentContext === 'estaciones') {
      return ['1', '2', '3', '4', '5'];
    } else if (currentContext === 'conceptos') {
      return ['A', 'B', 'C', 'D', 'E', 'F'];
    } else {
      return ['hola', 'a', 'b', '¿cuántas estaciones hay?', '¿qué es PM2.5?'];
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 🆕 Función para enviar sugerencia rápida
  const sendQuickSuggestion = async (suggestion) => {
    if (isTyping || !isConnected) return;
    
    setInput(suggestion);
    // Auto-enviar después de un pequeño delay para mejor UX
    setTimeout(async () => {
      try {
        await sendChatMessage(suggestion, chatbotService);
        setInput("");
      } catch (error) {
        console.error('Error enviando sugerencia:', error);
        setConnectionError('Error enviando mensaje');
      }
    }, 100);
  };

  // Función para reintentar conexión
  const retryConnection = async () => {
    setConnectionError(null);
    await initializeChat();
  };

  return (
    <div className="relative">
      {/* Botón flotante lanzador */}
      <button
        aria-label="Abrir o cerrar Nubi"
        aria-expanded={isOpen}
        title="Abrir/cerrar Nubi ☁️"
        onClick={() => setIsOpen((o) => !o)}
        className={`fixed z-50 bottom-6 right-6 h-12 w-12 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-colors ${
          isOpen ? "ring-2 ring-emerald-300" : ""
        } ${!isConnected ? "bg-red-500 hover:bg-red-600" : ""}`}
      >
        {!isConnected ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
          >
            <path d="M6 18a4 4 0 0 1 0-8c.2 0 .39.01.58.04A6 6 0 0 1 18 8a5 5 0 0 1 0 10H7.5c-.5 0-1-.19-1.37-.53-.39-.35-.63-.84-.63-1.37Z" />
          </svg>
        )}
      </button>

      {/* Overlay para cerrar con clic fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-transparent"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Ventana de chat */}
      <div
        className={`fixed z-40 bottom-20 right-6 w-[350px] h-[500px] rounded-2xl shadow-lg border border-emerald-100 overflow-hidden bg-white ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        } transition-all duration-200 ease-out`}
        role="dialog"
        aria-label="Ventana de chat ClimaBot"
      >
        {/* Header */}
        <div className="sticky top-0 bg-emerald-400/90 backdrop-blur-sm text-emerald-900 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold flex items-center gap-2">
            <span>Nubi ☁️</span>
            {currentContext && (
              <span className="text-xs opacity-75 bg-emerald-300/50 px-2 py-1 rounded-full">
                {currentContext === 'estaciones' ? '📍 estaciones' : '📚 conceptos'}
              </span>
            )}
            {!isConnected && (
              <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
                ⚠️ Sin conexión
              </span>
            )}
          </div>
          <button
            aria-label="Cerrar chat"
            onClick={() => setIsOpen(false)}
            className="text-emerald-900/80 hover:text-emerald-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" />
            </svg>
          </button>
        </div>

        {/* Área de mensajes */}
        <div className="h-[340px] overflow-y-auto p-3 space-y-2 bg-white">
          {/* Estado de conexión */}
          {connectionError && (
            <div className="bg-red-100 text-red-800 px-3 py-2 rounded-xl text-sm flex items-center justify-between">
              <span>⚠️ {connectionError}</span>
              <button
                onClick={retryConnection}
                className="text-xs bg-red-200 hover:bg-red-300 px-2 py-1 rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Mensaje de bienvenida si no hay mensajes */}
          {messages.length === 0 && isConnected && (
            <div className="bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl text-sm text-center">
              ☁️ ¡Hola! Soy Nubi, tu asistente climático. Escribe "hola" para comenzar.
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] px-3 py-2 rounded-xl shadow ${
                m.sender === "bot"
                  ? m.model === "gemini-pro" 
                    ? "bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 self-start border border-blue-200"
                    : "bg-gray-100 text-gray-800 self-start"
                  : "bg-emerald-100 text-emerald-900 self-end ml-auto"
              } ${m.error ? "bg-red-100 text-red-800" : ""}`}
            >
              {m.model === "gemini-pro" && m.sender === "bot" && (
                <div className="flex items-center gap-1 mb-2 text-xs text-blue-700 font-medium">
                  🧠 <span>Gemini IA</span>
                </div>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm">{m.text}</pre>
              {m.timestamp && (
                <div className="text-xs opacity-60 mt-1 flex items-center justify-between">
                  <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                  {m.model === "gemini-pro" && (
                    <span className="text-blue-600 font-medium">Gemini</span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Indicador de carga */}
          {isTyping && (
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-xl self-start flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" />
              </svg>
              <span>Nubi está pensando...</span>
            </div>
          )}
        </div>

        {/* 🆕 Sugerencias rápidas */}
        {(currentContext || messages.length === 0) && isConnected && (
          <div className="px-3 py-2 bg-emerald-50 border-t border-emerald-100">
            <div className="text-xs text-emerald-700 mb-2">
              {currentContext ? 'Sugerencias rápidas:' : 'Comenzar con:'}
            </div>
            <div className="flex gap-1 flex-wrap">
              {getQuickSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendQuickSuggestion(suggestion)}
                  className="px-2 py-1 bg-emerald-200 text-emerald-800 rounded text-xs hover:bg-emerald-300 transition-colors disabled:opacity-50"
                  disabled={isTyping || !isConnected}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer de entrada */}
        <div className="sticky bottom-0 bg-white border-t border-emerald-100 p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="flex-1 rounded-xl border border-emerald-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-gray-800 text-sm disabled:bg-gray-100"
              disabled={isTyping || !isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !isConnected || !input.trim()}
              className={`rounded-xl px-4 py-2 shadow transition-colors text-sm ${
                isTyping || !isConnected || !input.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-400 text-emerald-900 hover:bg-emerald-500"
              }`}
            >
              {isTyping ? "..." : "Enviar"}
            </button>
          </div>
          
          {/* Botón para limpiar chat */}
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="mt-2 text-xs text-emerald-600 hover:text-emerald-800 transition-colors"
            >
              🗑️ Limpiar conversación
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ClimaBot;
