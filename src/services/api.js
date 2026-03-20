import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.aayushdevcreations.in/api';
const ASSIGNMENT_CREATE_TIMEOUT_MS = Number(process.env.REACT_APP_ASSIGNMENT_CREATE_TIMEOUT_MS || 120000);

const getNow = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
};

const isAssignmentPostRequest = (config) => {
  const method = config?.method?.toLowerCase();
  const url = config?.url || '';

  return method === 'post' && url.startsWith('/assignments');
};

const logAssignmentPostTiming = (config, state) => {
  if (!isAssignmentPostRequest(config) || !config?.metadata?.startedAt) {
    return;
  }

  const duration = Math.round(getNow() - config.metadata.startedAt);
  console.log(
    `[assignment-api] ${state.toUpperCase()} ${config.method?.toUpperCase()} ${config.url} took ${duration}ms`
  );
};

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    config.metadata = {
      ...(config.metadata || {}),
      startedAt: getNow()
    };

    // Add any auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    logAssignmentPostTiming(response.config, 'success');
    return response;
  },
  (error) => {
    logAssignmentPostTiming(error.config, 'error');
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Assignment API
export const assignmentApi = {
  getAll: (params) => apiClient.get('/assignments', { params }),
  getById: (id) => apiClient.get(`/assignments/${id}`),
  create: (data) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return apiClient.post('/assignments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: ASSIGNMENT_CREATE_TIMEOUT_MS
      });
    }

    return apiClient.post('/assignments', data, {
      timeout: ASSIGNMENT_CREATE_TIMEOUT_MS
    });
  },
  update: (id, data) => apiClient.put(`/assignments/${id}`, data),
  delete: (id) => apiClient.delete(`/assignments/${id}`),
  generate: (id) => apiClient.post(`/assignments/${id}/generate`),
  regenerate: (id) => apiClient.post(`/assignments/${id}/regenerate`),
  getGenerationStatus: (assignmentId, jobId) => apiClient.get(`/assignments/${assignmentId}/job/${jobId}`),
  getQuestionPaper: (id) => apiClient.get(`/assignments/${id}/paper`),
  uploadFile: (id, formData) => apiClient.post(`/assignments/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// Question Paper API
export const questionPaperApi = {
  getAll: (params) => apiClient.get('/papers', { params }),
  getById: (id) => apiClient.get(`/papers/${id}`),
  getByAssignment: (assignmentId) => apiClient.get(`/assignments/${assignmentId}/paper`),
  update: (id, data) => apiClient.put(`/papers/${id}`, data),
  delete: (id) => apiClient.delete(`/papers/${id}`),
  regenerate: (id, params) => apiClient.post(`/papers/${id}/regenerate`, params),
  downloadPdf: (id) => apiClient.get(`/papers/${id}/pdf`, {
    responseType: 'blob'
  })
};

export default apiClient;
