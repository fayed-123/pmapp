// /services/WorkflowNotifications.ts
import { supabase } from "@/lib/supabase";
import { NotificationTriggerData } from "@/types/notification";
import { getUserById, getUserNameById } from "@/lib/db";
import { Project, User } from "@/lib/types";

/**
 * Workflow Notification Triggers
 * These functions are called when specific workflow events occur
 */

/**
 * 1. USER ASSIGNED TO PROJECT
 * Notify user when they're assigned to a project
 */
export const notifyUserAssignedToProject = async (
  assignedUserId: string,
  project: Project,
  currentUser: User,
  assignmentType: string // "owner", "consultant", "contractor", "subconsultant", etc.
) => {
  try {
    const assignedUser = await getUserById(assignedUserId);
    if (!assignedUser) return;

    const roleNames = {
      'owner': 'مالك المشروع',
      'consultant': 'الاستشاري المشرف',
      'contractor': 'المقاول الرئيسي',
      'subconsultant': 'استشاري فرعي',
      'subcontractor': 'مقاول فرعي',
      'electricalconsultant': 'استشاري كهرباء',
      'architectconsultant': 'استشاري معماري',
      'mechanicalconsultant': 'استشاري ميكانيكا',
      'electricalcontractor': 'مقاول كهرباء',
      'architectcontractor': 'مقاول معماري',
      'mechanicalcontractor': 'مقاول ميكانيكا'
    };

    const { error } = await supabase.from("notifications").insert([
      {
        title: "تم تعيينك في مشروع جديد",
        message: `تم تعيينك كـ ${roleNames[assignmentType] || assignmentType} في مشروع "${project.name}"`,
        type: 'task_assigned',
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        from_user_role: currentUser.role,
        to_user_id: assignedUserId,
        project_id: project.id,
        project_name: project.name,
        data: {
          assignment_type: assignmentType,
          project_status: project.status
        }
      }
    ]);

    if (error) {
      console.error('Error sending project assignment notification:', error);
    }
  } catch (error) {
    console.error('Failed to notify user assignment:', error);
  }
};

/**
 * 2. ACTION REQUIRED - Items need review
 * Notify user when items reach their approval stage
 */
export const notifyActionRequired = async (
  targetUserId: string,
  project: Project,
  currentUser: User,
  itemsCount: number,
  actionType: 'approve' | 'review'
) => {
  try {
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) return;

    const actionMessages = {
      'approve': `يوجد ${itemsCount} بند في انتظار موافقتك`,
      'review': `يوجد ${itemsCount} بند في انتظار مراجعتك`
    };

    const { error } = await supabase.from("notifications").insert([
      {
        title: "مطلوب إجراء - مراجعة البنود",
        message: `${actionMessages[actionType]} في مشروع "${project.name}"`,
        type: 'reminder',
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        from_user_role: currentUser.role,
        to_user_id: targetUserId,
        project_id: project.id,
        project_name: project.name,
        data: {
          items_count: itemsCount,
          action_type: actionType,
          requires_immediate_attention: true
        }
      }
    ]);

    if (error) {
      console.error('Error sending action required notification:', error);
    }
  } catch (error) {
    console.error('Failed to notify action required:', error);
  }
};

/**
 * 3. MODIFICATION REQUESTED
 * Notify previous stage when modifications are requested
 */
export const notifyModificationRequested = async (
  targetUserId: string,
  project: Project,
  currentUser: User,
  comments: string,
  itemsCount: number
) => {
  try {
    const targetUser = await getUserById(targetUserId);
    if (!targetUser) return;

    const { error } = await supabase.from("notifications").insert([
      {
        title: "مطلوب تعديل البنود",
        message: `تم طلب تعديل ${itemsCount} بند في مشروع "${project.name}". التعليق: ${comments}`,
        type: 'project_update',
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        from_user_role: currentUser.role,
        to_user_id: targetUserId,
        project_id: project.id,
        project_name: project.name,
        data: {
          modification_comments: comments,
          items_count: itemsCount,
          requires_modification: true,
          requested_by_role: currentUser.role
        }
      }
    ]);

    if (error) {
      console.error('Error sending modification request notification:', error);
    }
  } catch (error) {
    console.error('Failed to notify modification request:', error);
  }
};

/**
 * 4. PROJECT PUBLISHED
 * Notify all team members when project is published
 */
export const notifyProjectPublished = async (
  project: Project,
  currentUser: User
) => {
  try {
    // Get all team members assigned to the project
    const teamMembers = [
      project.owner_id,
      project.consultant_id,
      project.contractor_id,
      project.electricalconsultantid,
      project.architectconsultantid,
      project.mechanicalconsultantid,
      project.electricalcontractorid,
      project.architectcontractorid,
      project.mechanicalcontractorid
    ].filter(Boolean); // Remove null/undefined values

    // Remove duplicates and current user
    const uniqueTeamMembers = [...new Set(teamMembers)].filter(id => id !== currentUser.id);

    // Create notifications for all team members
    const notifications = await Promise.all(
      uniqueTeamMembers.map(async (memberId) => {
        const member = await getUserById(memberId!);
        if (!member) return null;

        return {
          title: "تم نشر المشروع",
          message: `تم نشر مشروع "${project.name}" وأصبح جاهزاً للعمل`,
          type: 'project_update' as const,
          from_user_id: currentUser.id,
          from_user_name: currentUser.name,
          from_user_role: currentUser.role,
          to_user_id: memberId!,
          project_id: project.id,
          project_name: project.name,
          data: {
            project_published: true,
            published_by: currentUser.name,
            published_at: new Date().toISOString()
          }
        };
      })
    );

    // Filter out null values and insert notifications
    const validNotifications = notifications.filter(Boolean);
    
    if (validNotifications.length > 0) {
      const { error } = await supabase.from("notifications").insert(validNotifications);
      
      if (error) {
        console.error('Error sending project published notifications:', error);
      }
    }
  } catch (error) {
    console.error('Failed to notify project published:', error);
  }
};

/**
 * 5. WORKFLOW PROGRESSION
 * Notify next user in workflow when items are approved
 */
export const notifyWorkflowProgression = async (
  project: Project,
  currentUser: User,
  nextStageUser: User,
  itemsCount: number,
  currentStage: string,
  nextStage: string
) => {
  try {
    const stageNames = {
      'pending': 'قيد الانتظار',
      'contractor_approved': 'موافقة المقاول',
      'subconsultant_approved': 'موافقة الاستشاري الفرعي',
      'consultant_approved': 'موافقة الاستشاري',
      'published': 'منشور'
    };

    const { error } = await supabase.from("notifications").insert([
      {
        title: "تقدم في سير العمل",
        message: `تم الانتهاء من مرحلة "${stageNames[currentStage]}" وأصبح ${itemsCount} بند في انتظار "${stageNames[nextStage]}" في مشروع "${project.name}"`,
        type: 'project_update',
        from_user_id: currentUser.id,
        from_user_name: currentUser.name,
        from_user_role: currentUser.role,
        to_user_id: nextStageUser.id,
        project_id: project.id,
        project_name: project.name,
        data: {
          workflow_progression: true,
          from_stage: currentStage,
          to_stage: nextStage,
          items_count: itemsCount
        }
      }
    ]);

    if (error) {
      console.error('Error sending workflow progression notification:', error);
    }
  } catch (error) {
    console.error('Failed to notify workflow progression:', error);
  }
};

/**
 * Helper function to determine next stage users based on workflow
 */
export const getNextStageUsers = async (
  project: Project,
  currentStage: string,
  itemType?: string
): Promise<User[]> => {
  const users: User[] = [];

  switch (currentStage) {
    case 'pending':
      // Next: Main contractor
      if (project.contractor_id) {
        const contractor = await getUserById(project.contractor_id);
        if (contractor) users.push(contractor);
      }
      break;

    case 'contractor_approved':
      // Next: Subconsultants based on item type
      const subconsultantFields = {
        'electrical': project.electricalconsultantid,
        'architect': project.architectconsultantid,
        'mechanical': project.mechanicalconsultantid
      };

      if (itemType && subconsultantFields[itemType]) {
        const subconsultant = await getUserById(subconsultantFields[itemType]!);
        if (subconsultant) users.push(subconsultant);
      }
      break;

    case 'subconsultant_approved':
      // Next: Main consultant
      if (project.consultant_id) {
        const consultant = await getUserById(project.consultant_id);
        if (consultant) users.push(consultant);
      }
      break;

    case 'consultant_approved':
      // Next: Main consultant (for final approval)
      // This would typically be the same as consultant, or a different main consultant
      if (project.consultant_id) {
        const mainConsultant = await getUserById(project.consultant_id);
        if (mainConsultant) users.push(mainConsultant);
      }
      break;
  }

  return users;
};