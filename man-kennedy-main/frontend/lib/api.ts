const API_URL = 'http://localhost:8000/api';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface Quote {
  q: string;
  a: string;
  h: string;
}

export interface QuotesResponse {
  quotes: Quote[];
}

export interface CalendarConnection {
  id: number;
  provider: string;
  calendar_name: string;
  is_active: boolean;
  last_synced_at: string | null;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  all_day: boolean;
  calendar_connection: number;
}

export interface CalendarSyncResult {
  synced: number;
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatResponse {
  message: string;
  role: 'assistant';
}

const getAuthHeader = (): Record<string, string> => {
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('token='))
    ?.split('=')[1];
  
  console.log('=== API Auth Header Debug ===');
  console.log('All cookies:', document.cookie);
  console.log('Token exists:', !!token);
  console.log('Token value:', token);
  console.log('=== End API Auth Header Debug ===');
  
  if (!token) {
    console.warn('No token found in cookies');
    return {};
  }
  
  return { 'Authorization': `Bearer ${token}` };
};

export const api = {
  async login(data: LoginData): Promise<LoginResponse> {
    console.log('=== API Login Request ===');
    console.log('Request data:', { ...data, password: '[REDACTED]' });
    
    const response = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json();
      console.error('Login request failed:', error);
      throw new Error(error.error || 'Login failed');
    }

    const result = await response.json();
    console.log('Login successful:', { ...result, access: '[REDACTED]', refresh: '[REDACTED]' });
    console.log('=== End API Login Request ===');
    return result;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    console.log('=== API Register Request ===');
    console.log('Request data:', { ...data, password: '[REDACTED]' });
    
    const response = await fetch(`${API_URL}/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json();
      console.error('Registration request failed:', error);
      throw new Error(error.error || 'Registration failed');
    }

    const result = await response.json();
    console.log('Registration successful:', { ...result, access: '[REDACTED]', refresh: '[REDACTED]' });
    console.log('=== End API Register Request ===');
    return result;
  },

  async refreshToken(refresh: string): Promise<{ access: string }> {
    console.log('=== API Token Refresh Request ===');
    console.log('Refresh token:', refresh ? '[REDACTED]' : 'none');
    
    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ refresh }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('Token refresh request failed');
      throw new Error('Token refresh failed');
    }

    const result = await response.json();
    console.log('Token refresh successful:', { access: '[REDACTED]' });
    console.log('=== End API Token Refresh Request ===');
    return result;
  },

  async getProfile() {
    console.log('=== API Profile Request ===');
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    console.log('Request headers:', headers);

    const response = await fetch(`${API_URL}/auth/profile/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      console.error('Profile request failed:', error);
      throw new Error(error.error || 'Failed to fetch profile');
    }

    const result = await response.json();
    console.log('Profile request successful:', result);
    console.log('=== End API Profile Request ===');
    return result;
  },

  async getZenQuote(type: 'random' | 'today' | 'quotes' = 'random'): Promise<QuotesResponse> {
    console.log('=== API Zen Quote Request ===');
    console.log('Quote type:', type);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/motivation/quotes/zen/?type=${type}`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch zen quote' }));
      console.error('Zen quote request failed:', error);
      throw new Error(error.error || 'Failed to fetch zen quote');
    }

    const result = await response.json();
    console.log('Zen quote request successful:', result);
    console.log('=== End API Zen Quote Request ===');
    return result;
  },

  async connectGoogleCalendar(): Promise<{ authorization_url: string }> {
    console.log('=== API Google Calendar Connect Request ===');
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/calendar/google/authorize/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to connect Google Calendar' }));
      console.error('Google Calendar connect request failed:', error);
      throw new Error(error.error || 'Failed to connect Google Calendar');
    }

    const result = await response.json();
    console.log('Google Calendar connect successful:', result);
    console.log('=== End API Google Calendar Connect Request ===');
    return result;
  },

  async getCalendarConnections(): Promise<CalendarConnection[]> {
    console.log('=== API Calendar Connections Request ===');
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/calendar/connections/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch calendar connections' }));
      console.error('Calendar connections request failed:', error);
      throw new Error(error.error || 'Failed to fetch calendar connections');
    }

    const result = await response.json();
    console.log('Calendar connections request successful:', result);
    console.log('=== End API Calendar Connections Request ===');
    return result;
  },

  async disconnectCalendar(id: number): Promise<void> {
    console.log('=== API Disconnect Calendar Request ===');
    console.log('Connection ID:', id);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/calendar/connections/${id}/disconnect/`, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to disconnect calendar' }));
      console.error('Disconnect calendar request failed:', error);
      throw new Error(error.error || 'Failed to disconnect calendar');
    }

    console.log('Disconnect calendar successful');
    console.log('=== End API Disconnect Calendar Request ===');
  },

  async syncCalendar(connectionId?: number): Promise<CalendarSyncResult> {
    console.log('=== API Sync Calendar Request ===');
    console.log('Connection ID:', connectionId);
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const body = connectionId ? JSON.stringify({ connection_id: connectionId }) : JSON.stringify({});

    const response = await fetch(`${API_URL}/calendar/sync/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to sync calendar' }));
      console.error('Sync calendar request failed:', error);
      throw new Error(error.error || 'Failed to sync calendar');
    }

    const result = await response.json();
    console.log('Sync calendar successful:', result);
    console.log('=== End API Sync Calendar Request ===');
    
    // If syncing specific connection, return the result directly
    // If syncing all, return aggregated results
    if (connectionId) {
      return {
        synced: result.synced || 0,
        created: result.created || 0,
        updated: result.updated || 0,
        deleted: result.deleted || 0,
        errors: result.errors || []
      };
    } else {
      // For all connections sync, aggregate the results
      const aggregated = result.results?.reduce((acc: any, r: any) => ({
        synced: acc.synced + (r.synced || 0),
        created: acc.created + (r.created || 0),
        updated: acc.updated + (r.updated || 0),
        deleted: acc.deleted + (r.deleted || 0),
        errors: [...acc.errors, ...(r.errors || [])]
      }), { synced: 0, created: 0, updated: 0, deleted: 0, errors: [] }) || { synced: 0, created: 0, updated: 0, deleted: 0, errors: [] };
      
      return aggregated;
    }
  },

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    console.log('=== API Upcoming Events Request ===');
    
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/calendar/events/upcoming/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch upcoming events' }));
      console.error('Upcoming events request failed:', error);
      throw new Error(error.error || 'Failed to fetch upcoming events');
    }

    const result = await response.json();
    console.log('Upcoming events request successful:', result);
    console.log('=== End API Upcoming Events Request ===');
    return result;
  },

  async getChatMessages(): Promise<ChatMessage[]> {
    console.log('=== API Get Chat Messages Request ===');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/chatbot/messages/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch chat messages' }));
      console.error('Chat messages request failed:', error);
      throw new Error(error.error || 'Failed to fetch chat messages');
    }

    const result = await response.json();
    console.log('Chat messages request successful:', result);
    console.log('=== End API Get Chat Messages Request ===');
    return result;
  },

  async sendChatMessage(message: string): Promise<ChatResponse> {
    console.log('=== API Send Chat Message Request ===');
    console.log('Message:', message);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/chatbot/chat/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ message }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to send chat message' }));
      console.error('Send chat message request failed:', error);
      throw new Error(error.error || 'Failed to send chat message');
    }

    const result = await response.json();
    console.log('Send chat message request successful:', result);
    console.log('=== End API Send Chat Message Request ===');
    return result;
  },
}; 