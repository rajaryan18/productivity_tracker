import mongoose from "mongoose";
import { IDatabase } from "./IDatabase";
import { Goal, Event, TimeSegment, RecurringGoal } from "./models";

// MongoDB schemas
const GoalSchema = new mongoose.Schema({
  date: { type: String, required: true },
  segment: { type: String, required: true },
  text: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  classification: { type: String, enum: ["productive", "waste", "none"], default: "none" },
  createdAt: { type: Date, default: Date.now },
});

const RecurringGoalSchema = new mongoose.Schema({
  text: { type: String, required: true },
  segment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EventSchema = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  startTime: String,
  endTime: String,
  createdAt: { type: Date, default: Date.now },
});

// Models
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

  // Goals Methods
  async getGoalsByDate(date: string): Promise<Goal[]> {
    await this.ensureConnected();
    const goals = await GoalModel.find({ date }).lean();
    return goals.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      createdAt: g.createdAt.toISOString(),
    }));
  }

  async getGoalsByDateRange(startDate: string, endDate: string): Promise<Goal[]> {
    await this.ensureConnected();
    const goals = await GoalModel.find({ 
      date: { $gte: startDate, $lte: endDate } 
    }).lean();
    return goals.map((g: any) => ({
      ...g,
      id: g._id.toString(),
      createdAt: g.createdAt.toISOString(),
    }));
  }

  async addGoal(date: string, segment: TimeSegment, text: string): Promise<Goal> {
    await this.ensureConnected();
    const newGoal = await GoalModel.create({ date, segment, text });
    return {
      id: newGoal._id.toString(),
      date,
      segment,
      text,
      isCompleted: newGoal.isCompleted,
      createdAt: newGoal.createdAt.toISOString(),
    };
  }

  async updateGoal(id: string, updates: Partial<Pick<Goal, "text" | "isCompleted" | "segment" | "classification">>): Promise<Goal | null> {
    await this.ensureConnected();
    console.log("MongoDatabase.updateGoal:", id, updates);
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
  async getRecurringGoals(): Promise<RecurringGoal[]> {
    await this.ensureConnected();
    const recurring = await RecurringGoalModel.find().lean();
    return recurring.map((rg: any) => ({
      ...rg,
      id: rg._id.toString(),
      createdAt: rg.createdAt.toISOString(),
    }));
  }

  async addRecurringGoal(text: string, segment: TimeSegment, startDate: string, endDate?: string, isAlwaysRecurring: boolean = false): Promise<RecurringGoal> {
    await this.ensureConnected();
    const newRG = await RecurringGoalModel.create({ text, segment, startDate, endDate, isAlwaysRecurring });
    
    // If endDate is set, pre-populate Goal collection
    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const promises = [];
      let curr = new Date(start);
      while (curr <= end) {
        const dateStr = curr.toISOString().split('T')[0];
        promises.push(GoalModel.create({ date: dateStr, segment, text }));
        curr.setDate(curr.getDate() + 1);
      }
      await Promise.all(promises);
    }

    return {
      id: newRG._id.toString(),
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
  async getEventsByDate(date: string): Promise<Event[]> {
    await this.ensureConnected();
    const events = await EventModel.find({ date }).lean();
    return events.map((e: any) => ({
      ...e,
      id: e._id.toString(),
      createdAt: e.createdAt.toISOString(),
    }));
  }

  async addEvent(eventData: Omit<Event, "id" | "createdAt">): Promise<Event> {
    await this.ensureConnected();
    const newEvent = await EventModel.create(eventData);
    return {
      ...newEvent.toObject(),
      id: newEvent._id.toString(),
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
