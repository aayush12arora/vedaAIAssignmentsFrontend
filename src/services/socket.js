import { io } from 'socket.io-client';
import store from '../store';
import {
  updateGenerationProgress,
  generateQuestionsSuccess,
  generateQuestionsFailure
} from '../store/slices/assignmentSlice';
import { setQuestionPaper, updateProgress } from '../store/slices/questionPaperSlice';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || window.location.origin || 'https://api.aayushdevcreations.in';

class SocketService {
  constructor() {
    this.socket = null;
    this.subscribedAssignments = new Set();
  }

  /**
   * Connect to socket server
   */
  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      
      // Re-subscribe to any assignments
      this.subscribedAssignments.forEach(assignmentId => {
        this.socket.emit('subscribe:assignment', assignmentId);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for generation events
    this.setupEventListeners();

    return this.socket;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Job status updates
    this.socket.on('job:status', (data) => {
      console.log('Job status:', data);
    });

    // Generation progress
    this.socket.on('generation:progress', (data) => {
      store.dispatch(updateGenerationProgress({
        progress: data.progress,
        message: data.message
      }));
      store.dispatch(updateProgress({
        current: data.progress,
        status: data.message
      }));
    });

    // Generation complete
    this.socket.on('generation:complete', (data) => {
      console.log('Generation complete:', data);
      
      store.dispatch(generateQuestionsSuccess({
        assignmentId: data.assignmentId,
        paperId: data.questionPaper.id
      }));
      
      store.dispatch(setQuestionPaper(data.questionPaper));
      
      toast.success('Question paper generated successfully!');
    });

    // Generation error
    this.socket.on('generation:error', (data) => {
      console.error('Generation error:', data);
      
      store.dispatch(generateQuestionsFailure(data.error));
      
      toast.error(`Generation failed: ${data.error}`);
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.subscribedAssignments.clear();
    }
  }

  /**
   * Subscribe to assignment updates
   * @param {string} assignmentId 
   */
  subscribeToAssignment(assignmentId) {
    this.subscribedAssignments.add(assignmentId);

    if (this.socket?.connected) {
      this.socket.emit('subscribe:assignment', assignmentId);
    }
  }

  /**
   * Unsubscribe from assignment updates
   * @param {string} assignmentId 
   */
  unsubscribeFromAssignment(assignmentId) {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:assignment', assignmentId);
      this.subscribedAssignments.delete(assignmentId);
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.socket?.connected || false;
  }

  onGenerationProgress(handler) {
    this.socket?.on('generation:progress', handler);
  }

  offGenerationProgress(handler) {
    this.socket?.off('generation:progress', handler);
  }

  onGenerationComplete(handler) {
    this.socket?.on('generation:complete', handler);
  }

  offGenerationComplete(handler) {
    this.socket?.off('generation:complete', handler);
  }

  onGenerationError(handler) {
    this.socket?.on('generation:error', handler);
  }

  offGenerationError(handler) {
    this.socket?.off('generation:error', handler);
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;
