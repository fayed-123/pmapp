export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role:
    | "consultant"
    | "owner"
    | "contractor"
    | "mainConsultant"
    | "generalConsultant"
    | "subcontractor"
    | "subConsultant"
    | "subconsultant";
  password: string;
  approved: boolean;
  isMainConsultant?: boolean;
  parentId?: string;
  parent_id?: string;
  subcontractorType?: "architect" | "mechanical" | "electrical";
  type?: string;
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
  status: "pending" | "published" | "active" | "closed";
  completion: number;
  timeElapsed: number;
  performance: number;
  created: string;
  expectedDays: number;
  description: string;
  contractValue: number;
  advancePaymentPercentage: number;
  workGuaranteePercentage: number;
  materialDeliveryPaymentPercentage: number;
  completedWorkPaymentPercentage: number;
  generalConsultantId?: string;
  mainConsultantId?: string;
  ownerName?: string;
  consultantName?: string;
  contractorName?: string;
  generalConsultantName?: string;
  mainConsultantName?: string;
  subcontractorId?: string | null;
  subconsultant_id?: string | null;
  showToRole?: string;
  electricalConsultantId?: string | null;
  architectConsultantId?: string | null;
  mechanicalConsultantId?: string | null;
  electricalContractorId?: string;
  architectContractorId?: string;
  mechanicalContractorId?: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  itemNumber: string;
  name: string;
  progress: number;
  weight: number;
  startDate: string; // تاريخ بدء البند
  endDate: string; // تاريخ انتهاء البند
  executionTime: number;
  weightedProgress: number;
  riskLevel?: "low" | "medium" | "high"; // مستوى الخطر للبند
  value?: number;
  supplyProgress?: number; // نسبة إنجاز التوريد
  subcontractorType?: "architect" | "mechanical" | "electrical";
  subcontractorId?: string | null;
  contractorid?: string | null;
  status?: "pending" | "contractor_approved" | "subconsultant_approved" | "consultant_approved" | "published" | "modification_requested";
  comments?: string;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;  
}

export interface Contact {
  id: string;
  projectId: string;
  name: string;
  phone: string;
  role: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  type: string;
  contractor_id: string;
  created_at?: string; // لو موجودة
}
