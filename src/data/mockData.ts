export interface LearningNode {
  id: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  progress?: number; // 0-100
  icon: string;
  position: "center" | "left" | "right";
}

export const learningNodes: LearningNode[] = [
  {
    id: "1",
    title: "Introduction",
    description: "Core concepts of Synapse Interface",
    status: "completed",
    progress: 100,
    icon: "check_circle",
    position: "center",
  },
  {
    id: "2",
    title: "Data Structures",
    description: "Trees, Heaps, and Neural Maps",
    status: "in-progress",
    progress: 65,
    icon: "data_object",
    position: "left",
  },
  {
    id: "3",
    title: "Graph Theory",
    description: "Complex Neural Linkages",
    status: "locked",
    progress: 0,
    icon: "lock",
    position: "right",
  },
];

export interface CriticalNode {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "info";
}

export const criticalNodes: CriticalNode[] = [
  {
    id: "1",
    title: "Recursive Loops",
    description: "4 Students struggling with module 2.4",
    severity: "warning",
  },
  {
    id: "2",
    title: "New Module Available",
    description: "Quantum Logic draft ready for review",
    severity: "info",
  },
];

export const batchPulse = {
  activity: 84,
  change: "+12%",
  period: "vs last week",
  weeklyData: [40, 60, 30, 80, 100, 50, 40],
};
