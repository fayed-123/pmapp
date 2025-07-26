// /types/notification.ts
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'project_update' | 'system' | 'reminder';
  from_user_id?: string;
  from_user_name?: string;
  from_user_role?: string;
  to_user_id: string;
  project_id?: string;
  project_name?: string;
  task_id?: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationTriggerData {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  project: {
    id: string;
    name: string;
  };
  targetUser?: {
    id: string;
    name: string;
    role: string;
  };
  additionalData?: any;
}