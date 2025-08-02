import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  userRole?: string;
  footerActions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  userRole,
  footerActions 
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Map size to responsive width classes
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "max-w-sm sm:max-w-md";
      case "lg":
        return "max-w-lg sm:max-w-2xl lg:max-w-4xl xl:max-w-5xl";
      case "xl":
        return "max-w-xl sm:max-w-3xl lg:max-w-5xl xl:max-w-7xl";
      case "md":
      default:
        return "max-w-md sm:max-w-lg lg:max-w-2xl xl:max-w-3xl";
    }
  };

  return (
    <div
      style={{ margin: "0!important" }}
      className="m-0 fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6"
      onClick={() => onClose()}
    >
      <div
        className={`bg-white rounded-xl sm:rounded-2xl shadow-2xl ${getSizeClasses()} w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden transform transition-all duration-200 ease-out animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in-0 sm:zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Enhanced Header */}
        {title && (
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight pr-8">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header for modals without title */}
        {!title && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 bg-white/80 backdrop-blur-sm"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 max-h-[calc(95vh-8rem)] sm:max-h-[calc(90vh-8rem)]">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-gray-200 px-4 sm:px-6 pb-6 pt-2 bg-gray-50 rounded-b-xl sm:rounded-b-2xl">
          <div className="flex justify-end gap-3">
            {footerActions ? (
              footerActions
            ) : (
              <Button
                variant="default"
                onClick={onClose}
                className="text-base sm:text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md"
              >
                إغلاق
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
