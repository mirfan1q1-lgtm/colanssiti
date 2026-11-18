import crypto from 'node:crypto';

const COOKIE_NAME = 'sekarsiti_partner_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 hari
export const DEFAULT_SESSION_SECRET = 'a9a4b6250d08a2082f282245f78fb0b0ccc6de702b98128da4f8c18e7ee0eb5b';

export interface AuthSession {
  slug: string;
  id?: number;
  exp: number; // unix timestamp in seconds
}

/**
 * Hash password menggunakan HMAC-SHA256 dengan random salt 16 bytes (kompatibel penuh dengan Cloudflare Workers)
 */
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex');
  return {
    hash,
    salt,
  };
}

/**
 * Verifikasi password terhadap hash dan salt secara timing-safe
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = crypto.createHmac('sha256', salt).update(password).digest('hex');
    const computedBuffer = Buffer.from(computed);
    const hashBuffer = Buffer.from(hash);

    if (computedBuffer.length !== hashBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(computedBuffer, hashBuffer);
  } catch (err) {
    return false;
  }
}

/**
 * Buat signed session token (HMAC-SHA256)
 */
export function createSessionToken(slug: string, secret?: string, id?: number): string {
  const secretKey = secret || DEFAULT_SESSION_SECRET;
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload: AuthSession = { slug, id, exp };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifikasi signed session token
 */
export function verifySessionToken(token: string, secret?: string): AuthSession | null {
  try {
    const secretKey = secret || DEFAULT_SESSION_SECRET;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(encodedPayload)
      .digest('base64url');

    // Timing-safe comparison of signature
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: AuthSession = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Parse session cookie dari Request object
 */
export function getSessionFromRequest(request: Request, secret: string): AuthSession | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );

  const token = cookies[COOKIE_NAME];
  if (!token) return null;

  return verifySessionToken(token, secret);
}

/**
 * Helper Set-Cookie header untuk login
 */
export function createSessionCookieHeader(token: string, secure = process.env.NODE_ENV === 'production'): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}${secure ? '; Secure' : ''}`;
}

/**
 * Helper Set-Cookie header untuk logout
 */
export function createClearSessionCookieHeader(secure = process.env.NODE_ENV === 'production'): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

