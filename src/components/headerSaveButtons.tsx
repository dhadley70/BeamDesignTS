import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { exportDesignData, importDesignData, readJSONFile } from '@/lib/saveLoadUtils';
import { Save, FolderOpen } from 'lucide-react';

interface HeaderSaveButtonsProps {
  onImportComplete?: () => void;
}

export const HeaderSaveButtons: React.FC<HeaderSaveButtonsProps> = ({ onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Use the built-in function to export with the new filename format
      exportDesignData();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const jsonData = await readJSONFile(files[0]);
      const result = importDesignData(jsonData);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Trigger callback if provided and import was successful
      if (result.success && onImportComplete) {
        // Wait a moment for localStorage events to propagate
        setTimeout(() => onImportComplete(), 100);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 border-[color:var(--border)] text-[color:var(--text)] hover:text-[color:var(--card)]"
          onClick={handleExport}
        >
          <Save className="size-4" />
          <span>Save</span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 border-[color:var(--border)] text-[color:var(--text)] hover:text-[color:var(--card)]"
          onClick={handleImportClick}
        >
          <FolderOpen className="size-4" />
          <span>Open</span>
        </Button>
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </>
  );
};

export default HeaderSaveButtons;