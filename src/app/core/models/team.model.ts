export interface Team {
  id: number;
  name: string;
  countryCode: string;
  flagUrl: string;
  groupName: string;
  coachName: string;
  description: string;
  region: string;
  isActive: boolean;
  totalVotes: number;
  createdAt?: string;
  updatedAt?: string;
}
