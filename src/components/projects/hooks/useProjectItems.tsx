
import { useState, useEffect } from 'react';
import { ProjectItem, Project } from '@/lib/types';
import { loadItems, saveItems, updateProjectCompletion } from '@/lib/db';
import { useToast } from '@/components/ui/use-toast';

export const useProjectItems = (projectId: string) => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    setItems(loadItems().filter(i => i.projectId === projectId));
  }, [projectId]);

  useEffect(() => {
    updateProjectCompletion(projectId);
  }, [items, projectId]);

  const addItem = (newItem: Partial<ProjectItem>) => {
    // Ensure the startDate and endDate are valid
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
      weight: 0, // Will be calculated when loaded
      weightedProgress: 0 // Will be calculated when loaded
    };
    
    const updatedItems = [...items, item];
    setItems(updatedItems);
    saveItems([...loadItems().filter(i => i.projectId !== projectId), ...updatedItems]);
    updateProjectCompletion(projectId);
    
    toast({
      title: "تمت الإضافة",
      description: "تم إضافة البند بنجاح",
    });
    
    return item;
  };

  const updateItem = (updatedItem: ProjectItem) => {
    // Ensure the startDate and endDate are valid
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
    
    const updatedItems = items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    
    setItems(updatedItems);
    saveItems([...loadItems().filter(i => i.projectId !== projectId), ...updatedItems]);
    updateProjectCompletion(projectId);
    
    toast({
      title: "تم التعديل",
      description: "تم تعديل البند بنجاح",
    });
    
    return true;
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    saveItems([...loadItems().filter(i => i.projectId !== projectId), ...updatedItems]);
    updateProjectCompletion(projectId);
    
    toast({
      title: "تم الحذف",
      description: "تم حذف البند بنجاح",
    });
  };

  const importItems = (importedItems: ProjectItem[]) => {
    const updatedItems = [...items, ...importedItems];
    setItems(updatedItems);
    saveItems([...loadItems().filter(i => i.projectId !== projectId), ...updatedItems]);
    updateProjectCompletion(projectId);
  };

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    importItems
  };
};
