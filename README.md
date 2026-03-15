# 🗺️ Date Spots Map — Deploy Guide

## Struktur File
```
datespots/
├── api/
│   └── spots.js        ← Proxy ke Notion API (bypass CORS)
├── public/
│   └── index.html      ← Leaflet map viewer
├── vercel.json         ← Konfigurasi Vercel
└── README.md
```

---

## 🚀 Cara Deploy ke Vercel (Zero Terminal)

### Step 1 — Bikin akun Vercel
1. Buka [vercel.com](https://vercel.com)
2. Klik **Sign Up** → pilih **Continue with GitHub**
3. Bikin akun GitHub kalau belum punya (gratis)

### Step 2 — Upload project
1. Di Vercel dashboard, klik **Add New → Project**
2. Pilih **"Import from a different source"** atau klik **Deploy without a repository**
3. Drag & drop folder `datespots` ini ke halaman upload

### Step 3 — Set Environment Variables


---

## 📝 Cara Nambahin Spot Baru

Tinggal chat ke Claude:
> "Tadi ke [nama tempat], [cerita], rating [X], mood [Y], link gmaps: [url], foto: [url]"

Claude langsung input ke Notion. Setelah itu klik **Refresh** di map. Done! 🔥

---

## 🔄 Update Data
Setiap klik tombol **↻ Refresh** di map, data langsung pull terbaru dari Notion.
