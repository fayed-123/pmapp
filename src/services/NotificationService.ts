import { getCurrentUser } from "@/lib/db";
import { supabase } from "@/lib/supabase";


export interface CreateNotificationParams {
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
}


interface NotifyUserParams {
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
  to_user_id: string;
  to_user_name?: string;
  title: string;
  message: string;
  type: 'system' | 'task_assigned' | 'project_update' | 'reminder';
  data?: any;
}

export const notifyUser = async (params: NotifyUserParams) => {
  try {
    const { currentUser, ...rest } = params;

    const { error } = await supabase.from("notifications").insert([
      {
        title: rest.title,
        message: rest.message,
        type: rest.type,
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        from_user_role: currentUser.role,
        to_user_id: rest.to_user_id,
        to_user_name: rest.to_user_name || "",
        data: rest.data || null,
      },
    ]);

    if (error) {
      console.error('Error sending notification:', error.message);
    }
  } catch (err) {
    console.error('Failed to notify user:', err);
  }
};


export const getNotifications = async (userId: string) => {
  try {
     if (!userId || userId.trim() === "") {
      console.error("getNotifications called with empty or invalid userId");
      return []; // أو throw new Error("Invalid userId")
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, updated_at: new Date().toISOString() })
      .eq('to_user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
};