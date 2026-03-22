import { Goal, Event, TimeSegment, RecurringGoal, User } from "./models";
import { IDatabase } from "./IDatabase";

export class MockDatabase implements IDatabase {
  private users: User[] = [];
  private goals: Goal[] = [];
  private events: Event[] = [];
  private recurringGoals: RecurringGoal[] = [];

  constructor() {
    console.log("MockDatabase initialized");
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  // Users Methods
  async addUser(userData: Omit<User, "id">): Promise<User> {
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  // Goals Methods
  async getGoalsByDate(userId: string, date: string): Promise<Goal[]> {
    return this.goals.filter((goal) => goal.userId === userId && goal.date === date);
  }

  async getGoalsByDateRange(userId: string, startDate: string, endDate: string): Promise<Goal[]> {
    return this.goals.filter((goal) => 
      goal.userId === userId && goal.date >= startDate && goal.date <= endDate
    );
  }

  async addGoal(userId: string, date: string, segment: TimeSegment, text: string): Promise<Goal> {
    const newGoal: Goal = {
      id: this.generateId(),
      userId,
      date,
      segment,
      text,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Pick<Goal, "text" | "isCompleted" | "segment" | "classification">>): Promise<Goal | null> {
    const goalIndex = this.goals.findIndex((goal) => goal.id === id);
    if (goalIndex === -1) return null;

    // Filter out undefined values to avoid overwriting existing fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    ) as Partial<Goal>;

    this.goals[goalIndex] = { ...this.goals[goalIndex], ...filteredUpdates };
    return this.goals[goalIndex];
  }

  async deleteGoal(id: string): Promise<boolean> {
    this.goals = this.goals.filter((g) => g.id !== id);
    return true;
  }

  // Recurring Goals
  async getRecurringGoals(userId: string): Promise<RecurringGoal[]> {
    return this.recurringGoals.filter((rg) => rg.userId === userId);
  }

  async addRecurringGoal(userId: string, text: string, segment: TimeSegment, startDate: string, endDate?: string, isAlwaysRecurring: boolean = false): Promise<RecurringGoal> {
    const newRG: RecurringGoal = {
      id: this.generateId(),
      userId,
      text,
      segment,
      startDate,
      endDate,
      isAlwaysRecurring,
      createdAt: new Date().toISOString(),
    };
    this.recurringGoals.push(newRG);
    return newRG;
  }

  async deleteRecurringGoal(id: string): Promise<boolean> {
    this.recurringGoals = this.recurringGoals.filter((rg) => rg.id !== id);
    return true;
  }

  // Events Methods
  async getEventsByDate(userId: string, date: string): Promise<Event[]> {
    return this.events.filter((event) => event.userId === userId && event.date === date);
  }

  async addEvent(userId: string, eventData: Omit<Event, "id" | "userId" | "createdAt">): Promise<Event> {
    const newEvent: Event = {
      ...eventData,
      id: this.generateId(),
      userId,
      createdAt: new Date().toISOString(),
    };
    this.events.push(newEvent);
    return newEvent;
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null> {
    const eventIndex = this.events.findIndex((event) => event.id === id);
    if (eventIndex === -1) return null;

    this.events[eventIndex] = { ...this.events[eventIndex], ...eventData };
    return this.events[eventIndex];
  }

  async deleteEvent(id: string): Promise<boolean> {
    const initialLength = this.events.length;
    this.events = this.events.filter((event) => event.id !== id);
    return this.events.length < initialLength;
  }
}
