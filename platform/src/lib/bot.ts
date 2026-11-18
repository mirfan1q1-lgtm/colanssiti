import { getDb } from '../db';
import { partners, partnerPackages, partnerMedia } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface TelegramMessageOptions {
  chatId?: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: {
    inline_keyboard: TelegramInlineButton[][];
  };
}

/**
 * Kirim pesan ke Telegram Admin
 */
export async function sendTelegramMessage(
  text: string,
  options: TelegramMessageOptions = {},
  env?: any
): Promise<boolean> {
  const token = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = options.chatId || env?.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !adminChatId) {
    console.warn('[Telegram Bot] Token atau Admin Chat ID belum dikonfigurasi di .env.');
    return false;
  }

  try {
    const payload: Record<string, any> = {
      chat_id: adminChatId,
      text,
      parse_mode: options.parseMode || 'Markdown',
      disable_web_page_preview: false,
    };

    if (options.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();
    return data.ok === true;
  } catch (err) {
    console.error('[Telegram Bot] Gagal mengirim pesan:', err);
    return false;
  }
}

/**
 * Edit pesan Telegram setelah tombol ditekan (misal tombol Approve)
 */
export async function editTelegramMessage(
  messageId: number,
  chatId: number | string,
  text: string,
  replyMarkup?: { inline_keyboard: TelegramInlineButton[][] },
  env?: any
): Promise<boolean> {
  const token = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const payload: Record<string, any> = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'Markdown',
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data: any = await res.json();
    return data.ok === true;
  } catch (err) {
    return false;
  }
}

/**
 * Kirim notifikasi saat ada pendaftaran mitra baru via /gabung
 */
export async function notifyNewPartnerSubmission(
  partner: {
    name: string;
    brandName: string;
    slug: string;
    category: string;
    cityCoverage: string;
    phoneWhatsapp: string;
    packageCount: number;
    photoCount: number;
    designMode: string;
    notes?: string;
  },
  env?: any
) {
  const notesLine = partner.notes ? `• *Catatan / Permintaan*: _${partner.notes}_\n` : '';
  const text = `💍 *PENDAFTARAN MITRA BARU MASUK!*\n` +
    `─────────────────────────\n` +
    `• *Brand*: *${partner.brandName}*\n` +
    `• *Nama*: ${partner.name}\n` +
    `• *Kategori*: ${partner.category}\n` +
    `• *Kota*: ${partner.cityCoverage}\n` +
    `• *WhatsApp*: [${partner.phoneWhatsapp}](https://wa.me/${partner.phoneWhatsapp.replace(/[^0-9]/g, '')})\n` +
    `• *Total Paket*: ${partner.packageCount} Paket Layanan\n` +
    `• *Foto*: ${partner.photoCount} Foto (WebP Cloudinary)\n` +
    `• *Mode Desain*: ${partner.designMode === 'custom_admin' ? 'Kurasi Desain Sekarsiti' : 'Template Standar'}\n` +
    notesLine +
    `─────────────────────────\n` +
    `Status Saat Ini: ⏳ *Menunggu Verifikasi (Pending)*`;

  const buttons: TelegramInlineButton[][] = [
    [
      {
        text: '✅ Setujui & Aktifkan',
        callback_data: `approve:${partner.slug}`,
      },
      {
        text: '👁️ Lihat Portofolio',
        url: `https://mltr.my.id/mitra/${partner.slug}`,
      },
    ],
  ];

  await sendTelegramMessage(text, { replyMarkup: { inline_keyboard: buttons } }, env);
}

/**
 * Handle incoming update dari Telegram Webhook
 */
export async function handleTelegramUpdate(update: any, env?: any) {
  const token = env?.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const adminChatId = String(env?.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID || '');
  const d1Db = getDb(env);

  // 1. Handle Callback Query (Klik tombol inline di chat)
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data as string;
    const messageId = cb.message?.message_id;
    const chatId = cb.message?.chat?.id;

    // Jawab callback query agar loading di tombol hilang
    if (token) {
      await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: cb.id }),
      });
    }

    if (data.startsWith('approve:')) {
      const slug = data.replace('approve:', '');
      if (d1Db) {
        await d1Db.update(partners).set({ status: 'active' }).where(eq(partners.slug, slug));
      }

      const updatedText = (cb.message?.text || '') + `\n\n✅ *DISETUJUI & AKTIF LIVE* oleh Admin`;
      const buttons: TelegramInlineButton[][] = [
        [
          { text: '⏸️ Jadikan Pending', callback_data: `pending:${slug}` },
          { text: '👁️ Buka Halaman', url: `https://mltr.my.id/mitra/${slug}` },
        ],
      ];
      await editTelegramMessage(messageId, chatId, updatedText, { inline_keyboard: buttons }, env);
      return;
    }

    if (data.startsWith('pending:')) {
      const slug = data.replace('pending:', '');
      if (d1Db) {
        await d1Db.update(partners).set({ status: 'pending' }).where(eq(partners.slug, slug));
      }

      const updatedText = (cb.message?.text || '').replace('✅ DISETUJUI & AKTIF LIVE oleh Admin', '') + `\n\n⏸️ *DIJADIKAN PENDING*`;
      const buttons: TelegramInlineButton[][] = [
        [
          { text: '✅ Setujui & Aktifkan', callback_data: `approve:${slug}` },
          { text: '👁️ Buka Halaman', url: `https://mltr.my.id/mitra/${slug}` },
        ],
      ];
      await editTelegramMessage(messageId, chatId, updatedText, { inline_keyboard: buttons }, env);
      return;
    }
  }

  // 2. Handle Text Commands (/status, /mitra, /approve, /help)
  if (update.message && update.message.text) {
    const text = update.message.text.trim();
    const chatId = update.message.chat.id;

    // Security check: Only allow admin chat ID if configured
    if (adminChatId && String(chatId) !== adminChatId) {
      await sendTelegramMessage(
        `⛔ Maaf, akun Telegram Anda (${chatId}) tidak memiliki izin akses ke Bot Sekarsiti.`,
        { chatId },
        env
      );
      return;
    }

    // /start atau /help
    if (text === '/start' || text === '/help') {
      const helpMsg = `✨ *SEKARSITI PARTNERSHIP BOT* ✨\n` +
        `Bot pemantauan dan pengelolaan platform kemitraan pernikahan.\n\n` +
        `*Daftar Perintah:*\n` +
        `📊 \`/status\` - Pantau kesehatan sistem & statistik D1\n` +
        `👥 \`/mitra\` - Lihat daftar mitra aktif & pending\n` +
        `✅ \`/approve <slug>\` - Aktifkan landing page mitra\n` +
        `⏸️ \`/pending <slug>\` - Nonaktifkan / tunda mitra\n` +
        `🌐 \`/web\` - Tautan cepat ke platform Sekarsiti`;

      await sendTelegramMessage(helpMsg, { chatId }, env);
      return;
    }

    // /status atau /cek
    if (text === '/status' || text === '/cek') {
      let stats = {
        totalPartners: 0,
        activePartners: 0,
        pendingPartners: 0,
        totalPackages: 0,
        totalMedia: 0,
      };

      if (d1Db) {
        try {
          const allP = await d1Db.select().from(partners);
          stats.totalPartners = allP.length;
          stats.activePartners = allP.filter((p) => p.status === 'active').length;
          stats.pendingPartners = allP.filter((p) => p.status === 'pending').length;

          const allPkg = await d1Db.select().from(partnerPackages);
          stats.totalPackages = allPkg.length;

          const allMed = await d1Db.select().from(partnerMedia);
          stats.totalMedia = allMed.length;
        } catch (e) {
          console.warn('D1 query notice:', e);
        }
      }

      const statusMsg = `📊 *MONITORING PLATFORM SEKARSITI*\n` +
        `─────────────────────────\n` +
        `☁️ *Database*: Cloudflare D1 (\`sekarsiti_db\`)\n` +
        `⚡ *Hosting Edge*: Cloudflare Workers\n` +
        `🖼️ *Media Storage*: Cloudinary CDN\n\n` +
        `📈 *Statistik Terkini:*\n` +
        `• Total Mitra Terdaftar: *${stats.totalPartners} Mitra*\n` +
        `• Mitra Aktif Live: *${stats.activePartners} Mitra* 🟢\n` +
        `• Menunggu Persetujuan: *${stats.pendingPartners} Mitra* ⏳\n` +
        `• Total Paket Layanan: *${stats.totalPackages} Paket*\n` +
        `• Foto Portofolio: *${stats.totalMedia} Foto*\n` +
        `─────────────────────────\n` +
        `_Status Server: Semua sistem berjalan normal._`;

      await sendTelegramMessage(statusMsg, { chatId }, env);
      return;
    }

    // /mitra
    if (text === '/mitra') {
      if (!d1Db) {
        await sendTelegramMessage('Database belum terhubung.', { chatId }, env);
        return;
      }

      const allPartners = await d1Db.select().from(partners);
      if (allPartners.length === 0) {
        await sendTelegramMessage('Belum ada mitra yang terdaftar.', { chatId }, env);
        return;
      }

      let listMsg = `👥 *DAFTAR MITRA SEKARSITI (${allPartners.length})*\n` +
        `─────────────────────────\n`;

      const buttons: TelegramInlineButton[][] = [];

      for (const p of allPartners) {
        const badge = p.status === 'active' ? '🟢 Aktif' : '⏳ Pending';
        listMsg += `• *${p.brandName}* (\`${p.slug}\`)\n` +
          `  └ ${p.category} | ${p.cityCoverage} | ${badge}\n`;

        buttons.push([
          {
            text: p.status === 'active' ? `⏸️ Pendingkan ${p.slug}` : `✅ Aktifkan ${p.slug}`,
            callback_data: p.status === 'active' ? `pending:${p.slug}` : `approve:${p.slug}`,
          },
          {
            text: `👁️ Buka`,
            url: `https://mltr.my.id/mitra/${p.slug}`,
          },
        ]);
      }

      await sendTelegramMessage(listMsg, { chatId, replyMarkup: { inline_keyboard: buttons } }, env);
      return;
    }

    // /approve <slug>
    if (text.startsWith('/approve')) {
      const slug = text.replace('/approve', '').trim();
      if (!slug) {
        await sendTelegramMessage('Gunakan format: `/approve <slug>` (contoh: `/approve andi`)', { chatId }, env);
        return;
      }

      if (d1Db) {
        await d1Db.update(partners).set({ status: 'active' }).where(eq(partners.slug, slug));
        await sendTelegramMessage(`✅ Mitra *${slug}* berhasil diaktifkan dan live di website!`, { chatId }, env);
      }
      return;
    }

    // /pending <slug>
    if (text.startsWith('/pending')) {
      const slug = text.replace('/pending', '').trim();
      if (!slug) {
        await sendTelegramMessage('Gunakan format: `/pending <slug>` (contoh: `/pending andi`)', { chatId }, env);
        return;
      }

      if (d1Db) {
        await d1Db.update(partners).set({ status: 'pending' }).where(eq(partners.slug, slug));
        await sendTelegramMessage(`⏸️ Mitra *${slug}* diubah statusnya menjadi pending.`, { chatId }, env);
      }
      return;
    }

    // /web
    if (text === '/web') {
      await sendTelegramMessage(
        `🌐 *Tautan Resmi Platform Sekarsiti:*\n\n` +
        `• Hub Utama: https://mltr.my.id\n` +
        `• Direktori Mitra: https://mltr.my.id/mitra\n` +
        `• Formulir Pendaftaran: https://mltr.my.id/gabung\n` +
        `• Portal Mandiri: https://mltr.my.id/kelola`,
        { chatId },
        env
      );
      return;
    }
  }
}
