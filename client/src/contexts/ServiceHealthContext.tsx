import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchServiceHealth, ServiceHealth } from '../services/health';

interface ServiceHealthContextType {
  health: ServiceHealth | null; // null: 조회 중
}

const ServiceHealthContext = createContext<ServiceHealthContextType>({ health: null });

// 앱 진입 시 /health와 /notices를 한 번씩 조회한다
export const ServiceHealthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [health, setHealth] = useState<ServiceHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchServiceHealth().then(result => {
      if (!cancelled) setHealth(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ServiceHealthContext.Provider value={{ health }}>
      {children}
    </ServiceHealthContext.Provider>
  );
};

export const useServiceHealth = (): ServiceHealthContextType => useContext(ServiceHealthContext);
