// Firebase Types
export interface FirebaseMessage {
  user?: {
    fbId: string
    name: string
    email?: string
    profile_pic?: string
  }
  user_id?: string
  message: {
    text?: string
    human_help?: boolean
    stop_bot?: boolean
    attachment?: {
      url: string
      type: 'image' | 'video' | 'audio' | 'file'
      payload?: {
        name?: string
        size?: number
      }
    }
  }
  timestamp?: number
  direction?: 'from' | 'to'
}

export interface FirebaseConversation {
  [fbId: string]: any
}

export interface FirebaseConfig {
  apiKey: string
  authDomain: string
  databaseURL: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
}

export interface FirebaseConnectionStatus {
  isConnected: boolean
  error: string | null
  lastConnected?: Date
}

export interface FirebaseMessageCallback {
  (fbId: string, data: FirebaseMessage): void
}

export interface FirebaseErrorCallback {
  (error: Error): void
}

export interface FirebaseMessageData {
  message: {
    text: string
  }
  direction: 'from' | 'to'
  timestamp: number
  type?: 'text' | 'image'
}

export interface FirebaseConversationData {
  messages: FirebaseMessageData[]
  status: 'open' | 'closed'
  unread: number
  lastMessage?: string
  lastMessageTime?: number
} 