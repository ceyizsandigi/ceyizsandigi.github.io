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

## Yayınlama

### Mobil için önerilen adres (GitHub Pages)

Bazı Türkiye mobil operatörleri `*.vercel.app` adreslerini kesebiliyor (`ERR_CONNECTION_CLOSED`). Bu yüzden telefonda şu adresi kullanın:

**https://hakan-cod.github.io/ceyiztakipuygulamasi/**

GitHub repo Secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

`main` branch’e push olunca Pages otomatik güncellenir.

### Vercel (Wi‑Fi / bilgisayar)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Build: `npm run build` · çıktı: `dist`  
Adres: `https://ceyiztakipuygulamasi.vercel.app`

Kalıcı çözüm: kendi alan adını Vercel’e bağlamak (ör. `ceyiztakip.com`) — operatör `vercel.app` engelini aşar.

## Telefona ekleme

Safari / Chrome’da “Ana Ekrana Ekle” ile açılabilir (manifest + ikonlar hazır; service worker yok).
