import React, { useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { InputWithUnit } from '@/components/ui/InputWithUnit'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import useLocalStorage from '@/hooks/useLocalStorage'

// Define types for UDL load entry
export interface UDLLoad {
  id: string;
  start: number;
  finish: number;
  udlG: number;
  udlQ: number;
}

// Define types for Point load entry
export interface PointLoad {
  id: string;
  location: number;
  pointG: number;
  pointQ: number;
}

// Define types for Moment entry
export interface Moment {
  id: string;
  location: number;
  momentG: number;
  momentQ: number;
}

// Define type for FULL UDL
export interface FullUDL {
  tributaryWidth: number;
  deadGkPa: number;
  liveQkPa: number;
  includeSelfWeight?: boolean;
}

// Define props type for the component
interface LoadsInputProps {
  loads: UDLLoad[];
  setLoads: React.Dispatch<React.SetStateAction<UDLLoad[]>>;
  span: number; // Beam span in meters
}

export const LoadsInputCard: React.FC<LoadsInputProps> = ({ loads, setLoads, span }) => {
  // State for point loads
  const [pointLoads, setPointLoads] = useLocalStorage<PointLoad[]>('beamPointLoads', []);
  // State for moments
  const [moments, setMoments] = useLocalStorage<Moment[]>('beamMoments', []);
  
  // Create a function to reset all UDL loads
  const resetAllUDLLoads = () => {
    // Clear all UDL loads
    setLoads([]);
    console.log('Cleared all UDL loads');
    
    // Force localStorage update
    localStorage.setItem('beamLoads', JSON.stringify([]));
    
    // Dispatch event for other components
    const event = new Event('app-storage-change');
    window.dispatchEvent(event);
  };
  
  // Validate loads on component mount
  useEffect(() => {
    // Check if there are loads in localStorage that aren't shown in the UI
    try {
      const storedLoads = localStorage.getItem('beamLoads');
      if (storedLoads) {
        const parsedLoads = JSON.parse(storedLoads) as UDLLoad[];
        
        // If localStorage has loads but our component doesn't show them, update the UI
        if (parsedLoads.length > 0 && loads.length === 0) {
          console.log('Found hidden UDL loads in localStorage, updating UI:', parsedLoads);
          
          // Check if the loads have the expected properties
          const validLoads = parsedLoads.filter(load => (
            load && 
            typeof load === 'object' && 
            'id' in load && 
            'start' in load && 
            'finish' in load && 
            'udlG' in load && 
            'udlQ' in load
          ));
          
          if (validLoads.length === parsedLoads.length) {
            setLoads(parsedLoads);
            
            // Show warning to user
            setTimeout(() => {
              if (confirm('Hidden UDL loads were found and have been added to the UI. Would you like to keep these loads or clear them all?\n\nClick OK to keep them, or Cancel to clear all loads.')) {
                // User chose to keep loads - do nothing
              } else {
                // User chose to clear loads
                resetAllUDLLoads();
              }
            }, 1000);
          } else {
            // Invalid loads detected, reset everything
            console.warn('Invalid UDL loads detected in localStorage, resetting');
            resetAllUDLLoads();
          }
        }
      }
    } catch (error) {
      console.error('Error validating localStorage UDL loads:', error);
      // On any error, reset to be safe
      resetAllUDLLoads();
    }
  }, []);
  // State for FULL UDL
  const [fullUDL, setFullUDL] = useLocalStorage<FullUDL>('beamFullUDL', {
    tributaryWidth: 0,
    deadGkPa: 0,
    liveQkPa: 0,
    includeSelfWeight: false
  });

  // Generate a unique ID for new loads
  const generateId = () => `load_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a default UDL load directly
  const addDefaultLoad = () => {
    // Create a default load that spans the entire beam
    const defaultLoad: UDLLoad = {
      id: generateId(),
      start: 0,
      finish: span,
      udlG: 0,
      udlQ: 0
    };
    
    // Add to loads array with safety check to ensure prevLoads is an array
    setLoads(prevLoads => {
      // Ensure prevLoads is an array
      const safeLoads = Array.isArray(prevLoads) ? prevLoads : [];
      const newLoads = [...safeLoads, defaultLoad];
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return newLoads;
    });
  };
  
  // Add a default point load
  const addDefaultPointLoad = () => {
    // Create a default point load at the middle of the beam
    const defaultPointLoad: PointLoad = {
      id: generateId(),
      location: span / 2,
      pointG: 0,
      pointQ: 0
    };
    
    // Add to point loads array with safety check
    setPointLoads(prevLoads => {
      // Ensure prevLoads is an array
      const safeLoads = Array.isArray(prevLoads) ? prevLoads : [];
      const newPointLoads = [...safeLoads, defaultPointLoad];
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return newPointLoads;
    });
  };
  
  // Add a default moment
  const addDefaultMoment = () => {
    // Create a default moment at the middle of the beam
    const defaultMoment: Moment = {
      id: generateId(),
      location: span / 2,
      momentG: 0,
      momentQ: 0
    };
    
    // Add to moments array with safety check
    setMoments(prevMoments => {
      // Ensure prevMoments is an array
      const safeMoments = Array.isArray(prevMoments) ? prevMoments : [];
      const newMoments = [...safeMoments, defaultMoment];
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return newMoments;
    });
  };
  


  // Note: The handleAddLoad function has been removed since we now use addDefaultLoad

  // Note: The form input handler has been removed since we're adding loads directly

  
  // Handler for editing existing UDL loads
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
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
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
        
        // Dispatch a custom event to notify other components about the change
        const event = new Event('app-storage-change');
        window.dispatchEvent(event);
        
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
    
    // Dispatch a custom event to notify other components about the change
    const event = new Event('app-storage-change');
    window.dispatchEvent(event);
  };
  
  // Handler for editing existing point loads
  const handleEditPointLoad = (id: string, field: keyof Omit<PointLoad, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Get the current point load being edited
    const currentLoad = pointLoads.find(load => load.id === id);
    if (!currentLoad) return;
    
    // Allow direct typing in the field
    if (value === '') {
      const updatedLoads = pointLoads.map(load => {
        if (load.id === id) {
          return { ...load, [field]: 0 };
        }
        return load;
      });
      setPointLoads(updatedLoads);
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return;
    }
    
    let numValue = parseFloat(value) || 0;
    
    // Apply clamping for location value
    if (field === 'location') {
      // Clamp location between 0 and span
      numValue = Math.max(0, Math.min(span, numValue));
    }
    
    const updatedLoads = pointLoads.map(load => {
      if (load.id === id) {
        return { ...load, [field]: numValue };
      }
      return load;
    });
    
    setPointLoads(updatedLoads);
    
    // Dispatch a custom event to notify other components about the change
    const event = new Event('app-storage-change');
    window.dispatchEvent(event);
  };
  
  // Handler for editing existing moments
  const handleEditMoment = (id: string, field: keyof Omit<Moment, 'id'>, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Get the current moment being edited
    const currentMoment = moments.find(moment => moment.id === id);
    if (!currentMoment) return;
    
    // Allow direct typing in the field
    if (value === '') {
      const updatedMoments = moments.map(moment => {
        if (moment.id === id) {
          return { ...moment, [field]: 0 };
        }
        return moment;
      });
      setMoments(updatedMoments);
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return;
    }
    
    let numValue = parseFloat(value) || 0;
    
    // Apply clamping for location value
    if (field === 'location') {
      // Clamp location between 0 and span
      numValue = Math.max(0, Math.min(span, numValue));
    }
    
    const updatedMoments = moments.map(moment => {
      if (moment.id === id) {
        return { ...moment, [field]: numValue };
      }
      return moment;
    });
    
    setMoments(updatedMoments);
    
    // Dispatch a custom event to notify other components about the change
    const event = new Event('app-storage-change');
    window.dispatchEvent(event);
  };
  
  // Handler for toggling includeSelfWeight for Full UDL
  const handleToggleSelfWeightFullUDL = () => {
    setFullUDL(prev => {
      const newFullUDL = {
        ...prev,
        includeSelfWeight: !prev.includeSelfWeight
      };
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      
      return newFullUDL;
    });
  };
  
  // Handler for editing FULL UDL values
  const handleEditFullUDL = (field: keyof FullUDL, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow direct typing in the field
    if (value === '') {
      const updatedFullUDL = { ...fullUDL, [field]: 0 };
      setFullUDL(updatedFullUDL);
      
      // Dispatch a custom event to notify other components about the change
      const event = new Event('app-storage-change');
      window.dispatchEvent(event);
      return;
    }
    
    const numValue = parseFloat(value) || 0;
    const updatedFullUDL = { ...fullUDL, [field]: numValue };
    
    setFullUDL(updatedFullUDL);
    
    // Dispatch a custom event to notify other components about the change
    const event = new Event('app-storage-change');
    window.dispatchEvent(event);
  };

  return (
    <Card className="mb-6 lg:col-span-2 bg-[var(--card)] text-[var(--text)] border-[color:var(--border)]">
      <CardHeader>
        <CardTitle className="text-xl">Loads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* FULL UDL Section */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Full UDL</h3>
          </div>
          <Table className="mb-4">
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--text)]">Tributary Width</TableHead>
                <TableHead className="text-[var(--text)]">Dead Load (G)</TableHead>
                <TableHead className="text-[var(--text)]">Live Load (Q)</TableHead>
                <TableHead className="text-[var(--text)]">Include Self Weight</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-0">
                <TableCell>
                  <InputWithUnit
                    value={fullUDL.tributaryWidth.toString()}
                    onChange={(e) => handleEditFullUDL('tributaryWidth', e)}
                    onFocus={(e) => e.target.value === "0" && e.target.select()}
                    unit="m"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <InputWithUnit
                    value={fullUDL.deadGkPa.toString()}
                    onChange={(e) => handleEditFullUDL('deadGkPa', e)}
                    onFocus={(e) => e.target.value === "0" && e.target.select()}
                    unit="kPa"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <InputWithUnit
                    value={fullUDL.liveQkPa.toString()}
                    onChange={(e) => handleEditFullUDL('liveQkPa', e)}
                    onFocus={(e) => e.target.value === "0" && e.target.select()}
                    unit="kPa"
                    className="w-full"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    checked={fullUDL.includeSelfWeight || false}
                    onChange={handleToggleSelfWeightFullUDL}
                    className="h-6 w-6 cursor-pointer accent-[var(--accent)]"
                  />
                </TableCell>
              </TableRow>
              <TableRow className="border-0">
                <TableCell>
                  <div className="font-medium text-[var(--text)]">Calculated UDL</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-[var(--text)]">
                    {(fullUDL.tributaryWidth * fullUDL.deadGkPa).toFixed(2)} kN/m
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-[var(--text)]">
                    {(fullUDL.tributaryWidth * fullUDL.liveQkPa).toFixed(2)} kN/m
                  </div>
                </TableCell>
                <TableCell>
                  {/* Empty cell to maintain table alignment */}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          {/* Divider */}
          <div className="border-t border-[color:var(--border)] mt-4 mb-6"></div>
          
          {/* UDL Table */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">Partial UDL</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--text)]">Start</TableHead>
                <TableHead className="text-[var(--text)]">Finish</TableHead>
                <TableHead className="text-[var(--text)]">Dead Load (G)</TableHead>
                <TableHead className="text-[var(--text)]">Live Load (Q)</TableHead>
                <TableHead className="text-left">
                  <button
                    className="border-[color:var(--accent)] text-[var(--text)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--card)] font-bold py-1 px-3 rounded text-sm"
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
                          
                          // Dispatch a custom event to notify other components about the change
                          const event = new Event('app-storage-change');
                          window.dispatchEvent(event);
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
          
          {/* Divider */}
          <div className="border-t border-[color:var(--border)] my-6"></div>
          
          {/* Point Loads Table */}
          <h3 className="text-lg font-medium mb-2">Point Loads</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--text)]">Location</TableHead>
                <TableHead className="text-[var(--text)]">Dead Load (G)</TableHead>
                <TableHead className="text-[var(--text)]">Live Load (Q)</TableHead>
                <TableHead className="text-left">
                  <button
                    className="border-[color:var(--accent)] text-[var(--text)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--card)] font-bold py-1 px-3 rounded text-sm"
                    onClick={addDefaultPointLoad}
                  >
                    Add
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pointLoads.length > 0 ? (
                pointLoads.map((load) => (
                  <TableRow key={load.id} className="border-0">
                    <TableCell>
                      <InputWithUnit
                        value={load.location.toString()}
                        onChange={(e) => handleEditPointLoad(load.id, 'location', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.pointG.toString()}
                        onChange={(e) => handleEditPointLoad(load.id, 'pointG', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kN"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={load.pointQ.toString()}
                        onChange={(e) => handleEditPointLoad(load.id, 'pointQ', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kN"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm"
                        onClick={() => {
                          const updatedLoads = pointLoads.filter(l => l.id !== load.id);
                          setPointLoads(updatedLoads);
                          
                          // Dispatch a custom event to notify other components about the change
                          const event = new Event('app-storage-change');
                          window.dispatchEvent(event);
                        }}
                      >
                        X
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-[var(--muted)]">
                    No point loads added yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Divider */}
          <div className="border-t border-[color:var(--border)] my-6"></div>
          
          {/* Moments Table */}
          <h3 className="text-lg font-medium mb-2">Moments</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[var(--text)]">Location</TableHead>
                <TableHead className="text-[var(--text)]">Dead Load (G)</TableHead>
                <TableHead className="text-[var(--text)]">Live Load (Q)</TableHead>
                <TableHead className="text-left">
                  <button
                    className="border-[color:var(--accent)] text-[var(--text)] bg-[var(--card)] hover:bg-[var(--accent)] hover:text-[var(--card)] font-bold py-1 px-3 rounded text-sm"
                    onClick={addDefaultMoment}
                  >
                    Add
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moments.length > 0 ? (
                moments.map((moment) => (
                  <TableRow key={moment.id} className="border-0">
                    <TableCell>
                      <InputWithUnit
                        value={moment.location.toString()}
                        onChange={(e) => handleEditMoment(moment.id, 'location', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="m"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={moment.momentG.toString()}
                        onChange={(e) => handleEditMoment(moment.id, 'momentG', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kNm"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <InputWithUnit
                        value={moment.momentQ.toString()}
                        onChange={(e) => handleEditMoment(moment.id, 'momentQ', e)}
                        onFocus={(e) => e.target.value === "0" && e.target.select()}
                        unit="kNm"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <button
                        className="bg-red-400 hover:bg-red-800 text-white font-bold py-1 px-3 rounded text-sm"
                        onClick={() => {
                          const updatedMoments = moments.filter(m => m.id !== moment.id);
                          setMoments(updatedMoments);
                          
                          // Dispatch a custom event to notify other components about the change
                          const event = new Event('app-storage-change');
                          window.dispatchEvent(event);
                        }}
                      >
                        X
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-[var(--muted)]">
                    No moments added yet
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