import type { APIRoute } from 'astro';
import { handleTelegramUpdate } from '../../../lib/bot';
import { getCfEnv } from '../../../lib/cfEnv';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const env = getCfEnv();
    const update = await request.json();

    // Process update with Cloudflare D1 environment bindings
    await handleTelegramUpdate(update, env);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[Telegram Webhook Error]:', err);
    // Always return 200 to Telegram so it doesn't storm with retries on malformed updates
    return new Response(JSON.stringify({ ok: false, error: err?.message || 'Error' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ request }) => {
  const env = getCfEnv();
  const token = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = env?.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  // Helper untuk mendaftarkan URL webhook otomatis ke Telegram API
  if (action === 'setWebhook') {
    const targetWebhookUrl = url.searchParams.get('url') || `${url.origin}/api/bot/webhook`;
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: 'TELEGRAM_BOT_TOKEN belum disetel di environment.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(targetWebhookUrl)}`
      );
      const data = await res.json();
      return new Response(
        JSON.stringify({
          success: true,
          webhookUrl: targetWebhookUrl,
          telegramResponse: data,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (e: any) {
      return new Response(JSON.stringify({ ok: false, error: e?.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Health-check endpoint
  return new Response(
    JSON.stringify({
      status: 'active',
      service: 'Sekarsiti Telegram Management Bot Webhook',
      configured: {
        botTokenSet: Boolean(token),
        adminChatIdSet: Boolean(adminChatId),
      },
      endpoints: {
        webhookUrl: `${url.origin}/api/bot/webhook`,
        autoRegisterWebhookUrl: `${url.origin}/api/bot/webhook?action=setWebhook`,
      },
      commandsSupported: ['/status', '/mitra', '/approve <slug>', '/pending <slug>', '/web'],
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
