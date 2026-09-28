import { errorBodySchema } from '@nosh/shared/errors';

/** An error response from the API, with its code and any per-field messages. */
export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string> | undefined;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers:
      body === undefined
        ? { Accept: 'application/json' }
        : { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const body = errorBodySchema.safeParse(await res.json().catch(() => null));
    if (body.success) {
      const { code, message, fields } = body.data.error;
      throw new ApiError(res.status, code, message, fields);
    }
    throw new ApiError(res.status, 'unknown', 'Something went wrong. Please try again.');
  }
  // 204 No Content has no body to read.
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** A thin wrapper around `fetch` for the API. It throws `ApiError` for any error response. */
export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: (path: string) => request<void>('DELETE', path),
};
