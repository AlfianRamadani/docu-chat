'use client';
import { createContext, useEffect, useState } from 'react';
import GenerateSessionId from '../../utils/GenerateSessionId';

type SessionContextType = {
  sessionId: string;
  isLoading: boolean;
  getSessionId: () => Promise<string>;
};

const SessionContext = createContext<SessionContextType | null>(null);

function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getSessionId = async () => {
    const generatedSessionId = await GenerateSessionId();
    localStorage.setItem('sessionId', generatedSessionId);
    setSessionId(generatedSessionId);
    return generatedSessionId;
  };
  useEffect(() => {
    setIsLoading(true);
    const sessionIdLocalStorage = localStorage.getItem('sessionId');
    setSessionId(sessionIdLocalStorage || '');
    setIsLoading(false);
  }, []);
  if (isLoading) return <p>Loading...</p>;
  const value = { sessionId, getSessionId, isLoading };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export { SessionContext, SessionProvider };
