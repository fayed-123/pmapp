
import React from 'react';
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';  // Added size property
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'md' }) => {
  if (!isOpen) return null;

  // Map size to width class
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-3xl';
      case 'xl': return 'max-w-5xl';
      case 'md':
      default: return 'max-w-2xl';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={() => onClose()}
    >
      <div 
        className={`bg-white rounded-lg shadow-lg ${getSizeClass()} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
        <div className="border-t px-6 py-4 flex justify-center">
          <Button variant="default" onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
