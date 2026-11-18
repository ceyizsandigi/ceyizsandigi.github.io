# Çeyiz Takip

Telefondan kullanılacak Türkçe çeyiz takip web uygulaması (Vite + React + Tailwind + Supabase).

## Yerel kurulum

```bash
npm install
cp .env.example .env.local
```

`.env.local` içine Supabase değerlerini yazın:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

`service_role` anahtarını kullanmayın.

### Supabase kurulumu

SQL Editor’de migration’ları sırayla çalıştırın:

1. `supabase/migrations/001_create_categories_and_items.sql`
2. `supabase/migrations/002_grants_authenticated.sql`

Kullanıcıları **Authentication → Users** üzerinden elle ekleyin (uygulamada kayıt yok).

### Çalıştırma

```bash
npm run dev
```

```bash
npm run build
npm run preview
```

```bash
npm test
```

## Vercel’e yayınlama

Statik site olarak deploy edin. Vercel proje ayarlarına şu ortam değişkenlerini ekleyin:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Build komutu: `npm run build`  
Çıktı klasörü: `dist`

## Telefona ekleme

Safari / Chrome’da “Ana Ekrana Ekle” ile açılabilir (manifest + ikonlar hazır; service worker yok).
