import { IDatabase } from "./IDatabase";
import { MockDatabase } from "./MockDatabase";
import { MongoDatabase } from "./MongoDatabase";

export class DatabaseFactory {
  private static instance: IDatabase | null = null;

  static getDatabase(): IDatabase {
    if (!this.instance) {
      if (
        process.env.MONGODB_USERNAME &&
        process.env.MONGODB_PASSWORD &&
        process.env.MONGODB_DBNAME &&
        process.env.MONGODB_HOST
      ) {
        console.log("Initializing MongoDatabase");
        this.instance = new MongoDatabase();
      } else {
        console.log("Initializing MockDatabase");
        this.instance = new MockDatabase();
      }
    }
    return this.instance;
  }
}
