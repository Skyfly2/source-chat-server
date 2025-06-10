import { Collection, ObjectId } from "mongodb";
import { User } from "../types";
import { connectToDatabase, getDatabase } from "../utils/databaseClient";

export class UserRepository {
  private get collection(): Collection<User> {
    return getDatabase().collection<User>("users");
  }

  async createUser(clerkUserId: string): Promise<User> {
    await connectToDatabase();
    const now = new Date();
    const user: Omit<User, "_id"> = {
      clerkUserId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(user);

    return {
      _id: result.insertedId,
      ...user,
    };
  }

  async getUserById(id: string | ObjectId): Promise<User | null> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: objectId });
  }

  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    await connectToDatabase();
    return await this.collection.findOne({ clerkUserId });
  }

  async findOrCreateUser(clerkUserId: string): Promise<User> {
    console.log("Finding or creating user with clerkUserId:", clerkUserId);
    await connectToDatabase();
    let user = await this.getUserByClerkId(clerkUserId);

    if (!user) {
      user = await this.createUser(clerkUserId);
    }

    return user;
  }

  async updateUserLastSeen(clerkUserId: string): Promise<User | null> {
    await connectToDatabase();
    const result = await this.collection.findOneAndUpdate(
      { clerkUserId },
      {
        $set: {
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  async deleteUser(clerkUserId: string): Promise<boolean> {
    await connectToDatabase();
    const result = await this.collection.deleteOne({ clerkUserId });
    return result.deletedCount > 0;
  }

  async getUserCount(): Promise<number> {
    await connectToDatabase();
    return await this.collection.countDocuments();
  }
}
