
import { useState } from 'react';
import { ProjectItem } from '@/lib/types';

export const useItemForm = (initialItem?: Partial<ProjectItem>) => {
  const [newItem, setNewItem] = useState<Partial<ProjectItem>>(initialItem || { 
    itemNumber: '', 
    name: '', 
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    executionTime: 7,
    weight: 0,
    weightedProgress: 0,
    
  });

  const resetItemForm = () => {
    setNewItem({ 
      itemNumber: '', 
      name: '', 
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      executionTime: 7,
      weight: 0,
      weightedProgress: 0
    });
  };

  const handleItemChange = (e: any) => {
    const { name, value } = e.target;
    
    // For date fields, check if they're valid and calculate execution time
    if (name === 'startDate' || name === 'endDate') {
      const updatedItem = {
        ...newItem,
        [name]: value,
      };
      
      // If both dates are valid, calculate the execution time
      if (updatedItem.startDate && updatedItem.endDate) {
        const startDate = new Date(updatedItem.startDate);
        const endDate = new Date(updatedItem.endDate);
        
        if (endDate >= startDate) {
          const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          updatedItem.executionTime = Math.max(1, daysDiff); // Ensure at least 1 day
        }
      }
      
      setNewItem(updatedItem);
    } else {
      setNewItem({
        ...newItem,
        [name]: name === 'progress' || name === 'executionTime' ? Number(value) : value,
      });
    }
  };

  return {
    newItem,
    setNewItem,
    handleItemChange,
    resetItemForm
  };
};
