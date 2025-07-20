import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadUsers, saveProject } from "@/lib/db";
import { Project } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import FormField from "@/components/FormField";
import { useToast } from "@/components/ui/use-toast";
import Modal from "@/components/Modal";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [generalConsultants, setGeneralConsultants] = useState<
    { value: string; label: string }[]
  >([]);
  const [owners, setOwners] = useState<{ value: string; label: string }[]>([]);
  const [consultants, setConsultants] = useState<
    { value: string; label: string }[]
  >([]);
  const [contractors, setContractors] = useState<
    { value: string; label: string }[]
  >([]);

  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    start: "",
    end: "",
    ownerId: "",
    consultantId: "",
    contractorId: "",
    // generalConsultantId: '',
    // Financial fields
    contractValue: "",
    advancePaymentPercentage: "",
    workGuaranteePercentage: "",
    materialDeliveryPaymentPercentage: "",
    completedWorkPaymentPercentage: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await loadUsers();
        // setGeneralConsultants(
        //   users
        //     .filter((u) => u.role === "generalConsultant" && u.approved)
        //     .map((u) => ({ value: u.id, label: u.name }))
        // );
        setOwners(
          users
            .filter((u) => u.role === "owner" && u.approved)
            .map((u) => ({ value: u.id, label: u.name }))
        );
        setConsultants(
          users
            .filter((u) => u.role === "consultant" && u.approved)
            .map((u) => ({ value: u.id, label: u.name }))
        );
        setContractors(
          users
            .filter((u) => u.role === "contractor" && u.approved)
            .map((u) => ({ value: u.id, label: u.name }))
        );
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل المستخدمين",
          variant: "destructive",
        });
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, toast]);

  const handleFormChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateExpectedDays = (
    startDate: string,
    endDate: string
  ): number => {
    if (!startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    setIsSaving(true);

    try {
      const expectedDays = calculateExpectedDays(formData.start, formData.end);

      const newProject: Project = {
        name: formData.name,
        desc: formData.desc,
        start: formData.start,
        description: formData.desc,
        end: formData.end,
        ownerId: formData.ownerId,
        consultantId: formData.consultantId,
        contractorId: formData.contractorId,
        // generalConsultantId: formData.generalConsultantId,
        status: "active",
        completion: 0,
        timeElapsed: 0,
        performance: 0,
        created: new Date().toISOString(),
        expectedDays: expectedDays,
        // Financial fields
        contractValue: formData.contractValue
          ? parseFloat(formData.contractValue)
          : 0,
        advancePaymentPercentage: formData.advancePaymentPercentage
          ? parseFloat(formData.advancePaymentPercentage)
          : 0,
        workGuaranteePercentage: formData.workGuaranteePercentage
          ? parseFloat(formData.workGuaranteePercentage)
          : 0,
        materialDeliveryPaymentPercentage:
          formData.materialDeliveryPaymentPercentage
            ? parseFloat(formData.materialDeliveryPaymentPercentage)
            : 0,
        completedWorkPaymentPercentage: formData.completedWorkPaymentPercentage
          ? parseFloat(formData.completedWorkPaymentPercentage)
          : 0,
        mainConsultantId: user.id,
      };

      const success = await saveProject(newProject);
      if (success) {
        toast({
          title: "تم إنشاء المشروع",
          description: "تم حفظ المشروع بنجاح",
        });

        // Reset form
        setFormData({
          name: "",
          desc: "",
          start: "",
          end: "",
          ownerId: "",
          consultantId: "",
          contractorId: "",
          // generalConsultantId: '',
          contractValue: "",
          advancePaymentPercentage: "",
          workGuaranteePercentage: "",
          materialDeliveryPaymentPercentage: "",
          completedWorkPaymentPercentage: "",
        });

        onProjectCreated();
        onClose();
      } else {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ المشروع",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء المشروع",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      desc: "",
      start: "",
      end: "",
      ownerId: "",
      consultantId: "",
      contractorId: "",
      // generalConsultantId: '',
      contractValue: "",
      advancePaymentPercentage: "",
      workGuaranteePercentage: "",
      materialDeliveryPaymentPercentage: "",
      completedWorkPaymentPercentage: "",
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="إنشاء مشروع جديد"
      size="lg"
    >
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="اسم المشروع"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleFormChange}
            required
          />

          <FormField
            label="الوصف"
            name="desc"
            type="textarea"
            value={formData.desc}
            onChange={handleFormChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="تاريخ البداية"
              name="start"
              type="date"
              value={formData.start}
              onChange={handleFormChange}
              required
            />

            <FormField
              label="تاريخ النهاية المتوقعة"
              name="end"
              type="date"
              value={formData.end}
              onChange={handleFormChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {/* <FormField
              label="الاستشاري العام"
              name="generalConsultantId"
              type="select"
              options={generalConsultants}
              value={formData.generalConsultantId}
              onChange={handleFormChange}
              required
            /> */}
            {/* تبتبتبت */}
            <FormField
              label="الاستشاري المشرف"
              name="consultantId"
              type="select"
              options={consultants}
              value={formData.consultantId}
              onChange={handleFormChange}
              required
            />
            <FormField
              label="المالك"
              name="ownerId"
              type="select"
              options={owners}
              value={formData.ownerId}
              onChange={handleFormChange}
              required
            />
            <FormField
              label=" المقاول"
              name="contractorId" //////contractorsId
              type="select"
              options={contractors}
              value={formData.contractorId}
              onChange={handleFormChange}
              required
            />
            {/* تبتبتبت */}
          </div>

          {/* Financial Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              المعلومات المالية والتعاقدية
            </h3>

            <div className="space-y-4">
              <FormField
                label="قيمة المشروع التعاقدية"
                name="contractValue"
                type="number"
                value={formData.contractValue}
                onChange={handleFormChange}
                placeholder="أدخل قيمة المشروع"
                step="0.01"
                min="0"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="نسبة الدفعة المقدمة (%)"
                  name="advancePaymentPercentage"
                  type="number"
                  value={formData.advancePaymentPercentage}
                  onChange={handleFormChange}
                  placeholder="مثال: 20"
                  step="0.1"
                  min="0"
                  max="100"
                />

                <FormField
                  label="نسبة ضمان الأعمال (%)"
                  name="workGuaranteePercentage"
                  type="number"
                  value={formData.workGuaranteePercentage}
                  onChange={handleFormChange}
                  placeholder="مثال: 5"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="نسبة المستحق الدفع عند توريد المواد (%)"
                  name="materialDeliveryPaymentPercentage"
                  type="number"
                  value={formData.materialDeliveryPaymentPercentage}
                  onChange={handleFormChange}
                  placeholder="مثال: 30"
                  step="0.1"
                  min="0"
                  max="100"
                />

                <FormField
                  label="نسبة المستحق الدفع للأعمال المنجزة (%)"
                  name="completedWorkPaymentPercentage"
                  type="number"
                  value={formData.completedWorkPaymentPercentage}
                  onChange={handleFormChange}
                  placeholder="مثال: 70"
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-2 rounded font-bold disabled:opacity-50"
            >
              {isSaving ? "جاري الحفظ..." : "حفظ المشروع"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="px-8 py-2"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </Card>
    </Modal>
  );
};

export default CreateProjectModal;
