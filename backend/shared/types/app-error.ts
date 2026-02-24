type AppErrorInput = {
  statusCode: number;
  message: string;
  errors?: string[];
};

export class AppError extends Error {
  readonly statusCode: number;
  readonly errors?: string[];

  constructor({ statusCode, message, errors }: AppErrorInput) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
