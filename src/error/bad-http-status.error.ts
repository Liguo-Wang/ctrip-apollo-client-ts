 export class BadHttpStatusError extends Error {
  name = "BadHttpStatusError";

  constructor(apiName: string, status: number) {
      super();
      Object.setPrototypeOf(this, BadHttpStatusError.prototype);
      this.message = `Apollo server["${apiName}"] return unknown http status - ${status}.`;
  }
}