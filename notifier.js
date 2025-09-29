// CommonJS. Node 18+ (fetch gömülü), Tek dosya.
const fs = require("fs");

// ---- Bilgiler ----
const API_KEY   = ""; // YouTube Data API v3
const CHANNELID = ""; // YouTube kanal ID, UC ile başlar
const HOOK      = "https://discord.com/api/webhooks/"; // Discord Webhook Url
// ---------------------------
const INTERVAL_SEC = 10;
const STATE_FILE   = "last_id.txt";
const MESSAGE_TEXT = "🎬 Yeni içerik yüklendi!";

// UC → UU (Uploads playlist) dönüşümü
function ucToUu(ucId) {
  if (typeof ucId !== "string" || !ucId.startsWith("UC") || ucId.length < 4) return null;
  return "UU" + ucId.slice(2);
}

function readLastId() {
  try { return fs.readFileSync(STATE_FILE, "utf8").trim(); } catch { return ""; }
}
function writeLastId(id) {
  try { fs.writeFileSync(STATE_FILE, id ?? "", "utf8"); } catch {}
}

async function getLatestVideoId(uploadsId) {
  const url = `https://youtube.googleapis.com/youtube/v3/playlistItems`
    + `?part=contentDetails&playlistId=${uploadsId}&maxResults=1&key=${API_KEY}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`playlistItems.list ${r.status}`);
  const data = await r.json();
  return data.items?.[0]?.contentDetails?.videoId || null;
}

async function sendWebhook(videoId) {
  const videoUrl = `https://youtu.be/${videoId}`;
  const payload = { content: `${MESSAGE_TEXT}\n${videoUrl}` };
  const r = await fetch(HOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`Webhook ${r.status}: ${t}`);
  }
}

(async function main() {
  const uploadsId = ucToUu(CHANNELID);
  if (!uploadsId) {
    console.error("HATA: CHANNELID 'UC' ile başlamalı ve geçerli olmalı.");
    process.exit(1);
  }

  console.log(`Uploads playlist ID: ${uploadsId}`);
  console.log(`Her ${INTERVAL_SEC} sn'de kontrol edilecek…`);

  for (;;) {
    try {
      const latestId = await getLatestVideoId(uploadsId);
      if (latestId && latestId !== readLastId()) {
        await sendWebhook(latestId);
        writeLastId(latestId);
        console.log(new Date().toISOString(), "Yeni video gönderildi:", latestId);
      }
    } catch (e) {
      console.error(new Date().toISOString(), "HATA:", e.message);
      // ufak backoff
      await new Promise(r => setTimeout(r, 5000));
    }
    await new Promise(r => setTimeout(r, INTERVAL_SEC * 1000));
  }
})();