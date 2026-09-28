import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Standalone çıktı: Docker imajı node_modules'ün tamamını değil
   * yalnızca gerçekten kullanılan dosyaları taşır. Dokploy'da imaj
   * boyutu ve soğuk başlangıç süresi belirgin şekilde düşer.
   */
  output: "standalone",

  /**
   * Veritabanı dosyası derleme çıktısına girmemeli.
   *
   * Next'in dosya izleyicisi `path.join(process.cwd(), ".data", ...)`
   * ifadesini çözüp veritabanını bir varlık sanıyor ve imaja kopyalıyor.
   * Bu, geliştirme verisinin (gerçek davetli isim ve telefonlarının)
   * sunucuya taşınması demek olurdu. Veritabanı çalışma anında,
   * bağlanan diskte oluşur.
   */
  outputFileTracingExcludes: {
    "*": [".data/**"],
  },
};

export default nextConfig;
