import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
import { GoalClassification, TimeSegment } from "@/lib/data/models";
import { getAuthUser } from "@/lib/auth";

const SEGMENTS: TimeSegment[] = [
  "Before breakfast",
  "Before lunch",
  "Before gym",
  "Before dinner",
  "Before sleep",
];

export async function GET(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // 'daily' or 'weekly'
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const db = DatabaseFactory.getDatabase();

  try {
    if (type === "daily") {
      if (!date) return NextResponse.json({ error: "Date is required for daily insights" }, { status: 400 });
      
      const goals = await db.getGoalsByDate(user.userId, date);
      
      const segmentData = SEGMENTS.map(segment => {
        const segmentGoals = goals.filter(g => g.segment === segment && g.isCompleted);
        return {
          name: segment,
          productive: segmentGoals.filter(g => g.classification === "productive").length,
          waste: segmentGoals.filter(g => g.classification === "waste").length,
          none: segmentGoals.filter(g => !g.classification || g.classification === "none").length,
        };
      });

      return NextResponse.json(segmentData);
    } 
    
    if (type === "weekly") {
      if (!startDate || !endDate) return NextResponse.json({ error: "startDate and endDate are required for weekly insights" }, { status: 400 });

      const goals = await db.getGoalsByDateRange(user.userId, startDate, endDate);
      
      // Get all unique dates in the range
      const dates: string[] = [];
      let curr = new Date(startDate);
      const last = new Date(endDate);
      while(curr <= last) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }

      const dailyData = dates.map(d => {
        const dayGoals = goals.filter(g => g.date === d && g.isCompleted);
        return {
          date: d,
          productive: dayGoals.filter(g => g.classification === "productive").length,
          waste: dayGoals.filter(g => g.classification === "waste").length,
          none: dayGoals.filter(g => !g.classification || g.classification === "none").length,
        };
      });

      return NextResponse.json(dailyData);
    }

    return NextResponse.json({ error: "Invalid insight type" }, { status: 400 });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
