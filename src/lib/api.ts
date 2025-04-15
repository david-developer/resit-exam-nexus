
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api', // Assuming your API is hosted on the same domain
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      
      // Check if unauthorized (token expired or invalid)
      if (status === 401) {
        // Clear token
        localStorage.removeItem('token');
        // Redirect to login
        window.location.href = '/login';
        toast({
          title: "Session expired",
          description: "Please log in again to continue.",
          variant: "destructive",
        });
      } else if (status === 403) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this resource.",
          variant: "destructive",
        });
      } else {
        // Generic error handling
        const message = error.response.data?.message || "Something went wrong";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      toast({
        title: "Request Error",
        description: error.message,
        variant: "destructive",
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
};

// Student API
export const studentAPI = {
  getGrades: async () => {
    const response = await api.get('/my-grades');
    return response.data;
  },
  getResitExams: async () => {
    const response = await api.get('/my-resit-exams');
    return response.data;
  },
  declareResit: async (courseId: string) => {
    const response = await api.post('/declare-resit', { courseId });
    return response.data;
  },
  getSchedule: async (filename: string) => {
    const response = await api.get(`/schedule/${filename}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Instructor API
export const instructorAPI = {
  getResitStats: async () => {
    const response = await api.get('/resit-stats');
    return response.data;
  },
  submitGrade: async (data: { courseId: string, studentId: string, grade: number }) => {
    const response = await api.post('/submit-grade', data);
    return response.data;
  },
  updateResitDetails: async (data: any) => {
    const response = await api.post('/resit-details', data);
    return response.data;
  },
  getResitParticipants: async (courseId: string) => {
    const response = await api.get(`/resit-registrations/${courseId}`);
    return response.data;
  }
};

// Secretary API
export const secretaryAPI = {
  uploadSchedule: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload-schedule', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  getScheduleFiles: async () => {
    const response = await api.get('/schedules');
    return response.data;
  }
};

export default api;
