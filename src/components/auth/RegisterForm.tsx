
// export default RegisterForm;
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import FormField from "@/components/FormField";
import { Button } from "@/components/ui/button";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    parentId: "",
  });

  const [contractors, setContractors] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    async function fetchContractors() {
      const { data, error } = await supabase
        .from("users")
        .select("id, name")
        .eq("role", "contractor");

      if (error) {
        console.error("Error loading contractors:", error);
      } else if (data) {
        const options = data.map((c) => ({
          value: c.id,
          label: c.name,
        }));
        setContractors(options);
      }
    }
    fetchContractors();
  }, []);

  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(formData as any);
      if (success) {
        onSwitchToLogin();
      }
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
    { value: "subcontractor", label: "مقاول فرعي" },
  ];

  return (
    <div className="max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 py-6 px-8 rounded-xl border"
      >
        <FormField
          label="الاسم الكامل"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormField
          label="البريد الإلكتروني"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormField
          label="رقم الهاتف (واتساب)"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        <FormField
          label="الدور"
          name="role"
          type="select"
          options={roleOptions}
          value={formData.role}
          onChange={handleChange}
          required
        />

        <FormField
          label="كلمة المرور"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {formData.role === "subcontractor" && (
          <FormField
            label="المقاول الرئيسي"
            name="parentId"
            type="select"
            options={contractors}
            value={formData.parentId}
            onChange={handleChange}
            required
          />
        )}

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "جاري التسجيل..." : "إنشاء حساب"}
        </Button>

        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToLogin}
            className="text-indigo-600"
          >
            لديك حساب؟ سجل دخول
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
