export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assigned_to: number | null;
  assigned_to_username: string | null;
  created_at: string;
  updated_at: string;
}