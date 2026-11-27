import { AsyncLocalStorage } from "async_hooks";

const requestStorage = new AsyncLocalStorage<Request>();

export function runWithRequest<T>(req: Request, fn: () => Promise<T>): Promise<T> {
  return requestStorage.run(req, fn);
}

export function currentRequest(): Request | undefined {
  return requestStorage.getStore();
}
