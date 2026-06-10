export interface AuthResponse {
  token: string;
  email: string;
  userName: string;
  role: string;
}

export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}
