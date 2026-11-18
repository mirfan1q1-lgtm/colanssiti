// @ts-ignore
import { env } from 'cloudflare:workers';

export function getCfEnv(fallbackLocals?: any): any {
  try {
    if (env) return env;
  } catch (err) {
    // ignore
  }
  return {};
}
