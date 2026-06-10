export const MARKETING_NAV = [
  { href: '/', label: 'Home' },
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export const ADMIN_NAV = [
  { href: '/dashboard', label: 'Overview', icon: 'layout' },
  { href: '/dashboard/students', label: 'People', icon: 'users' },
  { href: '/dashboard/enrollments', label: 'Enrollments', icon: 'enroll' },
  { href: '/dashboard/courses', label: 'Courses', icon: 'book' },
  { href: '/dashboard/reports', label: 'Analytics', icon: 'bar' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'settings' },
] as const;

/** Routes that belong to each dashboard section (for active nav highlighting) */
export const ADMIN_SECTION_ROUTES: Record<string, string[]> = {
  '/dashboard/students': ['/dashboard/students', '/dashboard/trainers'],
  '/dashboard/enrollments': ['/dashboard/enrollments'],
  '/dashboard/courses': ['/dashboard/courses', '/dashboard/progress', '/dashboard/certificates'],
  '/dashboard/settings': ['/dashboard/settings', '/dashboard/notifications'],
};
