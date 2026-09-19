# Auto Quiz Solver Ai - Chrome Extension

🌍 Choose Language / Pilih Bahasa: 
[🇬🇧 English](#-english) | [🇮🇩 Bahasa Indonesia](#-bahasa-indonesia)

---

## 🇬🇧 English

A smart AI-powered Google Chrome extension that automates multiple-choice quizzes and Google Forms using Large Language Models (LLMs). Built to demonstrate advanced DOM manipulation, third-party API integration, and an automated failover system.

### ✨ Key Features
- **Universal DOM Scanner**: Effortlessly reads and executes questions from standard HTML quizzes to complex Google Forms structures.
- **Human-Like Interaction**: Utilizes *MouseEvent* injection to bypass basic anti-bot detections.
- **Smart API Failover**: Integrated with OpenRouter and Groq. If one AI model experiences a rate limit, the system automatically switches to a backup model in milliseconds.
- **Secure Key Storage**: Secure API Key management using the `chrome.storage.local` interface.

### 🚀 How to Install
1. Download or clone this repository.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select this repository folder.
5. Right-click the extension icon, select **Options**, and input your API Keys.

---

## 🇮🇩 Bahasa Indonesia

Ekstensi Google Chrome cerdas yang mengotomatiskan pengerjaan kuis pilihan ganda dan Google Forms menggunakan integrasi Large Language Models (LLM). Proyek ini dibangun untuk mendemonstrasikan manipulasi DOM tingkat lanjut, integrasi API pihak ketiga, dan sistem *failover* mandiri.

### ✨ Fitur Utama
- **Universal DOM Scanner**: Mampu membaca dan mengeksekusi soal dari kuis biasa hingga struktur kompleks Google Forms.
- **Human-Like Interaction**: Menggunakan injeksi *MouseEvent* untuk melewati deteksi anti-bot dasar.
- **Smart API Failover**: Terintegrasi dengan OpenRouter dan Groq. Jika satu model AI mengalami *rate limit*, sistem otomatis melompat ke model cadangan dalam hitungan milidetik.
- **Secure Key Storage**: Manajemen API Key aman menggunakan antarmuka `chrome.storage.local`.

### 🚀 Cara Instalasi
1. Unduh atau *clone* repositori ini.
2. Buka Google Chrome dan masuk ke `chrome://extensions/`.
3. Aktifkan **Developer mode** di pojok kanan atas.
4. Klik **Load unpacked** dan pilih folder repositori ini.
5. Klik kanan pada ikon ekstensi, pilih **Options**, dan masukkan API Key Anda.

---

## 📊 System Architecture & Flow (Arsitektur Sistem)

flowchart TD
    A([Mulai: User Tekan Alt + A]) --> B{Sistem Aktif?}
    B -- Ya --> Z([Abaikan])
    B -- Tidak --> C[Aktifkan Overlay & Pindai Teks Halaman]
    
    C --> D{Teks Valid & Cukup Panjang?}
    D -- Tidak --> E([Hentikan Sistem])
    D -- Ya --> F[Kirim Prompt ke background.js]
    
    F --> G{Cek Pengaturan Provider API}
    G -- Groq --> H[Panggil API Groq]
    G -- OpenRouter --> I[Panggil Model Utama OpenRouter]
    
    I --> J{Terkena Limit / Error?}
    J -- Ya --> K[Panggil Model Cadangan / Fallback]
    K --> J
    J -- Tidak --> L[Terima Teks AI]
    H --> L
    
    L --> M[Konversi Teks AI Menjadi Array JSON]
    M --> N[Mulai Looping Setiap Jawaban AI]
    
    N --> O{Cari Kecocokan di Layar}
    O -- Cocok dengan Tombol/Radio/Grid --> P[Simulasi Klik Manusia]
    O -- Tidak Cocok --> Q{Ada Kolom Teks Kosong?}
    Q -- Ya --> R[Ketik Otomatis ke Kolom Teks]
    Q -- Tidak --> S[Lanjut ke Jawaban Berikutnya]
    
    P --> T
    R --> T
    S --> T
    
    T{Semua Jawaban AI Telah Dicek?}
    T -- Belum --> O
    T -- Sudah --> U{Cari Tombol Navigasi}
    
    U -- Tombol Berikutnya/Next --> V[Simulasi Klik Berikutnya]
    V --> W[Jeda 3.5 Detik]
    W --> C
    
    U -- Tombol Kirim/Submit --> X[Tampilkan Alert Peninjauan Manual]
    X --> Y([Hentikan Sistem])
    
    U -- Tidak Ditemukan --> Y
