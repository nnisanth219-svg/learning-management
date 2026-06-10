export type TemplateFieldType = 'string' | 'number' | 'boolean' | 'timestamp' | 'reference';

export type TemplateField = {
  key: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  refTable?: string;
};

export type TemplateTable = {
  key: string;
  label: string;
  order: number;
  fields: TemplateField[];
};

export const appTemplate = {
  key: 'learning management',
  label: 'EduVantage LMS',
  tables: [
    {
      key: 'users',
      label: 'Users',
      order: 10,
      fields: [
        { key: 'displayName', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'role', label: 'Role', type: 'string', required: true },
        { key: 'createdAt', label: 'Created', type: 'timestamp', required: true },
        { key: 'updatedAt', label: 'Updated', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'students',
      label: 'Students',
      order: 20,
      fields: [
        { key: 'studentCode', label: 'Student ID', type: 'string', required: true },
        { key: 'authUid', label: 'Auth UID', type: 'string', required: false },
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'phone', label: 'Phone', type: 'string', required: false },
        { key: 'qualification', label: 'Qualification', type: 'string', required: false },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'progress', label: 'Progress', type: 'number', required: false },
      ],
    },
    {
      key: 'trainers',
      label: 'Trainers',
      order: 30,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'title', label: 'Title', type: 'string', required: true },
        { key: 'rating', label: 'Rating', type: 'number', required: false },
      ],
    },
    {
      key: 'courses',
      label: 'Courses',
      order: 40,
      fields: [
        { key: 'title', label: 'Title', type: 'string', required: true },
        { key: 'category', label: 'Category', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
        { key: 'trainerId', label: 'Trainer', type: 'reference', refTable: 'trainers', required: false },
      ],
    },
    {
      key: 'certificates',
      label: 'Certificates',
      order: 50,
      fields: [
        { key: 'title', label: 'Title', type: 'string', required: true },
        { key: 'studentId', label: 'Student', type: 'reference', refTable: 'students', required: true },
        { key: 'issuedAt', label: 'Issued', type: 'timestamp', required: true },
      ],
    },
    {
      key: 'enrollment_requests',
      label: 'Enrollment Requests',
      order: 55,
      fields: [
        { key: 'fullName', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'phone', label: 'Phone', type: 'string', required: true },
        { key: 'courseId', label: 'Course', type: 'reference', refTable: 'courses', required: true },
        { key: 'qualification', label: 'Qualification', type: 'string', required: false },
        { key: 'status', label: 'Status', type: 'string', required: true },
      ],
    },
    {
      key: 'enrollments',
      label: 'Enrollments',
      order: 56,
      fields: [
        { key: 'studentId', label: 'Student', type: 'reference', refTable: 'students', required: true },
        { key: 'courseId', label: 'Course', type: 'reference', refTable: 'courses', required: true },
        { key: 'progress', label: 'Progress', type: 'number', required: false },
      ],
    },
    {
      key: 'newsletter_subscribers',
      label: 'Newsletter',
      order: 58,
      fields: [
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'name', label: 'Name', type: 'string', required: false },
      ],
    },
    {
      key: 'contact_inquiries',
      label: 'Contact Inquiries',
      order: 59,
      fields: [
        { key: 'name', label: 'Name', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: true },
        { key: 'subject', label: 'Subject', type: 'string', required: false },
        { key: 'message', label: 'Message', type: 'string', required: true },
        { key: 'status', label: 'Status', type: 'string', required: true },
      ],
    },
    {
      key: 'notifications',
      label: 'Notifications',
      order: 60,
      fields: [
        { key: 'title', label: 'Title', type: 'string', required: true },
        { key: 'type', label: 'Type', type: 'string', required: true },
        { key: 'read', label: 'Read', type: 'boolean', required: true },
      ],
    },
    {
      key: 'app_settings',
      label: 'Settings',
      order: 70,
      fields: [
        { key: 'platformName', label: 'Platform Name', type: 'string', required: true },
        { key: 'supportEmail', label: 'Support Email', type: 'string', required: true },
      ],
    },
  ],
} as const;
