# Incident Management Dashboard

Bu proje, sistem kesintilerini ve olayları (incident) yönetmek, takip etmek ve listelemek için geliştirilmiş bir Full-Stack web uygulamasıdır. 

## 🚀 Kurulum ve Çalıştırma Adımları

Proje yerel (local) ortamda çalışacak şekilde yapılandırılmıştır.

### Ön Koşullar
- Node.js (v18 veya üzeri)
- PostgreSQL (Yerel ortamda 5432 portunda çalışır durumda olmalıdır)

### 1. Veritabanı ve Backend Kurulumu
Ayrı bir terminal açın ve backend dizinine gidin:
\`\`\`bash
cd backend
npm install
\`\`\`

\`backend\` dizininde bir \`.env\` dosyası oluşturun ve PostgreSQL bağlantı dizesini ekleyin:
\`\`\`env
DATABASE_URL="postgresql://kullanici_adi:sifre@127.0.0.1:5432/incident_db?schema=public"
\`\`\`

Veritabanı şemasını oluşturun ve backend'i başlatın:
\`\`\`bash
npx prisma db push
npm run start:dev
\`\`\`
*Backend http://127.0.0.1:3000 adresinde çalışmaya başlayacaktır.*

### 2. Frontend Kurulumu
Yeni bir terminal açın ve frontend dizinine gidin:
\`\`\`bash
cd frontend
npm install
\`\`\`

\`frontend\` dizininde bir \`.env.local\` dosyası oluşturun:
\`\`\`env
NEXT_PUBLIC_API_URL=http://127.0.0.1:3000
\`\`\`

Frontend'i başlatın:
\`\`\`bash
npm run dev
\`\`\`
*Arayüze http://localhost:3001 adresinden erişebilirsiniz.*

---

## 🛠 Kullanılan Teknolojiler

- **Frontend:** Next.js (React), Tailwind CSS, Axios
- **Backend:** NestJS (Node.js), TypeScript
- **Veritabanı & ORM:** PostgreSQL, Prisma
- **Gerçek Zamanlı İletişim:** WebSocket (Socket.io)

---

## 🏗 Mimari Yaklaşım

- **Monorepo Benzeri Yapı:** Hem frontend hem de backend kodları, geliştirme ve inceleme kolaylığı açısından aynı repository altında izole klasörlerde (`/frontend` ve `/backend`) tutulmuştur.
- **RESTful API & Validasyon:** Backend mimarisi REST standartlarına uygun tasarlanmış, gelen tüm istekler `ValidationPipe` ve DTO'lar (Data Transfer Objects) ile sıkı bir şekilde denetlenmiştir.
- **Güvenli Ağ İletişimi:** DNS çözümleme (localhost IPv4/IPv6) farklılıklarından doğabilecek CORS ve bağlantı hatalarını önlemek adına, servisler arası iletişim evrensel `127.0.0.1` IP'si üzerinden sabitlenmiştir.

---

## 📌 Yapılan Varsayımlar

- Uygulamanın değerlendirme aşamasında kolayca incelenebilmesi için kimlik doğrulama (Authentication/Authorization) adımları kapsam dışı bırakılmış veya basitleştirilmiştir.
- Projeyi inceleyen ekibin kendi yerel PostgreSQL sunucularına sahip olduğu varsayılmış, bu nedenle sistem doğrudan `localhost/127.0.0.1` üzerinden veritabanına bağlanacak şekilde ayarlanmıştır.
- Kurulum karmaşasını (işletim sistemi / Prisma binary uyuşmazlıkları) önlemek ve projenin "çalışan bir çekirdek sistem" önceliğine sadık kalmak adına Docker entegrasyonu bu fazda bilerek dışarıda bırakılmış, yalın `npm` scriptleri tercih edilmiştir.

---

## 🔮 Daha Fazla Zaman Olsaydı Yapılacak Geliştirmeler

- **Kapsamlı Test Yazılımı:** Jest ile backend birim (unit) testleri ve Cypress/Playwright ile frontend uçtan uca (E2E) testleri eklenebilirdi.
- **Dockerizasyon ve CI/CD:** Projenin her ortamda %100 aynı çalışmasını garanti etmek için tam teşekküllü bir `docker-compose` mimarisi kurulup, GitHub Actions ile otomatik derleme hatları oluşturulabilirdi.
- **Gelişmiş Filtreleme:** Frontend tarafında incident logları için tarih aralığına, servislere veya önem derecesine göre çoklu filtreleme ve arama özellikleri eklenebilirdi.