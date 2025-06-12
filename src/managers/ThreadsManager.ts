import { ObjectId } from "mongodb";
import { ChatMessageRepository } from "../data/ChatMessageRepository";
import { MessageThreadRepository } from "../data/MessageThreadRepository";
import { ChatMessage, MessageThread } from "../types";

export class ThreadsManager {
  private threadRepository: MessageThreadRepository;
  private messageRepository: ChatMessageRepository;

  constructor() {
    this.threadRepository = new MessageThreadRepository();
    this.messageRepository = new ChatMessageRepository();
  }

  async createThread(title: string, userId: string): Promise<MessageThread> {
    const threadData = {
      title,
      userId,
    };

    return await this.threadRepository.createThread(threadData);
  }

  async getThread(threadId: string | ObjectId): Promise<MessageThread | null> {
    return await this.threadRepository.getThreadById(threadId);
  }

  async getThreadWithMessages(
    threadId: string | ObjectId
  ): Promise<{ thread: MessageThread | null; messages: ChatMessage[] }> {
    const thread = await this.threadRepository.getThreadById(threadId);
    const messages = thread
      ? await this.messageRepository.getMessagesByThreadId(threadId)
      : [];
    return { thread, messages };
  }

  async getAllThreads(
    limit: number = 10,
    skip: number = 0
  ): Promise<MessageThread[]> {
    return await this.threadRepository.getAllThreads(limit, skip);
  }

  async addMessageToThread(
    threadId: string | ObjectId,
    role: "user" | "assistant" | "system",
    content: string
  ): Promise<ChatMessage> {
    const objectId =
      typeof threadId === "string" ? new ObjectId(threadId) : threadId;

    const messageData = {
      role,
      content,
      threadId: objectId,
    };

    const message = await this.messageRepository.createMessage(messageData);

    await this.threadRepository.updateThread(threadId, {
      updatedAt: new Date(),
    });

    return message;
  }

  async updateThreadTitle(
    threadId: string | ObjectId,
    title: string
  ): Promise<MessageThread | null> {
    return await this.threadRepository.updateThread(threadId, { title });
  }

  async deleteThread(threadId: string | ObjectId): Promise<boolean> {
    await this.messageRepository.deleteMessagesByThreadId(threadId);
    return await this.threadRepository.deleteThread(threadId);
  }

  async searchThreads(
    searchTerm: string,
    limit: number = 10
  ): Promise<MessageThread[]> {
    return await this.threadRepository.searchThreads(searchTerm, limit);
  }

  async getThreadMessages(threadId: string | ObjectId): Promise<ChatMessage[]> {
    return await this.messageRepository.getMessagesByThreadId(threadId);
  }

  generateThreadTitle(firstMessage: string): string {
    const maxLength = 50;
    if (firstMessage.length <= maxLength) {
      return firstMessage;
    }

    const truncated = firstMessage.substring(0, maxLength).trim();
    const lastSpace = truncated.lastIndexOf(" ");

    if (lastSpace > maxLength * 0.7) {
      return truncated.substring(0, lastSpace) + "...";
    }

    return truncated + "...";
  }
}
