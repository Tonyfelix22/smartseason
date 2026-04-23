export type Role = 'admin' | 'agent';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
}

export type Stage = 'planted' | 'growing' | 'ready' | 'harvested';
export type FieldStatus = 'active' | 'at_risk' | 'completed';
export type CropType = 'maize' | 'wheat' | 'rice' | 'beans' | string;

export interface FieldUpdate {
  id: number;
  field: number;
  agent: number;
  agent_detail: User;
  stage: Stage;
  notes: string;
  created_at: string;
}

export interface Field {
  id: number;
  name: string;
  crop_type: CropType;
  planting_date: string; // ISO date
  stage: Stage;
  status: FieldStatus;
  assigned_agent: number | null;
  assigned_agent_detail: User | null;
  created_by: number;
  created_by_detail: User;
  created_at: string;
  updated_at: string;
  updates?: FieldUpdate[]; // only present on detail endpoint
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}

// Payloads
export interface RegisterPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  role: Role;
}

export interface CreateFieldPayload {
  name: string;
  crop_type: CropType;
  planting_date: string;
  stage: Stage;
  assigned_agent: number | null;
}

export interface CreateFieldUpdatePayload {
  stage: Stage;
  notes: string;
}
