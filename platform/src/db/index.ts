import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';
import { getCfEnv } from '../lib/cfEnv';

export function getDb(passedEnv?: any) {
  const cfEnv = passedEnv || getCfEnv();
  const d1 = cfEnv?.DB;
  if (d1) {
    return drizzle(d1, { schema });
  }
  return null;
}

export const db = null;

export { schema };
