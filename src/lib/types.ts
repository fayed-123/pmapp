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
  id: string;
  name: string;
  description?: string;
  
  // Dates - use consistent naming
  start_date?: string;
  end_date?: string;
  
  // Progress fields
  completion: number;
  time_elapsed: number;
  expected_days: number;
  performance: number;
  
  // Status and metadata
  status: "pending" | "published" | "active" | "closed";
  created_by?: string;
  created_at?: string;
  
  // Main team assignments - use database field names
  owner_id?: string;
  consultant_id?: string;
  contractor_id?: string;
  
  // Financial fields
  contract_value: number;
  advance_payment_percentage: number;
  work_guarantee_percentage: number;
  material_delivery_payment_percentage: number;
  completed_work_payment_percentage: number;
  
  // Keep camelCase for backward compatibility
  contractValue?: number;
  advancePaymentPercentage?: number;
  workGuaranteePercentage?: number;
  materialDeliveryPaymentPercentage?: number;
  completedWorkPaymentPercentage?: number;
  
  // Other consultant/contractor IDs
  general_consultant_id?: string;
  main_consultant_id?: string;
  generalConsultantId?: string;
  mainConsultantId?: string;
  
  // Legacy fields
  contractorid?: string;
  subcontractor_id?: string;
  subconsultant_id?: string;
  subcontractorId?: string;
  show_to_role?: string;
  
  // Subconsultant assignments (these match your database)
  electricalconsultantid?: string;
  architectconsultantid?: string;
  mechanicalconsultantid?: string;
  architect_consultant_id?: string;
  
  // Subcontractor assignments (these match your database)
  electricalcontractorid?: string;
  architectcontractorid?: string;
  mechanicalcontractorid?: string;
  
  // Computed fields
  timeElapsed?: number;
  expectedDays?: number;
  ownerName?: string;
  consultantName?: string;
  contractorName?: string;
  generalConsultantName?: string;
  mainConsultantName?: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  itemNumber?: string;
  name: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  executionTime?: number;
  weight?: number;
  weightedProgress?: number;
  riskLevel?: string;
  status?: string;
  comments?: string;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  subcontractortype?: string;    
  subcontractorid?: string;      
  contractorid?: string;
  value?: number;
  supplyprogress?: number;       
  assigned_to_user_id?: string;
  assigned_to_role?: string;
  workflow_history?: WorkflowHistoryEntry[];
}

export interface WorkflowHistoryEntry {
  user_id: string;
  role: string;
  status: string;
  timestamp: string;
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
