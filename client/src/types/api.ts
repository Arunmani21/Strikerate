export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  message: string;
  timestamp: string;
  path?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
