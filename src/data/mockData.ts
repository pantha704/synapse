export interface PeerComparison {
  studentId: string;
  studentName: string;
  avatar: string;
  progress: number;
  rank: number;
  weeklyChange: number; // + or - rank change
}

export const peerComparisonData: PeerComparison[] = [
  { studentId: "1", studentName: "Alex Rivers", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", progress: 85, rank: 1, weeklyChange: 0 },
  { studentId: "2", studentName: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", progress: 78, rank: 2, weeklyChange: 1 },
  { studentId: "3", studentName: "Marcus Johnson", avatar: "https://api.dicebear.com/7.js/avataaars/svg?seed=Marcus", progress: 72, rank: 3, weeklyChange: -1 },
  { studentId: "4", studentName: "Priya Patel", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya", progress: 68, rank: 4, weeklyChange: 2 },
  { studentId: "5", studentName: "James Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James", progress: 61, rank: 5, weeklyChange: 0 },
];

export interface LearningNode {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  progress?: number;
  icon: string;
  position: "center" | "left" | "right";
}

export const learningNodes: LearningNode[] = [
  {
    id: "1",
    title: "Introduction",
    description: "Fundamentals • Completed",
    status: "completed",
    progress: 100,
    icon: "check",
    position: "center",
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Module 2 • 65% Progress",
    status: "in-progress",
    progress: 65,
    icon: "book",
    position: "left",
  },
  {
    id: "3",
    title: "Graph Theory",
    description: "Advanced • Locked",
    status: "locked",
    progress: 0,
    icon: "lock",
    position: "right",
  },
];

export const studentStats = {
  name: "Alex Rivers",
  title: "Bachelor of Science, Year 2",
  weeklyPerformance: [40, 65, 85, 55, 70],
  weeklyLabels: ["MON", "TUE", "WED", "THU", "FRI"],
  recentActivity: [
    { id: "1", type: "completed", title: 'Completed "Binary Search Trees" quiz', time: "2 hours ago" },
    { id: "2", type: "downloaded", title: 'Downloaded "Graph Theory" notes', time: "Yesterday" },
    { id: "3", type: "submitted", title: 'Submitted Assignment: "Memory Management"', time: "Oct 24, 2023" },
  ],
};

export const batchPulse = {
  activity: 84,
  change: "+12%",
  period: "vs last week",
  weeklyData: [40, 60, 30, 80, 100, 50, 40],
};

export interface CriticalNode {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "info";
}

export const criticalNodes: CriticalNode[] = [
  { id: "1", title: "Recursive Loops", description: "4 Students struggling with module 2.4", severity: "warning" },
  { id: "2", title: "New Module Available", description: "Quantum Logic draft ready for review", severity: "info" },
];
