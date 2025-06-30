export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
  }
}

export const validateRequiredFields = (data: any, requiredFields: string[]) => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  if (missingFields.length > 0) {
    throw new AppError(
      `Missing required fields: ${missingFields.join(", ")}`,
      400,
    );
  }
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("Invalid email format", 400);
  }
};

export const validatePassword = (password: string) => {
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long", 400);
  }
};
