export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
  isError?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  type: 'image';
  data: string; // base64
  mimeType: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}
