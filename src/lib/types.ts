

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "consultant" | "owner" | "contractor" | "mainConsultant";
  password: string;
  approved: boolean;
  isMainConsultant?: boolean;
}

export interface Project {
  id?: string;
  name: string;
  desc?: string;
  start: string;
  end: string;
  ownerId: string;
  consultantId: string;
  contractorId: string;
  status: "active" | "pending" | "closed";
  completion: number;
  timeElapsed: number;
  performance: number;
  created: string;
  expectedDays: number;
  description: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  itemNumber: string;
  name: string;
  progress: number;
  weight: number;
  startDate: string; // تاريخ بدء البند
  endDate: string;   // تاريخ انتهاء البند
  executionTime: number;
  weightedProgress: number;
  riskLevel?: "low" | "medium" | "high"; // مستوى الخطر للبند
}

export interface Contact {
  id: string;
  projectId: string;
  name: string;
  phone: string;
  role: string;
}

