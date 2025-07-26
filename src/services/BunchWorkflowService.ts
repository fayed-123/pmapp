import { supabase } from "@/lib/supabase";
import { Project, ProjectItem, User } from "@/lib/types";
import { notifyUser } from "@/services/NotificationService";
import { getUserById, loadItems } from "@/lib/db";

export interface BunchSummary {
    project_id: string;
    bunch_type: string; // 'electrical', 'mechanical', 'architect', etc.
    total_items: number;
    approved_items: number;
    rejected_items: number;
    pending_items: number;
    current_stage: string;
    assigned_to_user_id: string | null;
    assigned_to_role: string | null;
    can_send_to_next_stage: boolean;
    can_request_modification: boolean;
    items: ProjectItem[];
}

export interface WorkflowHistoryEntry {
    user_id: string;
    role: string;
    status: string;
    timestamp: string;
}

/**
 * Get bunch summaries for a project, grouped by subcontractor type
 */
export const getBunchSummaries = async (projectId: string, currentUser: User): Promise<BunchSummary[]> => {
    try {

        // Use the centralized loadItems function
        const items = await loadItems(currentUser, projectId);

        if (!items || items.length === 0) {
            return [];
        }

        // Group items by subcontractor type
        const bunchesByType = items.reduce((acc, item) => {
            const type = item.subcontractortype || 'general';
            if (!acc[type]) {
                acc[type] = [];
            }
            acc[type].push(item);
            return acc;
        }, {} as Record<string, ProjectItem[]>);


        // Create bunch summaries
        const summaries: BunchSummary[] = [];

        for (const [bunchType, bunchItems] of Object.entries(bunchesByType)) {
            // Count item statuses
            const approved = bunchItems.filter(item =>
                item.status?.includes('approved') || item.status === 'published'
            ).length;

            const rejected = bunchItems.filter(item =>
                item.status === 'modification_requested'
            ).length;

            const pending = bunchItems.filter(item =>
                item.status?.includes('pending') ||
                item.status === 'draft' ||
                !item.status
            ).length;

            // Determine current stage and permissions
            const firstItem = bunchItems[0];
            const currentStage = getCurrentStage(firstItem?.status || 'draft');

            // Check permissions for current user
            const canSend = canSendBunchToNextStage(bunchItems, currentUser);
            const canReturn = canRequestModification(bunchItems, currentUser);

            summaries.push({
                project_id: projectId,
                bunch_type: bunchType,
                total_items: bunchItems.length,
                approved_items: approved,
                rejected_items: rejected,
                pending_items: pending,
                current_stage: currentStage,
                assigned_to_user_id: firstItem?.assigned_to_user_id || null,
                assigned_to_role: firstItem?.assigned_to_role || null,
                can_send_to_next_stage: canSend,
                can_request_modification: canReturn,
                items: bunchItems // Items are already in the correct format from loadItems
            });
        }

        return summaries;

    } catch (error) {
        console.error('❌ Error getting bunch summaries:', error);
        return [];
    }
};

/**
 * Send a bunch of items to the next stage
 */
export const sendBunchToNextStage = async (
    bunchType: string,
    projectId: string,
    project: Project,
    currentUser: User
): Promise<{ success: boolean; message: string }> => {
    try {

        // Use loadItems to get all items for the project
        const allItems = await loadItems(currentUser, projectId);

        // Filter to get only items of the specific bunch type
        const items = allItems.filter(item => item.subcontractortype === bunchType);

        if (!items || items.length === 0) {
            return { success: false, message: 'لا توجد بنود للإرسال' };
        }

        // Determine next stage based on current user role
        const nextStageInfo = getNextStageInfo(currentUser, project, bunchType);

        if (!nextStageInfo.nextStatus) {
            return { success: false, message: 'لا يمكن تحديد المرحلة التالية' };
        }


        // Update all items in the bunch
        for (const item of items) {
            await moveItemToNextStage(
                item,
                nextStageInfo.nextUserId,
                nextStageInfo.nextRole,
                nextStageInfo.nextStatus
            );
        }

        // Send notification to next stage user
        if (nextStageInfo.nextUserId) {
            const nextUser = await getUserById(nextStageInfo.nextUserId);
            if (nextUser) {
                await notifyUser({
                    currentUser: {
                        id: currentUser.id,
                        name: currentUser.name,
                        role: currentUser.role
                    },
                    to_user_id: nextStageInfo.nextUserId,
                    title: `بنود جديدة للمراجعة - ${getBunchTypeDisplayName(bunchType)}`,
                    message: `تم إرسال ${items.length} بند من نوع ${getBunchTypeDisplayName(bunchType)} من مشروع "${project.name}" للمراجعة`,
                    type: 'project_update',
                    data: {
                        project_id: projectId,
                        project_name: project.name,
                        bunch_type: bunchType,
                        item_count: items.length,
                        action: 'bunch_sent_for_review'
                    }
                });
            }
        }

        return {
            success: true,
            message: `تم إرسال ${items.length} بند من نوع ${getBunchTypeDisplayName(bunchType)} بنجاح`
        };

    } catch (error) {
        console.error('❌ Error sending bunch to next stage:', error);
        return { success: false, message: 'حدث خطأ أثناء إرسال البنود' };
    }
};

/**
 * Return a bunch to the previous stage for modification
 */
export const returnBunchToPreviousStage = async (
    bunchType: string,
    projectId: string,
    project: Project,
    currentUser: User,
    comment: string
): Promise<{ success: boolean; message: string }> => {
    try {

        // Use loadItems to get all items for the project
        const allItems = await loadItems(currentUser, projectId);

        // Filter to get only items of the specific bunch type
        const items = allItems.filter(item => item.subcontractortype === bunchType);

        if (!items || items.length === 0) {
            return { success: false, message: 'لا توجد بنود للإرجاع' };
        }

        // Return all items to previous stage
        const returnedUsers = new Set<string>();

        for (const item of items) {
            const returnInfo = await returnItemToPreviousStage(item, comment);
            if (returnInfo.returnedToUserId) {
                returnedUsers.add(returnInfo.returnedToUserId);
            }
        }

        // Send notifications to returned users
        for (const userId of returnedUsers) {
            const user = await getUserById(userId);
            if (user) {
                console.log("🔔 About to call notifyUser for:", user.name);
                await notifyUser({
                    currentUser: {
                        id: currentUser.id,
                        name: currentUser.name,
                        role: currentUser.role
                    },
                    to_user_id: userId,
                    title: `طلب تعديل بنود - ${getBunchTypeDisplayName(bunchType)}`,
                    message: `تم طلب تعديل ${items.length} بند من نوع ${getBunchTypeDisplayName(bunchType)} في مشروع "${project.name}". السبب: ${comment}`,
                    type: 'project_update',
                    data: {
                        project_id: projectId,
                        project_name: project.name,
                        bunch_type: bunchType,
                        item_count: items.length,
                        action: 'bunch_returned_for_modification',
                        comment: comment
                    }
                });
                console.log("✅ notifyUser call completed");
            }
        }

        return {
            success: true,
            message: `تم إرجاع ${items.length} بند من نوع ${getBunchTypeDisplayName(bunchType)} للتعديل`
        };

    } catch (error) {
        console.error('❌ Error returning bunch to previous stage:', error);
        return { success: false, message: 'حدث خطأ أثناء إرجاع البنود' };
    }
};

/**
 * Move individual item to next stage (push to workflow history)
 */
const moveItemToNextStage = async (
    item: any,
    nextUserId: string | null,
    nextRole: string,
    nextStatus: string
) => {
    // Push current assignment to history stack
    const currentAssignment: WorkflowHistoryEntry = {
        user_id: item.assigned_to_user_id || '',
        role: item.assigned_to_role || '',
        status: item.status || '',
        timestamp: new Date().toISOString()
    };

    const updatedHistory = [...(item.workflow_history || []), currentAssignment];

    await supabase
        .from('project_items')
        .update({
            status: nextStatus,
            assigned_to_user_id: nextUserId,
            assigned_to_role: nextRole,
            workflow_history: updatedHistory,
            updated_at: new Date().toISOString()
        })
        .eq('id', item.id);
};

/**
 * Return individual item to previous stage (pop from workflow history)
 */
const returnItemToPreviousStage = async (item: any, comment: string) => {
    const history = item.workflow_history || [];

    if (history.length === 0) {
        // No history, return to original creator
        const returnedToUserId = item.submitted_by || item.subcontractorId;

        await supabase
            .from('project_items')
            .update({
                status: 'modification_requested',
                assigned_to_user_id: returnedToUserId,
                assigned_to_role: 'subcontractor',
                comments: comment,
                updated_at: new Date().toISOString()
            })
            .eq('id', item.id);

        return { returnedToUserId };
    }

    // Pop the last assignment from history
    const previousAssignment = history[history.length - 1];
    const remainingHistory = history.slice(0, -1);

    await supabase
        .from('project_items')
        .update({
            status: 'modification_requested',
            assigned_to_user_id: previousAssignment.user_id,
            assigned_to_role: previousAssignment.role,
            workflow_history: remainingHistory,
            comments: comment,
            updated_at: new Date().toISOString()
        })
        .eq('id', item.id);

    return { returnedToUserId: previousAssignment.user_id };
};

/**
 * Get next stage information based on current user and bunch type
 */
const getNextStageInfo = (currentUser: User, project: Project, bunchType: string) => {
    switch (currentUser.role) {
        case 'subcontractor':
            // Send to main contractor
            return {
                nextStatus: 'pending_contractor_review',
                nextUserId: project.contractor_id,
                nextRole: 'contractor'
            };

        case 'contractor':
            // Send to appropriate subconsultant based on bunch type
            const consultantIdMap = {
                'electrical': project.electricalconsultantid,
                'mechanical': project.mechanicalconsultantid,
                'architect': project.architectconsultantid
            };
            return {
                nextStatus: 'pending_subconsultant_review',
                nextUserId: consultantIdMap[bunchType] || null,
                nextRole: 'subconsultant'
            };

        case 'subconsultant':
            // Send to main consultant
            return {
                nextStatus: 'pending_consultant_review',
                nextUserId: project.consultant_id,
                nextRole: 'consultant'
            };

        case 'consultant':
            // Final approval - publish
            return {
                nextStatus: 'published',
                nextUserId: null,
                nextRole: 'published'
            };

        default:
            return { nextStatus: null, nextUserId: null, nextRole: null };
    }
};

/**
 * Check if user can send this bunch to next stage
 */
const canSendBunchToNextStage = (items: any[], currentUser: User): boolean => {
    if (!items || items.length === 0) return false;

    // Check if all items are assigned to current user or their role
    const allAssignedToUser = items.every(item =>
        item.assigned_to_user_id === currentUser.id ||
        item.assigned_to_role === currentUser.role
    );

    if (!allAssignedToUser) return false;

    // Role-specific logic for what items can be sent
    switch (currentUser.role) {
        case 'subcontractor':
            return items.every(item =>
                item.status === 'draft' ||
                item.status === 'modification_requested'
            );

        case 'contractor':
            return items.every(item =>
                item.status === 'pending_contractor_review' ||
                item.status === 'modification_requested'
            );

        case 'subconsultant':
            return items.every(item =>
                item.status === 'pending_subconsultant_review' ||
                item.status === 'modification_requested'
            );

        case 'consultant':
            return items.every(item =>
                item.status === 'pending_consultant_review' ||
                item.status === 'modification_requested'
            );

        default:
            return false;
    }
};
/**
 * Check if user can request modification for this bunch
 */
const canRequestModification = (items: any[], currentUser: User): boolean => {
    if (!items || items.length === 0) return false;

    // Subcontractors with draft items cannot request modification (no previous stage)
    if (currentUser.role === 'subcontractor') {
        const hasDraftItems = items.some(item => item.status === 'draft');
        if (hasDraftItems) return false;
    }

    // Check if user can review these items based on role and status
    const canReview = items.some(item => {
        const isAssignedToUser = item.assigned_to_user_id === currentUser.id ||
            item.assigned_to_role === currentUser.role;

        if (!isAssignedToUser) return false;

        // Allow modification for all these statuses
        const status = item.status;
        const canModify = status &&
            (status.includes('pending') ||
                status === 'contractor_approved' ||
                status === 'subconsultant_approved' ||
                status === 'consultant_approved' ||
                status === 'modification_requested'); // ✅ Add this line

        return canModify;
    });

    return canReview;
};

/**
 * Get current workflow stage from status
 */
const getCurrentStage = (status: string): string => {
    if (!status || status === 'draft') return 'مسودة';
    if (status.includes('pending_contractor')) return 'مع المقاول';
    if (status.includes('pending_subconsultant')) return 'مع الاستشاري الفرعي';
    if (status.includes('pending_consultant')) return 'مع الاستشاري المشرف';
    if (status === 'published') return 'منشور';
    if (status === 'modification_requested') return 'مطلوب تعديل';
    return 'غير محدد';
};

/**
 * Get display name for bunch type
 */
const getBunchTypeDisplayName = (bunchType: string): string => {
    const displayNames = {
        'electrical': 'أعمال كهربائية',
        'mechanical': 'أعمال ميكانيكية',
        'architect': 'أعمال معمارية',
        'general': 'أعمال عامة'
    };

    return displayNames[bunchType] || bunchType;
};