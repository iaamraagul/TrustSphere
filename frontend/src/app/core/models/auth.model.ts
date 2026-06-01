export interface LoginRequest {
  email: string;
  password: string;
  role: 'ADMIN' | 'USER';
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  lastLogin?: string;
  status?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
