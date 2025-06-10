import type { NextFunction, Request, Response } from "express";
import { UserManager } from "../managers/UserManager";
import type { AuthenticatedRequest, ClerkUser } from "../types";

const userManager = new UserManager();

export const requireAuth = async (
  req: Request & { user?: ClerkUser },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const sessionToken = req.headers.authorization?.split(" ")[1];

  if (!sessionToken) {
    res.status(401).json({ error: "No session token provided" });
    return;
  }

  const user = await userManager.verifySessionToken(sessionToken);

  if (!user) {
    res.status(401).json({ error: "Invalid session token" });
    return;
  }

  (req as AuthenticatedRequest).user = user;
  next();
};

export const asAuthenticatedHandler = (
  handler: (req: any, res: Response, next: NextFunction) => any
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next);
  };
};
