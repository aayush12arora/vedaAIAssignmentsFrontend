import { useEffect } from 'react';
import socketService from '../services/socket';

/**
 * Hook to manage socket connection and generation events
 */
export const useSocket = (assignmentId) => {
  useEffect(() => {
    if (!assignmentId) return;

    if (!socketService.isConnected()) {
      socketService.connect();
    }

    // Subscribe to assignment updates
    socketService.subscribeToAssignment(assignmentId);

    // Cleanup
    return () => {
      socketService.unsubscribeFromAssignment(assignmentId);
    };
  }, [assignmentId]);
};

export default useSocket;
