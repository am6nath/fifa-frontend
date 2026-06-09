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
  totalVotesCast: number;
  createdAt: string;
  updatedAt: string;
}
