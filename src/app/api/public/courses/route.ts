import { NextRequest, NextResponse } from 'next/server';
import { listPublishedCourses } from '@/lib/firestore/courses';
import { apiError } from '@/lib/http/api-error';

export async function GET(request: NextRequest) {
  try {
    const courses = await listPublishedCourses();
    const category = request.nextUrl.searchParams.get('category');
    const featured = request.nextUrl.searchParams.get('featured') === 'true';
    let filtered = courses;
    if (category) filtered = filtered.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    if (featured) filtered = filtered.filter((c) => c.featured);
    return NextResponse.json({ courses: filtered, total: filtered.length, page: 1 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load courses.', 500);
  }
}
