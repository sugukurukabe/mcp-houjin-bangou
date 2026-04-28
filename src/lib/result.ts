/**
 * Result<T, E> モナド
 * Result monad for explicit error handling
 * Monad Result untuk penanganan error eksplisit
 */

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const Result = {
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },
  err<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },
  isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
    return r.ok;
  },
  isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
    return !r.ok;
  },
  unwrap<T, E>(r: Result<T, E>): T {
    if (r.ok) return r.value;
    throw new Error(`Result.unwrap called on Err: ${String(r.error)}`);
  },
  unwrapErr<T, E>(r: Result<T, E>): E {
    if (!r.ok) return r.error;
    throw new Error('Result.unwrapErr called on Ok');
  },
  map<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
    return r.ok ? Result.ok(fn(r.value)) : r;
  },
  mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
    return r.ok ? r : Result.err(fn(r.error));
  },
};
