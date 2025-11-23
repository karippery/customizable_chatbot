import { useState, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../types/chat';
import { chatAPI, type Session } from '../services/api';

const SESSION_STORAGE_KEY = 'chatbot-current-session';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sessions and current session on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load all sessions
        const allSessions = await chatAPI.getSessions();
        setSessions(allSessions.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        ));

        // Load current session
        const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (savedSession) {
          const sessionData: Session = JSON.parse(savedSession);
          try {
            const currentSession = await chatAPI.getSession(sessionData.id);
            setSession(currentSession);
            const sessionMessages = await chatAPI.getSessionMessages(currentSession.id);
            setMessages(sessionMessages);
          } catch (error) {
            console.warn('Persisted session not found, creating new session');
            localStorage.removeItem(SESSION_STORAGE_KEY);
            await initializeSession();
          }
        } else {
          await initializeSession();
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        await initializeSession();
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  const initializeSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sessionData = await chatAPI.createSession();
      setSession(sessionData);
      setMessages([]);
      
      // Refresh sessions list
      const allSessions = await chatAPI.getSessions();
      setSessions(allSessions.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
      
      return sessionData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!session) {
      setError('No active session');
      return;
    }

    if (!content.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const userMessage: ChatMessage = {
        message_type: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await chatAPI.sendMessage(session.id, content.trim());
      
      setMessages(prev => [
        ...prev.filter(msg => msg.timestamp !== userMessage.timestamp),
        response.user_message,
        response.assistant_message,
      ]);

      // Update session and refresh sessions list
      const updatedSession = await chatAPI.getSession(session.id);
      setSession(updatedSession);
      
      const allSessions = await chatAPI.getSessions();
      setSessions(allSessions.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [session]);

  const deleteSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      await chatAPI.deleteSession(sessionId);
      
      // Remove from sessions list
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async (sessionId: number) => {
    try {
      setLoading(true);
      const foundSession = await chatAPI.getSession(sessionId);
      if (foundSession) {
        setSession(foundSession);
        const messages = await chatAPI.getSessionMessages(foundSession.id);
        setMessages(messages);
      } else {
        setError('Session not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(async () => {
    await initializeSession();
  }, [initializeSession]);

  const clearError = useCallback(() => setError(null), []);

  const refreshSessions = useCallback(async () => {
    try {
      const allSessions = await chatAPI.getSessions();
      setSessions(allSessions.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ));
    } catch (err) {
      console.error('Error refreshing sessions:', err);
    }
  }, []);

  return {
    messages,
    session,
    sessions,
    loading,
    error,
    initializeSession: clearSession,
    sendMessage,
    loadSession,
    deleteSession,
    clearError,
    refreshSessions,
  };
};