import { subscribeSchema } from '../schemas/subscribe.js';

test('accepts a valid email', () => {
  const result = subscribeSchema.safeParse({ email: 'bill@example.com' });
  expect(result.success).toBe(true);
});

test('rejects an invalid email', () => {
  const result = subscribeSchema.safeParse({ email: 'not-an-email' });
  expect(result.success).toBe(false);
});