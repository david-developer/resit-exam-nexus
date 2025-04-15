
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

// Mock users for testing
const mockUsers = {
  student: {
    id: 'student-1',
    name: 'John Student',
    email: 'student@university.edu',
    role: 'student' as 'student'
  },
  instructor: {
    id: 'instructor-1',
    name: 'Jane Instructor',
    email: 'instructor@university.edu',
    role: 'instructor' as 'instructor'
  },
  secretary: {
    id: 'secretary-1',
    name: 'Alex Secretary',
    email: 'secretary@university.edu',
    role: 'secretary' as 'secretary'
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    console.log('Mock login with:', email);
    
    // Simple logic to return mock user based on email
    if (email.includes('student')) {
      return { 
        user: mockUsers.student, 
        token: 'mock-student-token' 
      };
    } else if (email.includes('instructor')) {
      return { 
        user: mockUsers.instructor, 
        token: 'mock-instructor-token'
      };
    } else if (email.includes('secretary')) {
      return { 
        user: mockUsers.secretary, 
        token: 'mock-secretary-token'
      };
    }
    
    // If no match, throw error to simulate failed login
    throw new Error('Invalid email or password');
  },
};

// Student API
export const studentAPI = {
  getGrades: async () => {
    return [
      { id: 'course1', courseName: 'Mathematics', grade: 78 },
      { id: 'course2', courseName: 'Physics', grade: 65 },
      { id: 'course3', courseName: 'Computer Science', grade: 92 },
      { id: 'course4', courseName: 'Chemistry', grade: 45 },
      { id: 'course5', courseName: 'History', grade: 81 }
    ];
  },
  getResitExams: async () => {
    return [
      { id: 'resit1', courseName: 'Chemistry', examDate: '2025-05-15', location: 'Room A101' },
      { id: 'resit2', courseName: 'Physics', examDate: '2025-05-20', location: 'Room B203' }
    ];
  },
  declareResit: async (courseId: string) => {
    return { success: true, message: 'Resit declared successfully' };
  },
  getSchedule: async (filename: string) => {
    // Mock blob response - in a real app, this would be a file
    return new Blob(['Mock exam schedule data'], { type: 'application/pdf' });
  }
};

// Instructor API
export const instructorAPI = {
  getResitStats: async () => {
    return {
      totalResits: 24,
      coursesWithResits: 5,
      studentsRegistered: 18,
      averageScore: 45,
      // Add these missing properties that are used in the dashboard
      courses: [
        {
          id: 'course1',
          name: 'Advanced Mathematics',
          code: 'MATH401',
          totalStudents: 45,
          passRate: 78,
          resitRegistered: 8,
          gradeSubmissionDeadline: '2025-05-20'
        },
        {
          id: 'course2',
          name: 'Quantum Physics',
          code: 'PHYS302',
          totalStudents: 32,
          passRate: 65,
          resitRegistered: 10,
          gradeSubmissionDeadline: '2025-05-25'
        },
        {
          id: 'course3',
          name: 'Data Structures',
          code: 'CS201',
          totalStudents: 58,
          passRate: 82,
          resitRegistered: 6,
          gradeSubmissionDeadline: '2025-05-15'
        }
      ],
      coursePerformance: [
        { term: 'Fall 2023', avgGrade: 75, passRate: 82 },
        { term: 'Spring 2024', avgGrade: 72, passRate: 79 },
        { term: 'Fall 2024', avgGrade: 68, passRate: 73 },
        { term: 'Spring 2025', avgGrade: 71, passRate: 76 }
      ]
    };
  },
  submitGrade: async (data: { courseId: string, studentId: string, grade: number }) => {
    return { success: true, message: 'Grade submitted successfully' };
  },
  updateResitDetails: async (data: any) => {
    return { success: true, message: 'Resit details updated successfully' };
  },
  getResitParticipants: async (courseId: string) => {
    return [
      { id: 'student1', name: 'Alice Johnson', email: 'alice@university.edu', grade: 48 },
      { id: 'student2', name: 'Bob Smith', email: 'bob@university.edu', grade: 42 },
      { id: 'student3', name: 'Charlie Brown', email: 'charlie@university.edu', grade: 50 }
    ];
  }
};

// Secretary API
export const secretaryAPI = {
  uploadSchedule: async (file: File) => {
    return { success: true, message: 'Schedule uploaded successfully', filename: 'spring_2025.pdf' };
  },
  getScheduleFiles: async () => {
    return [
      { id: 'file1', name: 'Fall 2024 Exam Schedule', filename: 'fall_2024.pdf', uploadDate: '2024-08-15' },
      { id: 'file2', name: 'Spring 2025 Exam Schedule', filename: 'spring_2025.pdf', uploadDate: '2024-12-20' }
    ];
  }
};

export default api;
