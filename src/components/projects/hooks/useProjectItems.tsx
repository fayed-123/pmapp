import { useState, useEffect } from 'react';
import { ProjectItem, Project } from '@/lib/types';
import { loadItems, saveItem, updateProjectCompletion } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export const useProjectItems = (projectId: string) => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Load items on mount and when projectId changes
  useEffect(() => {
    const loadProjectItems = async () => {
      setIsLoading(true);
      try {
        const allItems = await loadItems();
        setItems(allItems.filter(i => i.projectId === projectId));
      } catch (error) {
        console.error('Error loading items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProjectItems();
  }, [projectId]);

  // Update project completion when items change
  useEffect(() => {
    if (items.length > 0) {
      updateProjectCompletion(projectId);
    }
  }, [items, projectId]);

  const addItem = async (newItem: Partial<ProjectItem>) => {
    // Validation remains the same
    if (newItem.startDate && newItem.endDate) {
      const startDate = new Date(newItem.startDate);
      const endDate = new Date(newItem.endDate);
      
      if (endDate < startDate) {
        toast({
          title: "خطأ في التواريخ",
          description: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
          variant: "destructive"
        });
        return;
      }
    }
    
    const item: ProjectItem = {
      id: Date.now().toString(),
      projectId: projectId,
      itemNumber: newItem.itemNumber || (items.length + 1).toString(),
      name: newItem.name || '',
      progress: newItem.progress || 0,
      startDate: newItem.startDate || new Date().toISOString().split('T')[0],
      endDate: newItem.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      executionTime: newItem.executionTime || 7,
      weight: 0,
      weightedProgress: 0,
    };
    
    try {
      const success = await saveItem(item);
      if (success) {
        setItems(prev => [...prev, item]);
        await updateProjectCompletion(projectId);
        
        toast({
          title: "تمت الإضافة",
          description: "تم إضافة البند بنجاح",
        });
        
        return item;
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة البند",
        variant: "destructive"
      });
    }
  };

  const updateItem = async (updatedItem: ProjectItem) => {
    // Validation remains the same
    if (updatedItem.startDate && updatedItem.endDate) {
      const startDate = new Date(updatedItem.startDate);
      const endDate = new Date(updatedItem.endDate);
      
      if (endDate < startDate) {
        toast({
          title: "خطأ في التواريخ",
          description: "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء",
          variant: "destructive"
        });
        return false;
      }
    }
    
    try {
      const success = await saveItem(updatedItem);
      if (success) {
        setItems(prev => prev.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        ));
        await updateProjectCompletion(projectId);
        
        toast({
          title: "تم التعديل",
          description: "تم تعديل البند بنجاح",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تعديل البند",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      // Since we don't have a direct deleteItem function, we can use saveItem with a delete flag
      // Or add a deleteItem function to the db layer
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase
        .from('project_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      
      setItems(prev => prev.filter(item => item.id !== itemId));
      await updateProjectCompletion(projectId);
      
      toast({
        title: "تم الحذف",
        description: "تم حذف البند بنجاح",
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف البند",
        variant: "destructive"
      });
    }
  };

  const importItems = async (importedItems: ProjectItem[]) => {
    try {
      // Save each imported item
      const savePromises = importedItems.map(item => saveItem(item));
      await Promise.all(savePromises);
      
      setItems(prev => [...prev, ...importedItems]);
      await updateProjectCompletion(projectId);
      
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${importedItems.length} بند بنجاح`,
      });
    } catch (error) {
      console.error('Error importing items:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استيراد البنود",
        variant: "destructive"
      });
    }
  };

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    importItems
  };
};