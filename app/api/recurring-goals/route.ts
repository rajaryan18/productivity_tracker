import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
import { TimeSegment } from "@/lib/data/models";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = DatabaseFactory.getDatabase();
  try {
    const recurring = await db.getRecurringGoals(user.userId);
    return NextResponse.json(recurring);
  } catch (error) {
    console.error("Failed to fetch recurring goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = DatabaseFactory.getDatabase();
  try {
    const body = await request.json();
    const { text, segment, startDate, endDate, isAlwaysRecurring } = body;
    if (!text || !segment || !startDate) {
      return NextResponse.json({ error: "Text, segment, and startDate are required" }, { status: 400 });
    }
    // Check for existing recurring goal to ensure idempotency (especially for infinite ones)
    const existingRecurring = await db.getRecurringGoals(user.userId);
    const duplicate = existingRecurring.find(rg => 
      rg.text === text && 
      rg.segment === segment && 
      rg.isAlwaysRecurring === isAlwaysRecurring &&
      rg.startDate === startDate &&
      rg.endDate === endDate
    );
    
    if (duplicate) {
      return NextResponse.json(duplicate, { status: 200 });
    }

    const newRG = await db.addRecurringGoal(user.userId, text, segment as TimeSegment, startDate, endDate, isAlwaysRecurring);
    return NextResponse.json(newRG);
  } catch (error) {
    console.error("Failed to add recurring goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
