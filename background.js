chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "tanyaAI") {
        chrome.storage.local.get(['groqKey', 'openRouterKey', 'providerAktif', 'modelOR'], async (result) => {
            const prompt = `Anda adalah asisten AI penjawab ujian. Baca soal berikut dan berikan jawaban HANYA dalam format Array JSON murni.
                            ATURAN:
                            1. Pilihan Ganda biasa: Masukkan opsi benarnya.
                            2. Isian Singkat: Masukkan teks jawabannya saja.
                            3. Checkbox (jawaban benar lebih dari 1, misal bilangan prima): Pisahkan tiap angka/jawaban jadi item array terpisah. Contoh: ["7", "11"].
                            4. Grid/Matriks (baris & kolom): Gabungkan nama baris dan jawaban kolomnya. Contoh: ["Ikan Paus Mamalia", "Ular Reptil", "Katak Amfibi"].
                            5. DILARANG memberi penjelasan atau tag markdown. HANYA array mentah.
                            Teks Soal:
                            ${request.soal}`;
            const provider = result.providerAktif || 'groq';

            // ==========================================
            // LOGIKA GROQ API
            // ==========================================
            if (provider === 'groq') {
                if (!result.groqKey) {
                    sendResponse({ error: "API Key Groq belum diisi!" });
                    return;
                }
                try {
                    console.log("[Sistem] Menggunakan Groq API...");
                    const res = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
                        method: "POST",
                        headers: { 
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${result.groqKey}` 
                        },
                        body: JSON.stringify({ 
                            model: "openai/gpt-oss-120b", 
                            messages: [{ role: "user", content: prompt }],
                            temperature: 0.1 
                        })
                    });
                    const data = await res.json();
                    if (res.ok) {
                        sendResponse({ jawaban: data.choices[0].message.content.trim() });
                    } else {
                        sendResponse({ error: `Groq Error: ${data.error ? data.error.message : 'Server error'}` });
                    }
                } catch (err) {
                    sendResponse({ error: "Gagal memanggil Groq: " + err.message });
                }
            } 
            
            // ==========================================
            // LOGIKA OPENROUTER API
            // ==========================================
            else if (provider === 'openrouter') {
                if (!result.openRouterKey) {
                    sendResponse({ error: "API Key OpenRouter belum diisi!" });
                    return;
                }

                let daftarModel = [];
                // Cek apakah user memilih "auto" atau model spesifik
                if (!result.modelOR || result.modelOR === 'auto') {
                    daftarModel = [
                        "deepseek/deepseek-v4-flash-0731",
                        "qwen/qwen3.8-27b",
                        "qwen/qwen3.7-flash",
                        "qwen/qwen-2-7b-instruct:free",           
                        "google/gemma-4-26b-a4b-it:free",  
                        "minimax/minimax-m3:free",
                        "google/gemma-4-31b-it:free"
                    ];
                } else {
                    daftarModel = [result.modelOR]; 
                }

                let berhasilMenjawab = false;
                let teksJawaban = "";
                let errorTerakhir = "";

                for (let i = 0; i < daftarModel.length; i++) {
                    const modelAktif = daftarModel[i];
                    console.log(`[Sistem] Menggunakan OpenRouter (${modelAktif})...`);
                    
                    try {
                        const res = await fetch(`https://openrouter.ai/api/v1/chat/completions`, {
                            method: "POST",
                            headers: { 
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${result.openRouterKey}` 
                            },
                            body: JSON.stringify({ 
                                model: modelAktif, 
                                messages: [{ role: "user", content: prompt }],
                                temperature: 0.1 
                            })
                        });
                        
                        const data = await res.json();
                        if (res.ok) {
                            teksJawaban = data.choices[0].message.content.trim();
                            berhasilMenjawab = true;
                            break; 
                        } else {
                            errorTerakhir = data.error ? data.error.message : `HTTP Error ${res.status}`;
                            console.warn(`[OpenRouter] Model ${modelAktif} gagal. Mencoba cadangan...`);
                            continue; 
                        }
                    } catch (err) {
                        errorTerakhir = err.message;
                        continue;
                    }
                }

                if (berhasilMenjawab) {
                    sendResponse({ jawaban: teksJawaban });
                } else {
                    sendResponse({ error: `Semua model gagal atau limit. Error: ${errorTerakhir}` });
                }
            }
        });
        return true; 
    }
});