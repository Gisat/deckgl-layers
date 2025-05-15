type Nullable<T> = T | null;
type Unsure<T> = T | undefined;
type NullablePromise<T> = Promise<T | null>;
type UnsurePromise<T> = Promise<T | undefined>;

export type { Nullable, Unsure, NullablePromise, UnsurePromise };