export interface VotingSession {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isPublished: boolean;
  isClosed: boolean;
  status: 'Upcoming' | 'Active' | 'Closed';
  teamIds?: number[];
  regionFilter?: string;
  winnersCount?: number;
  createdAt?: string;
}
