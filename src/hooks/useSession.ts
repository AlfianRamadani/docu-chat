import { SessionContext } from '@/context/SessionContext';
import { useContext } from 'react';

export default function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('context must be used in top level');
  }
  return context;
}
