import { Collection, ObjectId } from "mongodb";
import { ChatMessage } from "../types";
import { connectToDatabase, getDatabase } from "../utils/databaseClient";

export class ChatMessageRepository {
  private get collection(): Collection<ChatMessage> {
    return getDatabase().collection<ChatMessage>("messages");
  }

  async createMessage(
    messageData: Omit<ChatMessage, "_id" | "createdAt" | "updatedAt">
  ): Promise<ChatMessage> {
    await connectToDatabase();
    const now = new Date();
    const message: Omit<ChatMessage, "_id"> = {
      ...messageData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.collection.insertOne(message);

    return {
      _id: result.insertedId,
      ...message,
    };
  }

  async getMessageById(id: string | ObjectId): Promise<ChatMessage | null> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    return await this.collection.findOne({ _id: objectId });
  }

  async getMessagesByThreadId(
    threadId: string | ObjectId,
    limit: number = 100,
    skip: number = 0
  ): Promise<ChatMessage[]> {
    await connectToDatabase();
    const objectId =
      typeof threadId === "string" ? new ObjectId(threadId) : threadId;
    return await this.collection
      .find({ threadId: objectId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(skip)
      .toArray();
  }

  async updateMessage(
    id: string | ObjectId,
    updates: Partial<Omit<ChatMessage, "_id" | "threadId" | "createdAt">>
  ): Promise<ChatMessage | null> {
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

  async deleteMessage(id: string | ObjectId): Promise<boolean> {
    await connectToDatabase();
    const objectId = typeof id === "string" ? new ObjectId(id) : id;
    const result = await this.collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  async deleteMessagesByThreadId(threadId: string | ObjectId): Promise<number> {
    await connectToDatabase();
    const objectId =
      typeof threadId === "string" ? new ObjectId(threadId) : threadId;
    const result = await this.collection.deleteMany({ threadId: objectId });
    return result.deletedCount || 0;
  }

  async getMessageCount(threadId?: string | ObjectId): Promise<number> {
    await connectToDatabase();
    const query = threadId
      ? {
          threadId:
            typeof threadId === "string" ? new ObjectId(threadId) : threadId,
        }
      : {};
    return await this.collection.countDocuments(query);
  }

  async getLastMessageInThread(
    threadId: string | ObjectId
  ): Promise<ChatMessage | null> {
    await connectToDatabase();
    const objectId =
      typeof threadId === "string" ? new ObjectId(threadId) : threadId;
    return await this.collection.findOne(
      { threadId: objectId },
      { sort: { createdAt: -1 } }
    );
  }
}
