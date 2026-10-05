
export interface Program {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Achievement {
  year: string;
  students: number;
  medals: number;
  projects: number;
}
