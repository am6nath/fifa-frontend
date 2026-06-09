export interface VotingResult {
  teamId: number;
  teamName: string;
  teamCode: string;
  voteCount: number;
  percentage: number;
  rank: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalVotes: number;
  activeSessions: number;
  totalTeams: number;
}
