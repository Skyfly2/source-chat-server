import { Collection, ObjectId } from "mongodb";
import { MessageThread } from "../types";
import { connectToDatabase, getDatabase } from "../utils/databaseClient";

export class MessageThreadRepository {
  private get collection(): Collection<MessageThread> {
    return getDatabase().collection<MessageThread>("threads");
  }

  async createThread(
    threadData: Omit<MessageThread, "_id" | "createdAt" | "updatedAt">
  ): Promise<MessageThread> {
    await connectToDatabase();
    const now = new Date();
    const thread: Omit<MessageThread, "_id"> = {
      ...threadData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(thread);

    return {
      _id: result.insertedId,
      ...thread,
    };
  }

  async getThreadById(id: string | ObjectId): Promise<MessageThread | null> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: objectId });
  }

  async getAllThreadsForUser(
    userId: string,
    limit: number = 10,
    skip: number = 0
  ): Promise<MessageThread[]> {
    await connectToDatabase();
    return await this.collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async updateThread(
    id: string | ObjectId,
    updates: Partial<Omit<MessageThread, "_id" | "createdAt">>
  ): Promise<MessageThread | null> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  async deleteThread(id: string | ObjectId): Promise<boolean> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  async getThreadCount(): Promise<number> {
    await connectToDatabase();
    return await this.collection.countDocuments();
  }

  async searchThreads(
    searchTerm: string,
    limit: number = 10
  ): Promise<MessageThread[]> {
    await connectToDatabase();
    const query: any = {
      title: { $regex: searchTerm, $options: "i" },
    };

    return await this.collection
      .find(query)
      .sort({ updatedAt: -1 })
      .limit(limit)
      .toArray();
  }
}
