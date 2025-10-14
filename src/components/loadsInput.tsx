import React, { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'

// Define types for UDL load entry
export interface UDLLoad {
  id: string;
  start: number;
  finish: number;
  udlG: number;
  udlQ: number;
}

// Define props type for the component
interface LoadsInputProps {
  loads: UDLLoad[];
  setLoads: React.Dispatch<React.SetStateAction<UDLLoad[]>>;
  span: number; // Beam span in meters
}

export const LoadsInputCard: React.FC<LoadsInputProps> = ({ loads, setLoads, span }) => {
  // No state variables needed for form management since we're adding loads directly

  // Generate a unique ID for new loads
  const generateId = () => `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a default load directly
  const addDefaultLoad = () => {
    // Create a default load that spans the entire beam
    const defaultLoad: UDLLoad = {
      id: generateId(),
      start: 0,
      finish: span,
      udlG: 0,
      udlQ: 0
    };
    
    // Add to loads array
    setLoads(prevLoads => [...prevLoads, defaultLoad]);
    
    // Save to local storage
    localStorage.setItem('beamLoads', JSON.stringify([...loads, defaultLoad]));
  };
  


  // Note: The handleAddLoad function has been removed since we now use addDefaultLoad

  // Load from local storage on component mount
  useEffect(() => {
    const savedLoads = localStorage.getItem('beamLoads');
    if (savedLoads) {
      try {
        const parsedLoads = JSON.parse(savedLoads);
        setLoads(parsedLoads);
      } catch (e) {
        console.error('Failed to parse saved loads:', e);
      }
    }
  }, [setLoads]);

  // Note: The form input handler has been removed since we're adding loads directly

  
  // Handler for editing existing loads
  const handleEditLoad = (id: string, field: keyof Omit<UDLLoad, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Get the current load being edited
    const currentLoad = loads.find(load => load.id === id);
    if (!currentLoad) return;
    
    // Allow direct typing in the field
    if (value === '') {
      const updatedLoads = loads.map(load => {
        if (load.id === id) {
          return { ...load, [field]: 0 };
        }
        return load;
      });
      setLoads(updatedLoads);
      localStorage.setItem('beamLoads', JSON.stringify(updatedLoads));
      return;
    }
    
    let numValue = parseFloat(value) || 0;
    
    // Apply clamping for start and finish values
    if (field === 'start') {
      // Clamp start between 0 and span
      numValue = Math.max(0, Math.min(span, numValue));
      
      // If new start is greater than current finish, update finish too
      if (numValue > currentLoad.finish && currentLoad.finish !== 0) {
        const updatedLoads = loads.map(load => {
          if (load.id === id) {
            return { ...load, start: numValue, finish: numValue };
          }
          return load;
        });
        setLoads(updatedLoads);
        localStorage.setItem('beamLoads', JSON.stringify(updatedLoads));
        return;
      }
    } else if (field === 'finish') {
      // Clamp finish between start and span
      numValue = Math.max(currentLoad.start, Math.min(span, numValue));
    }
    
    const updatedLoads = loads.map(load => {
      if (load.id === id) {
        return { ...load, [field]: numValue };
      }
      return load;
    });
    
    setLoads(updatedLoads);
    localStorage.setItem('beamLoads', JSON.stringify(updatedLoads));
  };

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* UDL Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--text)]">Start</TableHead>
                <TableHead className="text-[var(--text)]">Finish</TableHead>
                <TableHead className="text-[var(--text)]">UDL Dead G</TableHead>
                <TableHead className="text-[var(--text)]">UDL Live Q</TableHead>
                <TableHead className="text-left">
                  <button
                    className="bg-[var(--accent)] hover:opacity-80 text-[var(--card)] font-bold py-1 px-3 rounded text-sm"
                    onClick={addDefaultLoad}
                  >
                    Add
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* No form shown, loads are added directly */}
              
              {loads.length > 0 ? (
                loads.map((load) => (
                  <TableRow key={load.id} className="border-0">
                    <TableCell>
                      <InputWithUnit
                        value={load.start.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'start', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.finish.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'finish', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.udlG.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'udlG', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kN/m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.udlQ.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'udlQ', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kN/m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm"
                        onClick={() => {
                          const updatedLoads = loads.filter(l => l.id !== load.id);
                          setLoads(updatedLoads);
                          localStorage.setItem('beamLoads', JSON.stringify(updatedLoads));
                        }}
                      >
                        X
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-[var(--muted)]">
                    No partial UDL loads added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadsInputCard;