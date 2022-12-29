export class HttpError extends Error {
  status: number;

  constructor(status: number) {
    super(`${status}`);

    this.status = status;
  }
}
