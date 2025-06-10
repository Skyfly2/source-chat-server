import { UserRepository } from "../data/UserRepository";
import { User } from "../types";

export class UserManager {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findOrCreateUser(clerkUserId: string): Promise<User> {
    if (!clerkUserId || typeof clerkUserId !== "string") {
      throw new Error("Valid Clerk user ID is required");
    }

    return await this.userRepository.findOrCreateUser(clerkUserId);
  }

  async getUserByClerkId(clerkUserId: string): Promise<User | null> {
    if (!clerkUserId || typeof clerkUserId !== "string") {
      throw new Error("Valid Clerk user ID is required");
    }

    return await this.userRepository.getUserByClerkId(clerkUserId);
  }

  async updateUserActivity(clerkUserId: string): Promise<User | null> {
    if (!clerkUserId || typeof clerkUserId !== "string") {
      throw new Error("Valid Clerk user ID is required");
    }

    return await this.userRepository.updateUserLastSeen(clerkUserId);
  }

  async deleteUser(clerkUserId: string): Promise<boolean> {
    if (!clerkUserId || typeof clerkUserId !== "string") {
      throw new Error("Valid Clerk user ID is required");
    }

    return await this.userRepository.deleteUser(clerkUserId);
  }
}
