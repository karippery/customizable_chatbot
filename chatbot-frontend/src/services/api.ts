import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF tokens and cookies
});

// Enhanced CSRF token handling for Django
api.interceptors.request.use(
  (config) => {
    const csrfToken = getCSRFToken();
    console.log('CSRF Token:', csrfToken); // Debug log
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // For Django, we need to ensure cookies are sent
    config.withCredentials = true;
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers,
    });
    return Promise.reject(error);
  }
);

// Enhanced CSRF token function
function getCSRFToken(): string | null {
  // Try multiple methods to get CSRF token
  let token: string | null = null;
  
  // Method 1: From cookie (standard Django)
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    token = parts.pop()?.split(';').shift() || null;
  }
  
  // Method 2: From meta tag (common in Django templates)
  if (!token) {
    const metaToken = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement;
    if (metaToken) {
      token = metaToken.content;
    }
  }
  
  console.log('Retrieved CSRF token:', token ? 'Yes' : 'No');
  return token;
}

export interface Session {
  id: number;
  session_id: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  session_id: string;
}

export interface ChatMessage {
  id: number;
  message_type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  session?: number;
}

export const chatAPI = {
  // Create new session
  createSession: async (sessionId?: string): Promise<Session> => {
    const response = await api.post<Session>('/sessions/', {
      session_id: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    return response.data;
  },

  // Send message to session
  sendMessage: async (sessionId: number, message: string): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>(
      `/sessions/${sessionId}/send_message/`,
      { message }
    );
    return response.data;
  },

  // Get all sessions
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>('/sessions/');
    return response.data;
  },

  // Get session by ID (numeric ID)
  getSession: async (sessionId: number): Promise<Session> => {
    const response = await api.get<Session>(`/sessions/${sessionId}/`);
    return response.data;
  },

  // Get session by session_id (string UUID)
  getSessionBySessionId: async (sessionId: string): Promise<Session | null> => {
    const sessions = await chatAPI.getSessions();
    return sessions.find(session => session.session_id === sessionId) || null;
  },

  // Get session messages
  getSessionMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    const response = await api.get<ChatMessage[]>(`/sessions/${sessionId}/messages/`);
    return response.data;
  },

  // Delete session - FIXED: Ensure trailing slash for Django
  deleteSession: async (sessionId: number): Promise<void> => {
    const response = await api.delete(`/sessions/${sessionId}/`);
    return response.data;
  },

  // Edit session
  updateSession: async (sessionId: number, data: Partial<Session>): Promise<Session> => {
    const response = await api.put<Session>(`/sessions/${sessionId}/`, data);
    return response.data;
  },
};