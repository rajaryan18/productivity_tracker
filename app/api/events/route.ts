import { NextRequest, NextResponse } from "next/server";
import { DatabaseFactory } from "@/lib/data/DatabaseFactory";

const db = DatabaseFactory.getDatabase();

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  const events = await db.getEventsByDate(date);
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, title, description, startTime, endTime } = body;

    if (!date || !title) {
      return NextResponse.json({ error: "Date and title are required" }, { status: 400 });
    }

    const event = await db.addEvent({ date, title, description, startTime, endTime });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
