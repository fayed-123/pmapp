
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface FormFieldProps {
  label: string;
  name: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "date";
  options?: Option[];
  value?: string | number;
  required?: boolean;
  onChange: (e: any) => void;
  placeholder?: string;
  step?: string;
  min?: string;
   max?: string
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  options = [],
  value = "",
  required = false,
  onChange,
  placeholder,
}) => {
  if (type === "textarea") {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="font-bold">{label}</Label>
        <Textarea
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className="rtl"
          dir="rtl"
        />
      </div>
    );
  }
  
  if (type === "select") {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="font-bold">{label}</Label>
        <Select
          value={value as string}
          onValueChange={(newValue) => onChange({ target: { name, value: newValue } })}
          name={name}
        >
          <SelectTrigger id={name} className="rtl">
            <SelectValue placeholder={placeholder || "اختر..."} />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="font-bold">{label}</Label>
        <Input
          type="date"
          id={name}
          name={name}
          value={value as string}
          onChange={onChange}
          required={required}
          className="rtl"
          dir="rtl"
        />
      </div>
    );
  }

  // Default input
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-bold">{label}</Label>
      <Input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="rtl"
        dir="rtl"
      />
    </div>
  );
};

export default FormField;
