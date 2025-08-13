export interface APIError extends Error {
  statusCode?: number;
  message: string;
  title?: string;
}

export class ErrorApi extends Error {
  statusCode?: number;
  title?: string;

  constructor(message: string, statusCode?: number, title?: string) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.title = title;
  }
}