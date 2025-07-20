import React from "react";
import { Project } from "@/lib/types";
import FormField from "@/components/FormField";
import Modal from "@/components/Modal";
import { Button } from "@/components/ui/button";

interface UserOption {
  value: string;
  label: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProject: Project;
  owners: UserOption[];
  consultants: UserOption[];
  // generalConsultants: UserOption[];
  onProjectChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  editProject,
  owners,
  consultants,
  // generalConsultants,
  onProjectChange,
  onSubmit,
}) => {
  console.log("owners:", owners);
console.log("consultants:", consultants);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="تعديل بيانات المشروع">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="تاريخ البداية"
            name="start"
            type="date"
            value={editProject.start}
            onChange={onProjectChange}
            required
          />

          <FormField
            label="تاريخ النهاية المتوقعة"
            name="end"
            type="date"
            value={editProject.end}
            onChange={onProjectChange}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="المالك"
            name="ownerId"
            type="select"
            options={owners|| []}
            value={editProject.ownerId}
            onChange={onProjectChange}
            required
          />
          
          <FormField
            label="الاستشاري المشرف"
            name="consultantId"
            type="select"
            options={consultants|| []}
            value={editProject.consultantId}
            onChange={onProjectChange}
            required
          />
        </div>
        
        {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <FormField
            label="الاستشاري العام"
            name="generalConsultantId"
            type="select"
            options={generalConsultants}
            value={editProject.generalConsultantId}
            onChange={onProjectChange}
            required
          />
        </div> */}

        <div className="flex justify-center">
          <Button type="submit">حفظ التعديلات</Button>
        </div>
      </form>
    </Modal>
  );
  
};

export default EditProjectModal;
