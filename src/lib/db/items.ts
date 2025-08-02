import { supabase } from "@/lib/supabase";
import { Project, ProjectItem, User } from "../types";
import { getItemTypeForUser, hasFullAccess, hasFilteredAccess } from "@/lib/utils/typeMapping";

// Add a flag to prevent infinite loops
let isLoadingItems = false;

/**
 * Load items with role-based filtering at database level
 */
export async function loadItems(currentUser?: User, projectId?: string): Promise<ProjectItem[]> {
  // Prevent recursive calls
  
  try {
    isLoadingItems = true;
    
    let query = supabase
      .from('project_items')
      .select('*')
      .order('created_at', { ascending: false });

    // If projectId is specified, filter by project
    if (projectId) {
      console.log("🎯 Filtering by project:", projectId);
      query = query.eq('project_id', projectId);
    }

    // Apply role-based filtering at database level
    if (currentUser) {
      console.log("👤 Applying role-based filtering for:", currentUser.role);

      switch (currentUser.role) {
        case 'subcontractor':
          // Subcontractors see: items assigned to them personally OR items they created OR published items they worked on
          query = query.or(`assigned_to_user_id.eq.${currentUser.id},subcontractorid.eq.${currentUser.id},and(status.eq.published,subcontractorid.eq.${currentUser.id})`);
          break;
      
        case 'contractor':
          // Contractors see: items assigned to them personally OR items pending their review OR published items from their project
          query = query.or(`assigned_to_user_id.eq.${currentUser.id},and(assigned_to_role.eq.contractor,status.eq.pending_contractor_review),status.eq.published`);
          break;
      
        case 'subconsultant':
          // Subconsultants see: items assigned to them personally OR items pending their review (of their type) OR published items of their type
          const itemType = getItemTypeForUser(currentUser.type || '');
          if (itemType) {
            query = query.or(`assigned_to_user_id.eq.${currentUser.id},and(assigned_to_role.eq.subconsultant,status.eq.pending_subconsultant_review,subcontractortype.eq.${itemType}),and(status.eq.published,subcontractortype.eq.${itemType})`);
          } else {
            query = query.or(`assigned_to_user_id.eq.${currentUser.id},status.eq.published`);
          }
          break;
      
        case 'consultant':
          // Consultants see: items assigned to them personally OR items pending their review OR all published items
          query = query.or(`assigned_to_user_id.eq.${currentUser.id},and(assigned_to_role.eq.consultant,status.eq.pending_consultant_review),status.eq.published`);
          break;
      
        case 'mainConsultant':
        case 'owner':
          // Main consultants and owners see all items (no filtering)
          break;
      
        default:
          // Default: show items assigned to user personally OR published items
          query = query.or(`assigned_to_user_id.eq.${currentUser.id},status.eq.published`);
      }
    }
    console.log("📞 Executing database query...");
    const { data: items, error } = await query;
    console.log("📊 Database result:", { 
      itemsCount: items?.length || 0, 
      error: error?.message,
      firstItem: items?.[0]
    });

    if (error) throw error;

    if (!items || items.length === 0) {
      console.log("⚠️ No items found");
      isLoadingItems = false;
      return [];
    }

    const convertedItems = items.map(item => convertDatabaseItemToAppItem(item));

    // Group items by project for weight calculation
    const itemsByProject: { [key: string]: ProjectItem[] } = {};
    convertedItems.forEach(item => {
      if (!itemsByProject[item.projectId]) {
        itemsByProject[item.projectId] = [];
      }
      itemsByProject[item.projectId].push(item);
    });

    // Process each project's items
    const processedItems: ProjectItem[] = [];

    for (const projectId in itemsByProject) {
      const projectItems = itemsByProject[projectId];
      const processedProjectItems = calculateItemWeights(projectItems);
      processedItems.push(...processedProjectItems);
    }

    isLoadingItems = false;
    return processedItems;
  } catch (error) {
    console.error("Error loading items:", error);
    isLoadingItems = false;
    return [];
  }
}

/**
 * Load items for a specific project with role-based filtering
 * This is the main function that should be used in components
 */
export async function loadProjectItems(projectId: string, currentUser?: User): Promise<ProjectItem[]> {
  try {
    console.log("🔍 loadProjectItems called with:", {
      projectId,
      userRole: currentUser?.role,
      userType: currentUser?.type
    });

    // Use the centralized loadItems function with projectId
    const items = await loadItems(currentUser, projectId);
    
    console.log("✅ Items loaded via loadItems:", {
      itemsCount: items.length,
      sampleItem: items[0] // Log first item to see available fields
    });

    return items;
  } catch (error) {
    console.error("❌ Exception in loadProjectItems:", error);
    return [];
  }
}



/**
 * Convert database item format to application item format
 */
const convertDatabaseItemToAppItem = (item: any): ProjectItem => {
  return {
    id: item.id,
    projectId: item.project_id,
    name: item.name,
    progress: item.progress || 0,
    weight: item.weight || 0,
    
    // Handle potentially missing fields
    itemNumber: item.item_number || '',
    startDate: item.start_date || '',
    endDate: item.end_date || '',
    executionTime: item.execution_time || 0,
    weightedProgress: item.weighted_progress || 0,
    riskLevel: item.risk_level || 'low',
    
    // Use lowercase database field names
    subcontractortype: item.subcontractortype || null,
    subcontractorid: item.subcontractorid || null,
    contractorid: item.contractorid || null,
    
    // Status and workflow fields
    status: item.status || 'draft',
    comments: item.comments || null,
    submittedBy: item.submitted_by || null,
    reviewedBy: item.reviewed_by || null,
    reviewedAt: item.reviewed_at || null,
    
    // Financial fields
    value: item.value || 0,
    supplyprogress: item.supplyprogress || 0,
    
    // Workflow properties
    assigned_to_user_id: item.assigned_to_user_id || null,
    assigned_to_role: item.assigned_to_role || null,
    workflow_history: item.workflow_history || []
  };
};

/**
 * Calculate item weights and weighted progress
 */
function calculateItemWeights(items: ProjectItem[]): ProjectItem[] {
  if (items.length === 0) return items;
  
  const totalExecutionTime = items.reduce((sum, item) => sum + (item.executionTime || 0), 0);

  return items.map(item => {
    const weight = totalExecutionTime > 0 ? (item.executionTime || 0) / totalExecutionTime : 0;
    const weightedProgress = weight * (item.progress || 0);

    // Calculate execution time from dates if available
    let executionTime = item.executionTime || 0;
    if (item.startDate && item.endDate) {
      const startDate = new Date(item.startDate);
      const endDate = new Date(item.endDate);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      executionTime = Math.max(1, daysDiff);
    }

    return {
      ...item,
      weight,
      weightedProgress,
      executionTime,
    };
  });
}

/**
 * Calculate risk level for an item
 */
function calculateRiskLevel(item: ProjectItem): "low" | "medium" | "high" {
  let riskLevel: "low" | "medium" | "high" = "low";

  if (item.startDate && item.endDate) {
    const now = new Date();
    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    const totalItemDuration = endDate.getTime() - startDate.getTime();
    const elapsedTime = now.getTime() - startDate.getTime();
    const elapsedPercentage = totalItemDuration > 0 ? (elapsedTime / totalItemDuration) * 100 : 0;

    if (now > endDate && item.progress < 100) {
      riskLevel = "high";
    }
    else if (elapsedPercentage > 0 && item.progress < elapsedPercentage * 0.7) {
      riskLevel = "high";
    }
    else if (elapsedPercentage > 0 && item.progress < elapsedPercentage * 0.8) {
      riskLevel = "medium";
    }
  }

  return riskLevel;
}
 export function canUserEdit (item: ProjectItem ,currentUser:User , project:Project): boolean {
    if (!currentUser) return false;
    if(item.status=="published") return false;
    // Check if user is assigned to this item or has permission to edit
    return (
      (item.assigned_to_user_id === currentUser.id ||
      item.subcontractorid === currentUser.id ||
      (currentUser.role === 'mainConsultant') ||
      (currentUser.role === 'consultant' && project.consultant_id === currentUser.id)
   ) );
  };
/**
 * Save item function with proper database field mapping
 */
export async function saveItem(item: ProjectItem): Promise<boolean> {
  try {
    const dbItem = {
      project_id: item.projectId,
      item_number: item.itemNumber,
      name: item.name,
      start_date: item.startDate,
      end_date: item.endDate,
      progress: item.progress,
      execution_time: item.executionTime,
      weight: item.weight,
      weighted_progress: item.weightedProgress,
      risk_level: item.riskLevel,
      status: item.status || 'pending',
      comments: item.comments,
      submitted_by: item.submittedBy,
      reviewed_by: item.reviewedBy,
      reviewed_at: item.reviewedAt,
      subcontractorType: item.subcontractortype,
      subcontractorid: item.subcontractorid,
      contractorid: item.contractorid,
      value: item.value,
      supplyprogress: item.supplyprogress
    };

    if (item.id) {
      // Update existing item
      const { error } = await supabase
        .from('project_items')
        .update(dbItem)
        .eq('id', item.id);
      
      if (error) throw error;
    } else {
      // Insert new item
      const { error } = await supabase
        .from('project_items')
        .insert(dbItem);
      
      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error("Error saving item:", error);
    return false;
  }
}

/**
 * Delete items by project ID
 */
export async function deleteItemsByProjectId(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('project_items')
      .delete()
      .eq('project_id', projectId);
    
    if (error) throw error;
  } catch (error) {
    console.error("Error deleting items by project ID:", error);
  }
}

/**
 * Update item risk levels (utility function)
 */
export async function updateItemRiskLevels(): Promise<ProjectItem[]> {
  try {
    const items = await loadItems();
    return items;
  } catch (error) {
    console.error("Error updating risk levels:", error);
    return [];
  }
}