export type TimeSegment =
  | "Before breakfast"
  | "Before lunch"
  | "Before gym"
  | "Before dinner"
  | "Before sleep";

export type GoalClassification = "productive" | "waste" | "none";

export interface Goal {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  segment: TimeSegment;
  text: string;
  isCompleted: boolean;
  classification?: GoalClassification;
  createdAt: string; // ISO timestamp
}

export interface Event {
  id: string;
  date: string; // ISO format YYYY-MM-DD
  title: string;
  description?: string;
  startTime?: string; // HH:mm format
  endTime?: string;   // HH:mm format
  createdAt: string; // ISO timestamp
}

export interface RecurringGoal {
  id: string;
  text: string;
  segment: TimeSegment;
  startDate: string; // ISO date
  endDate?: string;  // ISO date
  isAlwaysRecurring: boolean;
  createdAt: string;
}
