
import React from 'react';
import { Progress as ProgressUI } from "@/components/ui/progress";

interface ProgressProps {
  value: number;
  className?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className }) => {
  return <ProgressUI value={value} className={className} />;
};

export default Progress;
