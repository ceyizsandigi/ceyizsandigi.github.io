export default function ConfigError() {
  return (
    <div className="min-h-dvh bg-black px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
        <h1 className="text-xl font-semibold text-white mb-3">Ayar eksik</h1>
        <p className="text-zinc-300 text-base leading-relaxed">
          Supabase bağlantı bilgileri bulunamadı. Proje kökünde{' '}
          <span className="text-white font-medium">.env.local</span> dosyası
          oluşturup şu değerleri doldurun:
        </p>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400 font-mono">
          <li>VITE_SUPABASE_URL=...</li>
          <li>VITE_SUPABASE_ANON_KEY=...</li>
        </ul>
        <p className="mt-4 text-zinc-400 text-sm">
          Örnek için <span className="text-zinc-200">.env.example</span>{' '}
          dosyasına bakabilirsiniz. Değişiklikten sonra uygulamayı yeniden
          başlatın.
        </p>
      </div>
    </div>
  )
}
