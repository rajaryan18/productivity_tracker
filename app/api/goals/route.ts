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

  const goals = await db.getGoalsByDate(user.userId, date);
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, segment, text } = body;

    if (!date || !segment || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing goal to ensure idempotency
    const existingGoals = await db.getGoalsByDate(user.userId, date);
    const duplicate = existingGoals.find(g => g.text === text && g.segment === segment);
    if (duplicate) {
      return NextResponse.json(duplicate, { status: 200 });
    }

    const goal = await db.addGoal(user.userId, date, segment as TimeSegment, text);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, text, isCompleted, segment, classification } = body;
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Note: Ideally we should verify that this goal belongs to the user
    // For now, updateGoal just takes id.
    const updatedGoal = await db.updateGoal(id, { text, isCompleted, segment, classification });
    if (!updatedGoal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const deleted = await db.deleteGoal(id);
    if (!deleted) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
