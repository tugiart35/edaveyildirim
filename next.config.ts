import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Veritabanı dosyası derleme çıktısına girmemeli.
   *
   * Next'in dosya izleyicisi `path.join(process.cwd(), ".data", ...)`
   * ifadesini çözüp veritabanını bir varlık sanıyor ve çıktıya
   * kopyalıyor. Bu, geliştirme verisinin (gerçek davetli isim ve
   * telefonlarının) sunucuya taşınması demek olurdu. Veritabanı
   * çalışma anında, kalıcı diskte oluşur.
   */
  outputFileTracingExcludes: {
    "*": [".data/**"],
  },
};

export default nextConfig;
