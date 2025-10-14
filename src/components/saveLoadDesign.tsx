import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportDesignData, importDesignData, readJSONFile } from '@/lib/saveLoadUtils';
import { Badge } from './ui/badge';
import { Upload, FileDown } from 'lucide-react';

interface SaveLoadDesignProps {
  onImportComplete?: () => void;
}

export const SaveLoadDesign: React.FC<SaveLoadDesignProps> = ({ onImportComplete }) => {
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      // Generate a filename with current date
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const filename = `beam-design_${dateStr}.json`;
      
      exportDesignData(filename);
      
      // Show success message
      setImportStatus({ success: true, message: `Design exported to ${filename}` });
      
      // Clear message after 3 seconds
      setTimeout(() => setImportStatus(null), 3000);
    } catch (error) {
      setImportStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Export failed' 
      });
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
      setImportStatus({ message: 'Importing design...' });
      
      const jsonData = await readJSONFile(files[0]);
      const result = importDesignData(jsonData);
      
      setImportStatus(result);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Trigger callback if provided and import was successful
      if (result.success && onImportComplete) {
        // Wait a moment for localStorage events to propagate
        setTimeout(() => onImportComplete(), 100);
      }
      
      // Clear message after 3 seconds if successful
      if (result.success) {
        setTimeout(() => setImportStatus(null), 3000);
      }
    } catch (error) {
      setImportStatus({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Import failed' 
      });
    }
  };

  return (
    <Card className="mb-6 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Save & Load Design</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button 
            className="flex items-center gap-2" 
            onClick={handleExport}
          >
            <FileDown size={16} />
            <span>Export Design</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2" 
            onClick={handleImportClick}
          >
            <Upload size={16} />
            <span>Import Design</span>
          </Button>
          
          <input 
            type="file"
            ref={fileInputRef}
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        
        {importStatus && (
          <div className="mt-4">
            <Badge 
              variant={importStatus.success === undefined ? "outline" : 
                importStatus.success ? "success" : "destructive"}
              className="text-sm py-1 px-2"
            >
              {importStatus.message}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SaveLoadDesign;