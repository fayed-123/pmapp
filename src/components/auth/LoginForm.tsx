import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    nameOrEmail: "", // Remove default value to keep the field empty
    role: "mainConsultant", // Keep default to main consultant role
  });

  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | { target: { name: string; value: string } }
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(formData.nameOrEmail, formData.role);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: "mainConsultant", label: "مشرف عام" },
    { value: "generalConsultant", label: "استشاري عام" },
    { value: "consultant", label: "استشاري" },
    { value: "owner", label: "مالك" },
    { value: "contractor", label: "مقاول" },
  ];

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 py-6 px-8 rounded-xl border"
      >
        <FormField
          label={
            formData.role === "mainConsultant"
              ? "اسم المشرف العام"
              : formData.role === "consultant"
              ? "اسم الاستشاري"
              : "الاسم"
          }
          name="nameOrEmail"
          type="text"
          value={formData.nameOrEmail}
          onChange={handleChange}
          placeholder={
            formData.role === "mainConsultant"
              ? "أدخل اسم المشرف العام"
              : "أدخل الاسم كما سجله المشرف العام"
          }
          required
        />

        <FormField
          label="نوع المستخدم"
          name="role"
          type="select"
          options={roleOptions}
          value={formData.role}
          onChange={handleChange}
          required
        />

        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "جاري التحميل..." : "دخول"}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
