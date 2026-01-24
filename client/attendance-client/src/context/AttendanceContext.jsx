import { createContext, useState } from 'react';

export const AttendanceContext = createContext();

export function AttendanceProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <AttendanceContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </AttendanceContext.Provider>
  );
}