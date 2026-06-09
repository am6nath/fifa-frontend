export interface Team {
  id: number;
  name: string;
  code: string;
  group: string;
  logoUrl: string;
  region: string;
  isActive: boolean;
  voteCount?: number;
  createdAt?: string;
}
