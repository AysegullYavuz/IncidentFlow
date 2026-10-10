# IncidentFlow — Technical Incident & Ops Management Platform

IncidentFlow, mikroservis ve dağıtık sistem mimarilerinde ortaya çıkan operasyonel arızaları, servis kesintilerini ve kritik sistem hatalarını (deadlock, timeout, crash) merkezi olarak izlemek, önceliklendirmek ve mühendislik ekiplerine atamak için tasarlanmış modern bir **Full-Stack Olay Yönetim (Incident Management)** platformudur.

![IncidentFlow Banner](https://img.shields.io/badge/Architecture-Full--Stack-blue)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![Django REST](https://img.shields.io/badge/Django_REST-Framework-red?logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18_TypeScript-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Docker-336791?logo=postgresql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)

---

## Temel Özellikler

- **Operasyonel KPI Metrikleri:** Toplam olay, açık bekleyen, işlemde olan ve çözülen olayları anlık olarak hesaplayan durum göstergeleri.
- **Canlı Veri Görselleştirme:** Recharts entegrasyonu ile SLA öncelik seviyeleri (Bar Chart) ve çözüm durum oranları (Donut Chart) dinamik grafik analitiği.
- **AI Tabanlı Öncelik Motoru (Heuristic Model):** Hata başlığı ve stack trace loglarını anlık tarayarak (`deadlock`, `crash`, `timeout`, `security`, `kesinti`) kritiklik seviyesini otomatik tespit eden akıllı öneri mekanizması.
- **Mühendis Atama & Rol Yönetimi:** Olayları ekipteki ilgili mühendislere tek tıkla delege etme ve durumunu canlı güncelleme.
- **Gelişmiş Filtreleme & Arama:** Metin araması, öncelik (P1/Critical - Low) ve durum (Open, In Progress, Resolved) bazlı anlık süzme.
- **Raporlama & CSV Export:** UTF-8 BOM destekli tek tıkla filtrelenmiş verileri denetim ve operasyon sunumları için CSV formatında dışa aktarma.
- **SaaS Dashboard UI/UX:** Sidebar sekmeli (Dashboard, Olay Kayıtları, Sistem Ayarları) ve modüler modal pencereli ergonomik arayüz.

---

## Sistem Mimarisi

IncidentFlow/
├── backend/                  # Python & Django REST Framework
│   ├── core/                 # Django Proje Çekirdeği (settings, urls)
│   ├── incidents/            # Olay & Kullanıcı Yönetimi Modülü
│   │   ├── models.py         # PostgreSQL Incident Veri Modeli
│   │   ├── serializers.py    # DRF Serializer Tanımları
│   │   ├── views.py          # ViewSet API Kontrolcüleri
│   │   └── urls.py           # API Route Yönlendirmeleri
│   └── manage.py
│
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── AnalyticsChart.tsx # Recharts Görselleştirme Bileşeni
│   │   ├── api.ts            # Axios Tabanlı Merkezi API Servisi
│   │   ├── types.ts          # TypeScript Arayüzleri ve Tipleri
│   │   ├── App.tsx           # Dashboard, State ve Modal Mantığı
│   │   └── index.css         # Modern SaaS Tasarım Stilleri
│   └── package.json
│
└── docker-compose.yml / Docker PostgreSQL Konteyneri

---

## Teknoloji Yığını

| Katman | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Backend** | Python 3.12, Django, Django REST Framework | RESTful CRUD API, ORM, Serializers |
| **Frontend** | React, TypeScript, Vite | Hızlı SPA mimarisi, güçlü tip güvenliği |
| **Veritabanı** | PostgreSQL (Dockerized) | İlişkisel veri modeli ve foreign key yapıları |
| **Grafik & Analitik**| Recharts | Etkileşimli çubuk ve donut grafikler |
| **İkon & Stil** | Lucide-React, Pure CSS | Modern SaaS teması, mikro rozetler |
| **Veri Entegrasyonu**| Axios | Asenkron API veri alışverişi |

---

## API Uç Noktaları (Endpoints)

| Metot | Uç Nokta | Açıklama |
| :--- | :--- | :--- |
| `GET` | `/api/incidents/` | Tüm teknik olay kayıtlarını listeler |
| `POST` | `/api/incidents/` | Yeni olay bildirimi oluşturur |
| `PATCH` | `/api/incidents/{id}/` | Olay durumunu veya atanan mühendisi günceller |
| `DELETE` | `/api/incidents/{id}/` | Olay kaydını siler |
| `GET` | `/api/users/` | Sistemde kayıtlı mühendisleri listeler |

---
## Kurulum & Çalıştırma

### 1. PostgreSQL (Docker)
```bash
docker run --name incidentflow-postgres -e POSTGRES_DB=incidentflow_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

cd frontend
npm install
npm run dev
