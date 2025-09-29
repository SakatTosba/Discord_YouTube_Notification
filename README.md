# Discord_YouTube_Notification


## Özellikler

Tek dosya Node.js script 

YouTube Data API v3 (public okuma).

Discord Webhook ile çalışır, (Discord bot hesabı gerektirmez).

Spam önleme: Son gönderilen video ID’sini dosyada saklar (last_id.txt).

Google console kota dostu: playlistItems.list (1 birim/istek).


## Neye ihtiyacın var?

Node.js 18+ (fetch yerleşik).

YouTube API Key (Google Cloud Console → YouTube Data API v3 → Credentials → API key).

YouTube Kanal ID (UC…) (kanalın gerçek UC kimliği).

Discord Webhook URL (Discord → Kanal Ayarları → Integrations → Webhooks).


### Hız / Kota

1 istek = 1 birim (playlistItems.list)

Varsayılan 10 saniye aralık ⇒ günlük ~8640 birim (Resmi 10k limitin altında, Proje kabulu gerektirmeyen sınır).

Formül: günlük_birim ≈ 86400 / INTERVAL_SEC × watcher_sayısı.
