import { Goal, Event, TimeSegment, RecurringGoal, User } from "./models";

export interface IDatabase {
  // Users
  addUser(userData: Omit<User, "id">): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // Goals
  getGoalsByDate(userId: string, date: string): Promise<Goal[]>;
  getGoalsByDateRange(userId: string, startDate: string, endDate: string): Promise<Goal[]>;
  addGoal(userId: string, date: string, segment: TimeSegment, text: string): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Pick<Goal, "text" | "isCompleted" | "segment" | "classification">>): Promise<Goal | null>;
  deleteGoal(id: string): Promise<boolean>;

  // Recurring Goals
  getRecurringGoals(userId: string): Promise<RecurringGoal[]>;
  addRecurringGoal(userId: string, text: string, segment: TimeSegment, startDate: string, endDate?: string, isAlwaysRecurring?: boolean): Promise<RecurringGoal>;
  deleteRecurringGoal(id: string): Promise<boolean>;

  // Events
  getEventsByDate(userId: string, date: string): Promise<Event[]>;
  addEvent(userId: string, eventData: Omit<Event, "id" | "userId" | "createdAt">): Promise<Event>;
  updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null>;
  deleteEvent(id: string): Promise<boolean>;
}
