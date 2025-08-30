import { Request, Response, NextFunction } from "express";
import { z } from "zod";


type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any> | any;

const asyncMiddleware =
  (theFunc: AsyncFunction) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };

export default asyncMiddleware;


export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}


// Response utilities
export const createResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const createErrorResponse = (message: string, errors?: any[]): ApiResponse => ({
  success: false,
  message,
  errors,
});

// Validation middleware factory
export const validateSchema = (schema: z.ZodSchema, source: 'body' | 'params' | 'query' = 'body') => {
  return asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
      req[source] = schema.parse(data);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  });
};

// Global error handler
export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  // Zod validation errors
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors,
    });
  }

  // Database errors (you can customize based on your DB)
  if (error.code === '23505') { // Postgres unique constraint
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  if (error.code === '23503') { // Postgres foreign key constraint
    return res.status(400).json({
      success: false,
      message: 'Referenced resource does not exist',
    });
  }

  // Default error
  const statusCode = error.statusCode || error.status || 500;
  const message = error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

// Custom error classes
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}

// Pagination helper
export const createPaginationResponse = <T>(
  data: T[],
  page: number,
  limit: number,
  totalCount: number,
  message?: string
): ApiResponse<T[]> => {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    success: true,
    data,
    message,
    pagination: {
      page,
      limit,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};
