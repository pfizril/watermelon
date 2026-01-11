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

export interface MoodEntry {
  id: number;
  mood: 'very_happy' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  note: string;
  created_at: string;
}

export interface MoodStats {
  mood_counts: Array<{ mood: string; count: number }>;
  averages: {
    weekly: number;
    monthly: number;
    overall: number;
  };
  daily_breakdown: Array<{
    date: string;
    average: number | null;
    count: number;
  }>;
  weekly_breakdown: Array<{
    week_start: string;
    week_end: string;
    average: number | null;
    count: number;
  }>;
  patterns: Array<{
    type: string;
    message: string;
  }>;
  total_entries: number;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
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

  async getMoodEntries(): Promise<MoodEntry[]> {
    console.log('=== API Get Mood Entries Request ===');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/mood-log/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch mood entries' }));
      console.error('Mood entries request failed:', error);
      throw new Error(error.error || 'Failed to fetch mood entries');
    }

    const result = await response.json();
    console.log('Mood entries request successful:', result);
    console.log('=== End API Get Mood Entries Request ===');
    return result;
  },

  async createMoodEntry(mood: string, note?: string): Promise<MoodEntry> {
    console.log('=== API Create Mood Entry Request ===');
    console.log('Mood:', mood, 'Note:', note ? '[has note]' : 'none');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/mood-log/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ mood, note: note || '' }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create mood entry' }));
      console.error('Create mood entry request failed:', error);
      throw new Error(error.error || 'Failed to create mood entry');
    }

    const result = await response.json();
    console.log('Create mood entry request successful:', result);
    console.log('=== End API Create Mood Entry Request ===');
    return result;
  },

  async updateMoodEntry(id: number, mood: string, note?: string): Promise<MoodEntry> {
    console.log('=== API Update Mood Entry Request ===');
    console.log('ID:', id, 'Mood:', mood, 'Note:', note ? '[has note]' : 'none');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/mood-log/${id}/`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({ mood, note: note || '' }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update mood entry' }));
      console.error('Update mood entry request failed:', error);
      throw new Error(error.error || 'Failed to update mood entry');
    }

    const result = await response.json();
    console.log('Update mood entry request successful:', result);
    console.log('=== End API Update Mood Entry Request ===');
    return result;
  },

  async deleteMoodEntry(id: number): Promise<void> {
    console.log('=== API Delete Mood Entry Request ===');
    console.log('ID:', id);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/mood-log/${id}/`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete mood entry' }));
      console.error('Delete mood entry request failed:', error);
      throw new Error(error.error || 'Failed to delete mood entry');
    }

    console.log('Delete mood entry request successful');
    console.log('=== End API Delete Mood Entry Request ===');
  },

  async getMoodStats(): Promise<MoodStats[]> {
    console.log('=== API Get Mood Stats Request ===');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/mood-log/stats/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch mood stats' }));
      console.error('Mood stats request failed:', error);
      throw new Error(error.error || 'Failed to fetch mood stats');
    }

    const result = await response.json();
    console.log('Mood stats request successful:', result);
    console.log('=== End API Get Mood Stats Request ===');
    return result;
  },

  async getTasks(): Promise<Task[]> {
    console.log('=== API Get Tasks Request ===');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/tasks/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch tasks' }));
      console.error('Tasks request failed:', error);
      throw new Error(error.error || 'Failed to fetch tasks');
    }

    const result = await response.json();
    console.log('Tasks request successful:', result);
    console.log('=== End API Get Tasks Request ===');
    return result;
  },

  async createTask(title: string, description?: string, priority: 'low' | 'medium' | 'high' = 'medium', due_date?: string): Promise<Task> {
    console.log('=== API Create Task Request ===');
    console.log('Title:', title, 'Priority:', priority);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const body: any = { title, description: description || '', priority };
    if (due_date) {
      body.due_date = due_date;
    }

    const response = await fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create task' }));
      console.error('Create task request failed:', error);
      throw new Error(error.error || 'Failed to create task');
    }

    const result = await response.json();
    console.log('Create task request successful:', result);
    console.log('=== End API Create Task Request ===');
    return result;
  },

  async updateTask(id: number, title?: string, description?: string, priority?: 'low' | 'medium' | 'high', status?: 'todo' | 'in_progress' | 'completed', due_date?: string | null): Promise<Task> {
    console.log('=== API Update Task Request ===');
    console.log('ID:', id, 'Updates:', { title, priority, status });

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    // Build body with only provided fields (PATCH allows partial updates)
    const body: any = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (priority !== undefined) body.priority = priority;
    if (status !== undefined) body.status = status;
    if (due_date !== undefined) body.due_date = due_date;

    // Use PATCH for partial updates (allows updating only specific fields)
    const response = await fetch(`${API_URL}/tasks/${id}/`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update task' }));
      console.error('Update task request failed:', error);
      throw new Error(error.error || 'Failed to update task');
    }

    const result = await response.json();
    console.log('Update task request successful:', result);
    console.log('=== End API Update Task Request ===');
    return result;
  },

  async deleteTask(id: number): Promise<void> {
    console.log('=== API Delete Task Request ===');
    console.log('ID:', id);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/tasks/${id}/`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete task' }));
      console.error('Delete task request failed:', error);
      throw new Error(error.error || 'Failed to delete task');
    }

    console.log('Delete task request successful');
    console.log('=== End API Delete Task Request ===');
  },

  async completeTask(id: number): Promise<Task> {
    console.log('=== API Complete Task Request ===');
    console.log('ID:', id);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/tasks/complete/${id}/`, {
      method: 'PUT',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to complete task' }));
      console.error('Complete task request failed:', error);
      throw new Error(error.error || 'Failed to complete task');
    }

    const result = await response.json();
    console.log('Complete task request successful:', result);
    console.log('=== End API Complete Task Request ===');
    return result;
  },

  async getGoals(): Promise<Goal[]> {
    console.log('=== API Get Goals Request ===');

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/motivation/goals/`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch goals' }));
      console.error('Goals request failed:', error);
      throw new Error(error.error || 'Failed to fetch goals');
    }

    const result = await response.json();
    console.log('Goals request successful:', result);
    console.log('=== End API Get Goals Request ===');
    return result;
  },

  async createGoal(title: string, description: string, target_date: string): Promise<Goal> {
    console.log('=== API Create Goal Request ===');
    console.log('Title:', title, 'Target Date:', target_date);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/motivation/goals/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ title, description, target_date }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create goal' }));
      console.error('Create goal request failed:', error);
      throw new Error(error.error || 'Failed to create goal');
    }

    const result = await response.json();
    console.log('Create goal request successful:', result);
    console.log('=== End API Create Goal Request ===');
    return result;
  },

  async updateGoal(id: number, title?: string, description?: string, target_date?: string, status?: 'not_started' | 'in_progress' | 'completed'): Promise<Goal> {
    console.log('=== API Update Goal Request ===');
    console.log('ID:', id, 'Updates:', { title, status });

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const body: any = {};
    if (title !== undefined) body.title = title;
    if (description !== undefined) body.description = description;
    if (target_date !== undefined) body.target_date = target_date;
    if (status !== undefined) body.status = status;

    const response = await fetch(`${API_URL}/motivation/goals/${id}/`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update goal' }));
      console.error('Update goal request failed:', error);
      throw new Error(error.error || 'Failed to update goal');
    }

    const result = await response.json();
    console.log('Update goal request successful:', result);
    console.log('=== End API Update Goal Request ===');
    return result;
  },

  async deleteGoal(id: number): Promise<void> {
    console.log('=== API Delete Goal Request ===');
    console.log('ID:', id);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/motivation/goals/${id}/`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete goal' }));
      console.error('Delete goal request failed:', error);
      throw new Error(error.error || 'Failed to delete goal');
    }

    console.log('Delete goal request successful');
    console.log('=== End API Delete Goal Request ===');
  },

  async getAnalytics(days: number = 7): Promise<any> {
    console.log('=== API Get Analytics Request ===');
    console.log('Days:', days);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/screen-activity/analytics/?days=${days}`, {
      headers,
      credentials: 'include',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch analytics' }));
      console.error('Analytics request failed:', error);
      throw new Error(error.error || 'Failed to fetch analytics');
    }

    const result = await response.json();
    console.log('Analytics request successful:', result);
    console.log('=== End API Get Analytics Request ===');
    return result;
  },

  async createFocusSession(start_time: string, focus_mode: string = 'medium'): Promise<any> {
    console.log('=== API Create Focus Session Request ===');
    console.log('Start time:', start_time, 'Mode:', focus_mode);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/screen-activity/focus-sessions/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ start_time, focus_mode }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create focus session' }));
      console.error('Create focus session request failed:', error);
      throw new Error(error.error || 'Failed to create focus session');
    }

    const result = await response.json();
    console.log('Create focus session request successful:', result);
    console.log('=== End API Create Focus Session Request ===');
    return result;
  },

  async updateFocusSession(id: number, end_time: string, duration_seconds: number): Promise<any> {
    console.log('=== API Update Focus Session Request ===');
    console.log('ID:', id, 'Duration:', duration_seconds);

    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    };

    const response = await fetch(`${API_URL}/screen-activity/focus-sessions/${id}/`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify({ end_time, duration_seconds }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update focus session' }));
      console.error('Update focus session request failed:', error);
      throw new Error(error.error || 'Failed to update focus session');
    }

    const result = await response.json();
    console.log('Update focus session request successful:', result);
    console.log('=== End API Update Focus Session Request ===');
    return result;
  },
}; 