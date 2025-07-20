import { useState, useEffect } from "react";
import { ProjectItem, Project } from "@/lib/types";
import { loadItems, saveItem, updateProjectCompletion } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useProjectItems = (projectId: string) => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const loadProjectItems = async () => {
      setIsLoading(true);
      try {
        const { supabase } = await import("@/lib/supabase");

        if (user?.role === "subconsultant" && user.subcontractorType) {
          // جلب المقاولين الفرعيين التابعين لنفس الاستشاري الفرعي وتخصصه
          const { data: subcontractors, error: scError } = await supabase
            .from("users")
            .select("id")
            .eq("parent_id", user.id)
            .eq("subcontractor_type", user.subcontractorType);

          if (scError) throw scError;
          const subcontractorIds = subcontractors?.map((sc) => sc.id) || [];

          // جلب البنود التي تخص نفس التخصص والمقاولين الفرعيين التابعين فقط
          const { data, error } = await supabase
            .from("project_items")
            .select("*")
            .eq("project_id", projectId)
            .eq("subcontractorType", user.subcontractorType)
            .in("subcontractor_id", subcontractorIds);

          if (error) throw error;
          setItems(data || []);
        } else {
          // هنا الاستشاري (consultant) أو أدوار أعلى
          // يعرض كل البنود بدون فلترة
          const { data, error } = await supabase
            .from("project_items")
            .select("*")
            .eq("project_id", projectId);

          if (error) throw error;
          setItems(data || []);
        }
      } catch (error) {
        console.error("Error loading items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId && user) {
      loadProjectItems();
    }
  }, [projectId, user]);

  // تحديث تقدم المشروع عند تغير البنود
  useEffect(() => {
    if (items.length > 0) {
      updateProjectCompletion(projectId);
    }
  }, [items, projectId]);

  const addItem = async (newItem: Partial<ProjectItem>) => {
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
      subcontractorType: user?.subcontractorType || null,
      subcontractorId: user?.id || null, // مهم: رابط البند بالمقاول الفرعي الحالي
      contractorid: user?.parentId || user?.id,
    };

    try {
      const success = await saveItem(item);
      if (success) {
        setItems((prev) => [...prev, item]);
        await updateProjectCompletion(projectId);
        toast({ title: "تمت الإضافة", description: "تم إضافة البند بنجاح" });
        return item;
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

    // فقط لو المستخدم استشاري فرعي نطبق شروط التحقق:
    if (user?.role === "subconsultant" && user.subcontractorType) {
      // جلب المقاولين الفرعيين التابعين لنفس الاستشاري الفرعي وتخصصه
      const { supabase } = await import("@/lib/supabase");
      const { data: subcontractors } = await supabase
        .from("users")
        .select("id")
        .eq("parent_id", user.id)
        .eq("subcontractor_type", user.subcontractorType);
      const subcontractorIds = subcontractors?.map((sc) => sc.id) || [];

      // تحقق من تخصص البند
      if (updatedItem.subcontractorType !== user.subcontractorType) {
        toast({
          title: "غير مسموح",
          description: "لا يمكنك تعديل بند لا يخص تخصصك",
          variant: "destructive",
        });
        return false;
      }

      // تحقق إن المستخدم هو إما:
      // - المقاول الفرعي نفسه اللي ضاف البند (subcontractorId)
      // - أو المقاول الرئيسي (contractorid)
      if (
        updatedItem.subcontractorId !== user.id && // مش هو المقاول الفرعي صاحب البند
        updatedItem.contractorid !== user.id // مش هو المقاول الرئيسي المسؤول
      ) {
        toast({
          title: "غير مسموح",
          description:
            "لا يمكنك تعديل هذا البند لأنك لست المقاول الفرعي صاحب البند أو المقاول الرئيسي المسؤول.",
          variant: "destructive",
        });
        return false;
      }
    }

    // لو المستخدم مش استشاري فرعي (مثلاً استشاري أو admin) يسمح له يعدل أي بند بدون تحقق

    try {
      const success = await saveItem(updatedItem);
      if (success) {
        setItems((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        await updateProjectCompletion(projectId);
        toast({ title: "تم التعديل", description: "تم تعديل البند بنجاح" });
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

      // لو المستخدم استشاري فرعي نطبق الشروط:
      if (user?.role === "subconsultant" && user.subcontractorType) {
        // جلب المقاولين الفرعيين التابعين لنفس الاستشاري الفرعي وتخصصه
        const { supabase } = await import("@/lib/supabase");
        const { data: subcontractors } = await supabase
          .from("users")
          .select("id")
          .eq("parent_id", user.id)
          .eq("subcontractor_type", user.subcontractorType);
        const subcontractorIds = subcontractors?.map((sc) => sc.id) || [];

        // تحقق من تخصص البند
        if (itemToDelete.subcontractorType !== user.subcontractorType) {
          toast({
            title: "غير مسموح",
            description: "لا يمكنك حذف بند لا يخص تخصصك",
            variant: "destructive",
          });
          return;
        }

        // تحقق إن المستخدم هو إما:
        // - المقاول الفرعي نفسه اللي ضاف البند (subcontractorId)
        // - أو المقاول الرئيسي (contractorid)
        if (
          itemToDelete.subcontractorId !== user.id && // مش هو المقاول الفرعي صاحب البند
          itemToDelete.contractorid !== user.id // مش هو المقاول الرئيسي المسؤول
        ) {
          toast({
            title: "غير مسموح",
            description:
              "لا يمكنك حذف هذا البند لأنك لست المقاول الفرعي صاحب البند أو المقاول الرئيسي المسؤول.",
            variant: "destructive",
          });
          return;
        }
      }

      // لو مش استشاري فرعي (استشاري أو دور أكبر) يسمح بالحذف مباشرة

      const { supabase } = await import("@/lib/supabase");
      const { error } = await supabase
        .from("project_items")
        .delete()
        .eq("id", itemId);
      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      await updateProjectCompletion(projectId);
      toast({ title: "تم الحذف", description: "تم حذف البند بنجاح" });
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
    try {
      const itemsWithType = importedItems.map((item) => ({
        ...item,
        subcontractorType: user?.subcontractorType || null,
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
  };
};
