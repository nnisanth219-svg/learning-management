export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended';
export type EnrollmentStatus = 'new' | 'pending' | 'approved' | 'rejected';

export type PlatformUserRole = 'admin' | 'student';

export interface PlatformUser {
  id: string;
  authUid: string;
  displayName: string;
  email: string;
  role: PlatformUserRole;
  studentId?: string;
  studentCode?: string;
  lastLoginAt: string;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorAvatar: string;
  image: string;
  duration: string;
  difficulty: Difficulty;
  rating: number;
  reviews: number;
  enrollments: number;
  price: number;
  modules: number;
  lessons: number;
  status: CourseStatus;
  featured?: boolean;
  trainerId?: string;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string;
  experience: string;
  courses: number;
  students: number;
  rating: number;
  skills: string[];
  certifications: string[];
  social: { linkedin?: string; twitter?: string; website?: string };
  availability: 'available' | 'limited' | 'unavailable';
  active?: boolean;
}

export interface Student {
  id: string;
  studentCode?: string;
  authUid?: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  avatar: string;
  status: StudentStatus;
  enrolledCourses: number;
  completedCourses: number;
  progress: number;
  attendance: number;
  joinedAt: string;
  lastActive: string;
  certificates: number;
  courseIds?: string[];
}

export interface EnrollmentRequest {
  id: string;
  studentId?: string;
  studentCode?: string;
  authUid?: string;
  courseId: string;
  courseName: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  notes?: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
}

export interface Certification {
  id: string;
  title: string;
  description: string;
  issuer: string;
  duration: string;
  enrolled: number;
  image: string;
  skills: string[];
}

export interface IssuedCertificate {
  id: string;
  publicCode: string;
  holderName: string;
  programTitle: string;
  studentId?: string;
  courseId?: string;
  issuedAt: string;
  status: 'active' | 'revoked';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  text: string;
  course: string;
  featured?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  trainers: number;
  courses: number;
  revenue: number;
  enrollments: number;
  certificatesIssued: number;
  pendingApprovals: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'enrollment' | 'alert' | 'course' | 'certificate' | 'system';
  read: boolean;
  createdAt: string;
}

export interface LearningProgress {
  id: string;
  studentId?: string;
  courseId?: string;
  studentName: string;
  studentAvatar: string;
  courseName: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string;
  performance: number;
  enrollmentStatus?: EnrollmentStatus;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  name: string;
  email: string;
  phone?: string;
  qualification?: string;
  status: StudentStatus;
  joinedAt: string;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  enrollments: EnrollmentRequest[];
  courses: Course[];
  progress: LearningProgress[];
  certificates: IssuedCertificate[];
}
