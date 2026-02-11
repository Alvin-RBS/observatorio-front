export class ErrorAPI extends Error {
  public readonly statusCode: number;
  public readonly title?: string;

  constructor(message: string, statusCode = 400, title?: string) {
    super(message);
    this.statusCode = statusCode;
    this.title = title;
    this.name = 'ErrorAPI';
  }
}