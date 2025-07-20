
import React, { useState } from 'react';
import { ProjectItem } from '@/lib/types';
import FileImporter from '../FileImporter';
import Modal from '@/components/Modal';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

interface ImportItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onImportComplete: (items: ProjectItem[]) => void;
}

const ImportItemsModal: React.FC<ImportItemsModalProps> = ({ 
  isOpen, 
  onClose, 
  projectId, 
  onImportComplete 
}) => {
  const [importing, setImporting] = useState(false);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={!importing ? onClose : undefined}
      title="استيراد بيانات المشروع"
    >
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-600">
          يمكنك استيراد بنود المشروع من ملف إكسل أو ملف وورد.
        </AlertDescription>
      </Alert>
      
      <FileImporter 
        projectId={projectId} 
        onImportComplete={onImportComplete}
        onImportingChange={setImporting} 
      />
    </Modal>
  );
};

export default ImportItemsModal;
