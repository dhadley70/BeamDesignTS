import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

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
}

export const LoadsInputCard: React.FC<LoadsInputProps> = ({ loads, setLoads }) => {
  // State to manage form inputs for new load
  const [newLoad, setNewLoad] = useState<Omit<UDLLoad, 'id'>>({
    start: 0,
    finish: 0,
    udlG: 0,
    udlQ: 0
  });

  // Generate a unique ID for new loads
  const generateId = () => `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handler for adding a new load
  const handleAddLoad = () => {
    const loadWithId: UDLLoad = {
      ...newLoad,
      id: generateId()
    };
    
    setLoads(prevLoads => [...prevLoads, loadWithId]);
    
    // Reset form
    setNewLoad({
      start: 0,
      finish: 0,
      udlG: 0,
      udlQ: 0
    });
    
    // Save to local storage
    localStorage.setItem('beamLoads', JSON.stringify([...loads, loadWithId]));
  };

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

  // Handler for input changes for new load
  const handleInputChange = (field: keyof Omit<UDLLoad, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow direct typing in the field
    if (value === '--' || value === '') {
      setNewLoad(prev => ({
        ...prev,
        [field]: 0
      }));
      return;
    }
    
    const numValue = parseFloat(value) || 0;
    setNewLoad(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Handler for editing existing loads
  const handleEditLoad = (id: string, field: keyof Omit<UDLLoad, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow direct typing in the field
    if (value === '--' || value === '') {
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
    
    const numValue = parseFloat(value) || 0;
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
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* UDL Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Start (m)</TableHead>
                <TableHead>Finish (m)</TableHead>
                <TableHead>UDL G (kN/m)</TableHead>
                <TableHead>UDL Q (kN/m)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loads.length > 0 ? (
                loads.map((load) => (
                  <TableRow key={load.id}>
                    <TableCell>
                      <InputWithUnit
                        value={load.start === 0 ? "--" : load.start.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'start', e)}
                        onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.finish === 0 ? "--" : load.finish.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'finish', e)}
                        onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.udlG === 0 ? "--" : load.udlG.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'udlG', e)}
                        onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                        unit="kN/m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.udlQ === 0 ? "--" : load.udlQ.toString()}
                        onChange={(e) => handleEditLoad(load.id, 'udlQ', e)}
                        onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                        unit="kN/m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          const updatedLoads = loads.filter(l => l.id !== load.id);
                          setLoads(updatedLoads);
                          localStorage.setItem('beamLoads', JSON.stringify(updatedLoads));
                        }}
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    No loads added yet
                  </TableCell>
                </TableRow>
              )}
              {/* Add new load row */}
              <TableRow>
                <TableCell>
                  <InputWithUnit
                    value={newLoad.start === 0 ? "--" : newLoad.start.toString()}
                    onChange={(e) => handleInputChange('start', e)}
                    onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                    unit="m"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <InputWithUnit
                    value={newLoad.finish === 0 ? "--" : newLoad.finish.toString()}
                    onChange={(e) => handleInputChange('finish', e)}
                    onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                    unit="m"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <InputWithUnit
                    value={newLoad.udlG === 0 ? "--" : newLoad.udlG.toString()}
                    onChange={(e) => handleInputChange('udlG', e)}
                    onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                    unit="kN/m"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <InputWithUnit
                    value={newLoad.udlQ === 0 ? "--" : newLoad.udlQ.toString()}
                    onChange={(e) => handleInputChange('udlQ', e)}
                    onFocus={(e) => e.target.value === "--" ? e.target.value = "" : null}
                    unit="kN/m"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={handleAddLoad}
                  >
                    Add
                  </button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadsInputCard;