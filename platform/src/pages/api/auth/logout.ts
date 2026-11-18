import type { APIRoute } from 'astro';
import { createClearSessionCookieHeader } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Logout berhasil.',
      redirectUrl: '/kelola/login',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': createClearSessionCookieHeader(new URL(request.url).protocol === 'https:'),
      },
    }
  );
};

