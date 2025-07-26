import { useState, useEffect } from "react";
import { ProjectItem } from "@/lib/types";
import { loadItems, saveItem, updateProjectCompletion } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { getItemTypeForUser } from "@/lib/utils/typeMapping";
import { supabase } from "@/lib/supabase";

export const useProjectItems = (projectId: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadProjectItemsData = async () => {
      if (!projectId || !user) return;
    
      setIsLoading(true);
      try {
        console.log("🔧 useProjectItems calling loadItems with:", { user: user.id, projectId });
        const projectItems = await loadItems(user, projectId);
        console.log("🔧 useProjectItems got back:", projectItems.length, "items");
        setItems(projectItems);
      } catch (error) {
        console.error("Error loading project items:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadProjectItemsData();
  }, [projectId, user]);

  // Update project completion when items change
  useEffect(() => {
    if (items.length > 0) {
      updateProjectCompletion(projectId);
    }
  }, [items, projectId]);
  

  const refreshItems = async () => {
    try {
      setIsLoading(true);
      // Use the centralized loadItems function
      const updatedItems = await loadItems(user, projectId);
      setItems(updatedItems);
    } catch (error) {
      console.error('Error refreshing items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (newItem: Partial<ProjectItem>) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    // Validate dates
    if (newItem.startDate && newItem.endDate) {
      const startDate = new Date(newItem.startDate);
      const endDate = new Date(newItem.endDate);
      if (endDate < startDate) {
        toast({
          title: "خطأ في التواريخ",
          description: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
          variant: "destructive",
        });
        return;
      }
    }

    // Auto-assign subcontractor type based on user type
    const userItemType = getItemTypeForUser(user.type || '');
    
    const item: ProjectItem = {
      id: Date.now().toString(),
      projectId: projectId,
      itemNumber: newItem.itemNumber || (items.length + 1).toString(),
      name: newItem.name || "",
      progress: newItem.progress || 0,
      startDate: newItem.startDate || new Date().toISOString().split("T")[0],
      endDate:
        newItem.endDate ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      executionTime: newItem.executionTime || 7,
      weight: 0,
      weightedProgress: 0,
      // Auto-assign type based on user
      subcontractortype: userItemType || newItem.subcontractortype,
      subcontractorid: user.role === 'subcontractor' ? user.id : newItem.subcontractorid,
      contractorid: user.role === 'contractor' ? user.id : user.parentId,
      value: newItem.value || 0,
      supplyprogress: newItem.supplyprogress || 0,
      status: 'draft',
      
      assigned_to_user_id: user.id, // Assign to current user initially
      assigned_to_role: user.role, // Assign to current user's role
      workflow_history: [] // Start with empty history
    };

    try {
      const success = await saveItem(item);
      if (success) {
        setItems((prev) => [...prev, item]);
        await updateProjectCompletion(projectId);
        toast({ 
          title: "تمت الإضافة", 
          description: "تم إضافة البند بنجاح" 
        });
        return item;
      } else {
        throw new Error("Failed to save item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة البند",
        variant: "destructive",
      });
    }
  };

  const updateItem = async (updatedItem: ProjectItem) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return false;
    }

    // Validate dates
    if (updatedItem.startDate && updatedItem.endDate) {
      const startDate = new Date(updatedItem.startDate);
      const endDate = new Date(updatedItem.endDate);
      if (endDate < startDate) {
        toast({
          title: "خطأ في التواريخ",
          description: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
          variant: "destructive",
        });
        return false;
      }
    }

    // Check permissions for subconsultants and subcontractors
    if (user.role === "subconsultant" || user.role === "subcontractor") {
      const userItemType = getItemTypeForUser(user.type || '');
      
      // Check if item type matches user type
      if (updatedItem.subcontractortype !== userItemType) {
        toast({
          title: "غير مسموح",
          description: "لا يمكنك تعديل بند لا يخص تخصصك",
          variant: "destructive",
        });
        return false;
      }

      // Check if user owns the item or is the responsible contractor
      if (
        updatedItem.subcontractorid !== user.id && 
        updatedItem.contractorid !== user.id
      ) {
        toast({
          title: "غير مسموح",
          description: "لا يمكنك تعديل هذا البند",
          variant: "destructive",
        });
        return false;
      }
    }

    try {
      const success = await saveItem(updatedItem);
      if (success) {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        await updateProjectCompletion(projectId);
        toast({ 
          title: "تم التعديل", 
          description: "تم تعديل البند بنجاح" 
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل البند",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const itemToDelete = items.find((i) => i.id === itemId);
      if (!itemToDelete) {
        toast({
          title: "خطأ",
          description: "البند غير موجود",
          variant: "destructive",
        });
        return;
      }

      // Check permissions for subconsultants and subcontractors
      if (user.role === "subconsultant" || user.role === "subcontractor") {
        const userItemType = getItemTypeForUser(user.type || '');
        
        // Check if item type matches user type
        if (itemToDelete.subcontractorType !== userItemType) {
          toast({
            title: "غير مسموح",
            description: "لا يمكنك حذف بند لا يخص تخصصك",
            variant: "destructive",
          });
          return;
        }

        // Check if user owns the item or is the responsible contractor
        if (
          itemToDelete.subcontractorId !== user.id && 
          itemToDelete.contractorid !== user.id
        ) {
          toast({
            title: "غير مسموح",
            description: "لا يمكنك حذف هذا البند",
            variant: "destructive",
          });
          return;
        }
      }

      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from("project_items")
        .delete()
        .eq("id", itemId);
      
      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      await updateProjectCompletion(projectId);
      toast({ 
        title: "تم الحذف", 
        description: "تم حذف البند بنجاح" 
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف البند",
        variant: "destructive",
      });
    }
  };

  const importItems = async (importedItems: ProjectItem[]) => {
    if (!user) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      const userItemType = getItemTypeForUser(user.type || '');
      
      // Auto-assign user type to all imported items
      const itemsWithType = importedItems.map((item) => ({
        ...item,
        subcontractortype: userItemType || item.subcontractortype,
        subcontractorid: user.role === 'subcontractor' ? user.id : item.subcontractorid,
        contractorid: user.role === 'contractor' ? user.id : user.parentId,
        status: 'pending' as const
      }));

      const savePromises = itemsWithType.map((item) => saveItem(item));
      await Promise.all(savePromises);

      setItems((prev) => [...prev, ...itemsWithType]);
      await updateProjectCompletion(projectId);

      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${importedItems.length} بند بنجاح`,
      });
    } catch (error) {
      console.error("Error importing items:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استيراد البنود",
        variant: "destructive",
      });
    }
  };

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    importItems,
    refreshItems
  };
};