export type LearningStatus = "completed" | "in-progress" | "upcoming" | "locked";

export interface LearningNode {
  id: string;
  title: string;
  description: string;
  status: LearningStatus;
  progress?: number;
  icon: "check" | "book" | "clock" | "lock";
  position: "center" | "left" | "right";
}

export interface PeerComparison {
  studentId: string;
  studentName: string;
  avatar: string;
  progress: number;
  rank: number;
  weeklyChange: number;
}

export interface CriticalNode {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "info";
}

export interface BatchPulse {
  activity: number;
  change: string;
  period: string;
  weeklyData: number[];
}

export interface StudentActivity {
  id: string;
  type: "completed" | "downloaded" | "submitted";
  title: string;
  time: string;
}

export interface StudentStats {
  name: string;
  title: string;
  weeklyPerformance: number[];
  weeklyLabels: string[];
  recentActivity: StudentActivity[];
  xp: number;
  level: number;
  badges: string[];
}

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type AssignmentState = "NOT_STARTED" | "SUBMITTED" | "GRADED";

export interface AssignmentItem {
  id: string;
  title: string;
  instructions: string | null;
  topicTitle: string | null;
  dueAt: string | null;
  status: AssignmentState;
  note: string | null;
  submittedCount?: number;
  studentCount?: number;
}
