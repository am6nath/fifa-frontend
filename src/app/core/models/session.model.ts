export interface VotingSession {
  id: number;
  title: string;
  votingStartAt: string;
  votingEndAt: string;
  isVotingClosedManually: boolean;
  resultsPublished: boolean;
  resultsPublishedAt?: string;
  publishedBy?: string;
  notes?: string;
  teamIds: number[];
  regionFilter?: string;
  totalVotes: number;
  winnersCount: number;
  isActive: boolean;
  status: 'Upcoming' | 'Active' | 'Closed';
  createdAt?: string;
  updatedAt?: string;
}
