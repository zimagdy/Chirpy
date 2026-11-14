import type { Request, Response, NextFunction } from "express";

export class error400 extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class error401 extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class error403 extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class error404 extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof error400) {
    return res.status(400).json({
      error: err.message,
    });
  } else if (err instanceof error404) {
    return res.status(404).json({
      error: err.message,
    });
  } else {
    return res.status(500).json({
      error: "Something went wrong on our end",
    });
  }
};
