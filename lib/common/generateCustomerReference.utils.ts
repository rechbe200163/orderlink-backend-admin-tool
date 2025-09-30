export async function generateCustomerReferenceNumber(): Promise<number> {
  const { customAlphabet } = await import('nanoid');
  const nanoid = customAlphabet('1234567890', 9);
  return Number(nanoid());
}

export async function generateCustomerPassword(): Promise<string> {
  const { customAlphabet } = await import('nanoid');
  const nanoid = customAlphabet(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    18,
  );
  // Format: xxxxxx-xxxxxxx-xxxxxx
  const part1 = nanoid(6);
  const part2 = nanoid(6);
  const part3 = nanoid(6);
  return `${part1}-${part2}-${part3}`;
}
