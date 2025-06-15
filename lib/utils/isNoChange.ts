export function isNoChange<T extends object>(
  data: Partial<T>,
  original: T,
): boolean {
  return Object.entries(data).every(([key, value]) => {
    if (value === undefined) return true; // field not intended to update
    const originalValue = original[key as keyof T];
    return JSON.stringify(value) === JSON.stringify(originalValue);
  });
}
