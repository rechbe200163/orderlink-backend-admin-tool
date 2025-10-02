import { Inject } from '@nestjs/common';

export const SUPABASE_CLIENT_TOKEN = 'SUPABASE_CLIENT_TOKEN';

export function InjectSupabaseClient(): ParameterDecorator {
  return Inject(SUPABASE_CLIENT_TOKEN);
}
