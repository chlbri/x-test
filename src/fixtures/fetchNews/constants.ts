export function constructArrayObject<T extends string[]>(...array: T) {
  type Str = T[number];
  const object = array.reduce(
    (acc, item: Str) => {
      acc[item] = item;
      return acc;
    },
    {} as { [key in Str]: key },
  );
  return {
    object,
    array: array as Str[],
  } as const;
}

export const ERRORS = constructArrayObject(
  'FETCH_ERROR',
  'JSON_ERROR',
  'ZOD_ERROR',
  'API_KEY_ERROR',
  'API_URL_ERROR',
);
