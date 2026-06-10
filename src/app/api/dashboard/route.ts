import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import {
  getCategoryPieData,
  getCourseRatingAverage,
  getCourseStatusPieData,
  getDashboardStats,
  getRevenueChartData,
  getTopTrainers,
} from '@/lib/firestore/dashboard-stats';
import { apiError } from '@/lib/http/api-error';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  try {
    const ownerId = session.workspaceOwnerId;
    const [stats, revenue, categoryPie, courseStatusPie, trainers, avgRating] = await Promise.all([
      getDashboardStats(ownerId),
      getRevenueChartData(ownerId),
      getCategoryPieData(ownerId),
      getCourseStatusPieData(ownerId),
      getTopTrainers(ownerId),
      getCourseRatingAverage(ownerId),
    ]);

    return NextResponse.json({
      stats,
      charts: { revenue, categoryPie, courseStatusPie },
      trainers,
      avgRating,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load dashboard.', 500);
  }
}
