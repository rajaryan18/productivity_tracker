import mongoose from "mongoose";
import { IDatabase } from "./IDatabase";
import { Goal, Event, TimeSegment, RecurringGoal, User } from "./models";

// MongoDB schemas
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const GoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  segment: { type: String, required: true },
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  classification: { type: String, enum: ["productive", "waste", "none"], default: "none" },
  createdAt: { type: Date, default: Date.now },
});

const RecurringGoalSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  text: { type: String, required: true },
  segment: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: String,
  isAlwaysRecurring: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const EventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  startTime: String,
  endTime: String,
  createdAt: { type: Date, default: Date.now },
});

// Models
const UserModel = mongoose.models.User || mongoose.model("User", UserSchema);
const GoalModel = mongoose.models.Goal || mongoose.model("Goal", GoalSchema);
const RecurringGoalModel = mongoose.models.RecurringGoal || mongoose.model("RecurringGoal", RecurringGoalSchema);
const EventModel = mongoose.models.Event || mongoose.model("Event", EventSchema);

export class MongoDatabase implements IDatabase {
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect() {
    if (this.isConnected) return;

    const username = process.env.MONGODB_USERNAME;
    const password = process.env.MONGODB_PASSWORD;
    const dbname = process.env.MONGODB_DBNAME;
    const host = process.env.MONGODB_HOST;

    if (!username || !password || !dbname || !host) {
      console.error("Missing MongoDB environment variables");
      return;
    }

    const uri = `mongodb+srv://${username}:${password}@${host}/${dbname}?retryWrites=true&w=majority`;

    try {
      await mongoose.connect(uri);
      this.isConnected = true;
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
    }
  }

  private ensureConnected() {
    if (!this.isConnected) {
      return this.connect();
    }
    return Promise.resolve();
  }

  // User Methods
  async addUser(userData: Omit<User, "id">): Promise<User> {
    await this.ensureConnected();
    const newUser = await UserModel.create(userData);
    return {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt.toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureConnected();
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return {
      ...user,
      id: (user as any)._id.toString(),
      createdAt: (user as any).createdAt.toISOString(),
    };
  }

  async getUserById(id: string): Promise<User | null> {
    await this.ensureConnected();
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return {
      ...user,
      id: (user as any)._id.toString(),
      createdAt: (user as any).createdAt.toISOString(),
    };
  }

  // Goals Methods
  async getGoalsByDate(userId: string, date: string): Promise<Goal[]> {
    await this.ensureConnected();
    const goals = await GoalModel.find({ userId, date }).lean();
    return goals.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      createdAt: g.createdAt.toISOString(),
    }));
  }

  async getGoalsByDateRange(userId: string, startDate: string, endDate: string): Promise<Goal[]> {
    await this.ensureConnected();
    const goals = await GoalModel.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).lean();
    return goals.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      createdAt: g.createdAt.toISOString(),
    }));
  }

  async addGoal(userId: string, date: string, segment: TimeSegment, text: string): Promise<Goal> {
    await this.ensureConnected();
    const newGoal = await GoalModel.create({ userId, date, segment, text });
    return {
      id: newGoal._id.toString(),
      userId,
      date,
      segment,
      text,
      isCompleted: newGoal.isCompleted,
      createdAt: newGoal.createdAt.toISOString(),
    };
  }

  async updateGoal(id: string, updates: Partial<Pick<Goal, "text" | "isCompleted" | "segment" | "classification">>): Promise<Goal | null> {
    await this.ensureConnected();
    const updatedGoal = await GoalModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!updatedGoal) return null;
    return {
      ...updatedGoal,
      id: updatedGoal._id.toString(),
      createdAt: updatedGoal.createdAt.toISOString(),
    };
  }

  async deleteGoal(id: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await GoalModel.findByIdAndDelete(id);
    return !!result;
  }

  // Recurring Goals Methods
  async getRecurringGoals(userId: string): Promise<RecurringGoal[]> {
    await this.ensureConnected();
    const recurring = await RecurringGoalModel.find({ userId }).lean();
    return recurring.map((rg: any) => ({
      ...rg,
      id: rg._id.toString(),
      createdAt: rg.createdAt.toISOString(),
    }));
  }

  async addRecurringGoal(userId: string, text: string, segment: TimeSegment, startDate: string, endDate?: string, isAlwaysRecurring: boolean = false): Promise<RecurringGoal> {
    await this.ensureConnected();
    const newRG = await RecurringGoalModel.create({ userId, text, segment, startDate, endDate, isAlwaysRecurring });

    // If endDate is set, pre-populate Goal collection
    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const promises = [];
      let curr = new Date(start);
      while (curr <= end) {
        const dateStr = curr.toISOString().split('T')[0];
        promises.push(GoalModel.create({ userId, date: dateStr, segment, text }));
        curr.setDate(curr.getDate() + 1);
      }
      await Promise.all(promises);
    }

    return {
      id: newRG._id.toString(),
      userId,
      text: newRG.text,
      segment: newRG.segment,
      startDate: newRG.startDate,
      endDate: newRG.endDate,
      isAlwaysRecurring: newRG.isAlwaysRecurring,
      createdAt: newRG.createdAt.toISOString(),
    };
  }

  async deleteRecurringGoal(id: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await RecurringGoalModel.findByIdAndDelete(id);
    return !!result;
  }

  // Events Methods
  async getEventsByDate(userId: string, date: string): Promise<Event[]> {
    await this.ensureConnected();
    const events = await EventModel.find({ userId, date }).lean();
    return events.map((e: any) => ({
      ...e,
      id: e._id.toString(),
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async addEvent(userId: string, eventData: Omit<Event, "id" | "userId" | "createdAt">): Promise<Event> {
    await this.ensureConnected();
    const newEvent = await EventModel.create({ ...eventData, userId });
    return {
      ...newEvent.toObject(),
      id: newEvent._id.toString(),
      userId,
      createdAt: newEvent.createdAt.toISOString(),
    };
  }

  async updateEvent(id: string, eventData: Partial<Event>): Promise<Event | null> {
    await this.ensureConnected();
    const updatedEvent = await EventModel.findByIdAndUpdate(id, eventData, { new: true }).lean();
    if (!updatedEvent) return null;
    return {
      ...updatedEvent,
      id: updatedEvent._id.toString(),
      createdAt: updatedEvent.createdAt.toISOString(),
    };
  }

  async deleteEvent(id: string): Promise<boolean> {
    await this.ensureConnected();
    const result = await EventModel.findByIdAndDelete(id);
    return !!result;
  }
}
