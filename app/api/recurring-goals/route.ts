import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
import { TimeSegment } from "@/lib/data/models";

export async function GET() {
  const db = DatabaseFactory.getDatabase();
  try {
    const recurring = await db.getRecurringGoals();
    return NextResponse.json(recurring);
  } catch (error) {
    console.error("Failed to fetch recurring goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const db = DatabaseFactory.getDatabase();
  try {
    const body = await request.json();
    const { text, segment, startDate, endDate, isAlwaysRecurring } = body;
    if (!text || !segment || !startDate) {
      return NextResponse.json({ error: "Text, segment, and startDate are required" }, { status: 400 });
    }
    const newRG = await db.addRecurringGoal(text, segment as TimeSegment, startDate, endDate, isAlwaysRecurring);
    return NextResponse.json(newRG);
  } catch (error) {
    console.error("Failed to add recurring goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const db = DatabaseFactory.getDatabase();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const success = await db.deleteRecurringGoal(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("Failed to delete recurring goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
