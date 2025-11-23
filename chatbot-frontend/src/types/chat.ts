export interface ChatMessage {
  id?: number;
  message_type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  session?: number;
}

export interface ChatSession {
  id?: number;
  session_id: string;
  created_at: string;
  updated_at: string;
}

export interface SendMessageResponse {
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  session_id: string;
}