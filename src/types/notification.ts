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
  is_read: boolean;
  data?: any; // معلومات إضافية
  created_at: string;
  updated_at: string;
}