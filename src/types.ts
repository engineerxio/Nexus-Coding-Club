export interface User {
  id: string;
  nexusId?: string;
  fullName: string;
  institute: string;
  gender: string;
  email: string;
  password?: string;
  joinDate: string;
  activities?: string[];
  rankings?: ContestRanking[];
  certificates?: Certificate[];
}

export interface Event {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  seats: number;
  bannerColor: string;
}

export interface ContestRanking {
  id: string;
  contestName: string;
  rank: number;
  score: number;
  date: string;
  status: 'Completed' | 'Ongoing' | 'Upcoming';
}

export interface Certificate {
  id: string;
  title: string;
  description: string;
  awardTitle: string;
  date: string;
  isLocked: boolean;
}
