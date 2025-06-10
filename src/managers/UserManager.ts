import clerkClient from "@clerk/clerk-sdk-node";
import jwt from "jsonwebtoken";
import { UserRepository } from "../data/UserRepository";
import { ClerkUser, User } from "../types";

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

  async verifySessionToken(sessionToken: string): Promise<ClerkUser | null> {
    try {
      const decoded = jwt.decode(sessionToken) as any;
      if (decoded && decoded.sub) {
        const userId = decoded.sub;
        const user = await clerkClient.users.getUser(userId);

        return {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: user.publicMetadata,
          privateMetadata: user.privateMetadata,
        };
      }
    } catch (jwtError) {
      return null;
    }
    return null;
  }
}
