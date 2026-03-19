import { Goal, Event, TimeSegment, RecurringGoal } from "./models";

export interface IDatabase {
  // Goals
  getGoalsByDate(date: string): Promise<Goal[]>;
  getGoalsByDateRange(startDate: string, endDate: string): Promise<Goal[]>;
  addGoal(date: string, segment: TimeSegment, text: string): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Pick<Goal, "text" | "isCompleted" | "segment" | "classification">>): Promise<Goal | null>;
  deleteGoal(id: string): Promise<boolean>;

  // Recurring Goals
  getRecurringGoals(): Promise<RecurringGoal[]>;
  addRecurringGoal(text: string, segment: TimeSegment, startDate: string, endDate?: string, isAlwaysRecurring?: boolean): Promise<RecurringGoal>;
  deleteRecurringGoal(id: string): Promise<boolean>;

  // Events
  getEventsByDate(date: string): Promise<Event[]>;
  addEvent(eventData: Omit<Event, "id" | "createdAt">): Promise<Event>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;
}
