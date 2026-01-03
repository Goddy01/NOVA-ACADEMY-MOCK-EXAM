
export enum CourseTrack {
  BIOLOGICAL = 'Biological Sciences',
  ENGINEERING = 'Engineering & Applied Sciences'
}

export enum Subject {
  ENG = 'Use of English',
  CHM = 'Chemistry',
  PHY = 'Physics',
  BIO = 'Biology',
  MTH = 'Mathematics'
}

export interface Question {
  id: number;
  subject: Subject;
  text: string;
  options: {
    label: string;
    text: string;
  }[];
  correctAnswer: string; // The label (a, b, c, d, or e)
}

export interface StudentResult {
  id: string;
  name: string;
  course: string;
  track: CourseTrack;
  accessCode: string;
  score: number;
  totalPossible: number;
  timestamp: number;
  answers: Record<number, string>;
}

export type AppStep = 'welcome' | 'exam' | 'result' | 'admin-login' | 'admin-panel';
