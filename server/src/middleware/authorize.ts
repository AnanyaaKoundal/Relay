import type { Request, Response, NextFunction } from "express";

type Role = "admin" | "instructor";

export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    for (const role of roles) {
      if (role === "admin" && req.user.isAdmin) {
        next();
        return;
      }
      if (role === "instructor" && req.user.isInstructor) {
        next();
        return;
      }
    }

    res.status(403).json({ error: "You don't have permission to perform this action" });
  };
}
