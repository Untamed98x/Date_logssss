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
Sebelum deploy, klik **Environment Variables** dan tambah:

| Name | Value |
|------|-------|
| `NOTION_TOKEN` | Token Notion lo (dari notion.so/my-integrations) |
| `NOTION_DB_ID` | `169ff260f2a7415cbb98ac89d586be50` |

### Step 4 — Deploy!
Klik **Deploy** — tunggu ~30 detik. Vercel kasih URL gratis kayak:
`https://datespots-xxx.vercel.app`

---

## 🔑 Cara Dapet Notion Token

1. Buka [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Klik **New integration**
3. Nama: `Date Spots Map`, pilih workspace lo
4. Klik **Submit** → copy **Internal Integration Token**
5. Buka database Date Spots Log di Notion → klik `...` → **Connections** → tambah integration lo

---

## 📝 Cara Nambahin Spot Baru

Tinggal chat ke Claude:
> "Tadi ke [nama tempat], [cerita], rating [X], mood [Y], link gmaps: [url], foto: [url]"

Claude langsung input ke Notion. Setelah itu klik **Refresh** di map. Done! 🔥

---

## 🔄 Update Data
Setiap klik tombol **↻ Refresh** di map, data langsung pull terbaru dari Notion.
