import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
import { TimeSegment } from "@/lib/data/models";
import { getAuthUser } from "@/lib/auth";

const db = DatabaseFactory.getDatabase();

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  // Simplified analytics: Just get goals for the day and aggregate statuses.
  const goals = await db.getGoalsByDate(user.userId, date);
  
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.isCompleted).length;
  const completionRate = totalGoals ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const SEGMENTS: TimeSegment[] = [
    "Before breakfast",
    "Before lunch",
    "Before gym",
    "Before dinner",
    "Before sleep",
  ];

  const segmentBreakdown = SEGMENTS.map(s => {
    const segmentGoals = goals.filter(g => g.segment === s);
    return {
      segment: s,
      total: segmentGoals.length,
      completed: segmentGoals.filter(g => g.isCompleted).length,
      pending: segmentGoals.filter(g => !g.isCompleted).length
    };
  });

  return NextResponse.json({
    date,
    totalGoals,
    completedGoals,
    completionRate,
    segmentBreakdown: Object.values(segmentBreakdown)
  });
}
