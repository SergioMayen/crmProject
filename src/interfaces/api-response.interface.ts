export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface UserRow {
  id: number;
  username: string;
  user_code: string;
  first_name: string;
  second_name: string | null;
  first_lastname: string;
  second_lastname: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: Date;
}

export interface UserAuthRow {
  id: number;
  username: string;
  user_code: string;
  first_name: string;
  first_lastname: string;
  email: string;
  password: string;
  role: string;
}


export interface ContactRow {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string | null;
  empresa: string | null;
  pipeline_status: string;
  is_active: boolean;
  created_at: Date;
}

export interface InteractionRow {
  id: number;
  contact_id: number;
  interaction_type: string;
  descripcion: string;
  created_by: number;
  created_at: Date;
}

export interface InteractionHistoryRow {
  id: number;
  contact_id: number;
  contact_name: string;
  interaction_type: string;
  descripcion: string;
  created_by: number;
  created_by_username: string;
  created_at: Date;
}