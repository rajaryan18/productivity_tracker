import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
import { TimeSegment } from "@/lib/data/models";

const db = DatabaseFactory.getDatabase();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  const goals = await db.getGoalsByDate(date);
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, segment, text } = body;

    if (!date || !segment || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const goal = await db.addGoal(date, segment as TimeSegment, text);
    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, text, isCompleted, segment, classification } = body;
    console.log("PUT request body:", body);
    
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    console.log("Updating goal with:", { text, isCompleted, segment, classification });
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
