import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";
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

  const events = await db.getEventsByDate(user.userId, date);
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { date, title, description, startTime, endTime } = body;

    if (!date || !title) {
      return NextResponse.json({ error: "Date and title are required" }, { status: 400 });
    }

    const event = await db.addEvent(user.userId, { date, title, description, startTime, endTime });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
