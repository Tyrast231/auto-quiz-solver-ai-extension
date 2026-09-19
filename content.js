let sistemAktif = false; 

function buatOverlayAI() {
    if (document.getElementById('ai-overlay-container')) return;
    const container = document.createElement('div');
    container.id = 'ai-overlay-container';
    container.style.position = 'fixed';
    container.style.top = '0'; container.style.left = '0';
    container.style.width = '100vw'; container.style.height = '100vh';
    container.style.zIndex = '999999'; 
    container.style.backgroundColor = 'rgba(0, 150, 255, 0.1)'; 
    container.style.boxShadow = 'inset 0 0 80px rgba(0, 150, 255, 0.3)';
    container.style.pointerEvents = 'none'; 

    const btnStop = document.createElement('button');
    btnStop.innerText = '⏹ Setop';
    btnStop.style.position = 'absolute';
    btnStop.style.bottom = '40px'; btnStop.style.left = '50%';
    btnStop.style.transform = 'translateX(-50%)';
    btnStop.style.padding = '12px 24px';
    btnStop.style.fontSize = '16px'; btnStop.style.fontWeight = 'bold';
    btnStop.style.color = 'white'; btnStop.style.backgroundColor = '#dc3545'; 
    btnStop.style.border = 'none'; btnStop.style.borderRadius = '50px'; 
    btnStop.style.cursor = 'pointer'; btnStop.style.pointerEvents = 'auto'; 
    btnStop.addEventListener('click', hentikanSistem);

    container.appendChild(btnStop); document.body.appendChild(container);
}

function hentikanSistem() {
    sistemAktif = false;
    const overlay = document.getElementById('ai-overlay-container');
    if (overlay) overlay.remove();
}

function klikSepertiManusia(elemen) {
    if (!elemen) return;
    elemen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => {
        elemen.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
        elemen.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
        elemen.click(); 
    }, 200);
}

function isiTeksSepertiManusia(elemen, teks) {
    if (!elemen) return;
    elemen.scrollIntoView({ behavior: 'smooth', block: 'center' });
    elemen.focus();
    elemen.value = teks;
    elemen.dispatchEvent(new Event('input', { bubbles: true }));
    elemen.dispatchEvent(new Event('change', { bubbles: true }));
}

function kerjakanSoalOtomatis() {
    if (!sistemAktif) return; 
    const teksSoal = document.body.innerText.trim(); 
    if (!teksSoal || teksSoal.length < 5) return; 

    chrome.runtime.sendMessage({ action: "tanyaAI", soal: teksSoal }, (response) => {
        if (!sistemAktif) return;
        if (chrome.runtime.lastError || response.error) { hentikanSistem(); return; }

        let daftarJawaban = [];
        let teksMentah = response.jawaban.trim();

        try {
            let jsonBersih = teksMentah.replace(/```json/gi, '').replace(/```/g, '').trim();
            daftarJawaban = JSON.parse(jsonBersih);
            if (!Array.isArray(daftarJawaban)) daftarJawaban = [jsonBersih];
        } catch (e) {
            daftarJawaban = teksMentah.split('\n').map(j => j.trim()).filter(j => j.length > 0);
        }

        console.log("AI Menjawab:", daftarJawaban);

        // Radar Universal. Menggabungkan pencarian Google Forms (role) dan HTML biasa (button, label, input)
        const opsiPilihan = document.querySelectorAll('div[role="radio"], div[role="checkbox"], button, label, input[type="radio"]');
        const kolomTeks = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
        let indexKolomTeks = 0;
        let jumlahDieksekusi = 0;

        const formatTeks = (str) => str.toString().toLowerCase().replace(/[^a-z0-9]/g, "");

        for (let jawaban of daftarJawaban) {
            let kataKunci = jawaban.toString().toLowerCase().trim();
            if (kataKunci.length === 0) continue;

            let ketemuDiPilihan = false;
            let arrayKata = kataKunci.split(/\s+/).filter(k => k.length > 2); 

            for (let opsi of opsiPilihan) {
                if (opsi.offsetParent === null) continue; 
                // Mencegah sistem mengeklik tombol "Hentikan AI" sendiri
                if (opsi.innerText === '⏹ Hentikan AI') continue; 
                
                let teksOpsi = opsi.getAttribute('aria-label') || opsi.getAttribute('data-value') || opsi.innerText || opsi.textContent || "";
                teksOpsi = teksOpsi.toLowerCase();
                
                let opsiBersih = formatTeks(teksOpsi);
                let kunciBersih = formatTeks(kataKunci);
                
                let matchGrid = (arrayKata.length > 1 && arrayKata.every(kata => teksOpsi.includes(kata)));

                // Logika toleransi tinggi agar bisa mencocokkan soal angka pendek (misal jawaban "60") dan teks berawalan A, B, C.
                if (opsiBersih === kunciBersih || 
                   (opsiBersih.includes(kunciBersih) && kunciBersih.length > 2) || 
                   matchGrid ||
                   opsiBersih.replace(/^[a-e]/, '') === kunciBersih) { 
                    
                    let targetKlik = opsi.closest('div[role="radio"], div[role="checkbox"], label') || opsi;
                    targetKlik.style.outline = "4px solid #00ff00"; 
                    targetKlik.style.backgroundColor = "#eaffea";
                    klikSepertiManusia(targetKlik);
                    
                    ketemuDiPilihan = true;
                    jumlahDieksekusi++;
                    break; 
                }
            }

            if (!ketemuDiPilihan && indexKolomTeks < kolomTeks.length) {
                let elemenTeks = kolomTeks[indexKolomTeks];
                while(elemenTeks && elemenTeks.offsetParent === null) {
                    indexKolomTeks++;
                    elemenTeks = kolomTeks[indexKolomTeks];
                }
                
                if (elemenTeks) {
                    elemenTeks.style.outline = "4px solid #00ff00";
                    isiTeksSepertiManusia(elemenTeks, jawaban);
                    jumlahDieksekusi++;
                    indexKolomTeks++;
                }
            }
        }

        if (jumlahDieksekusi > 0) {
            setTimeout(() => {
                if (!sistemAktif) return; 
                
                // Radar Navigasi Universal untuk form biasa (a, input, button) dan Google (div[role="button"])
                const elemenNavigasi = document.querySelectorAll('div[role="button"], button, a, input[type="button"], input[type="submit"]');
                let tombolNext = null;
                let tombolKirim = null;

                for (let nav of elemenNavigasi) {
                    if (nav.offsetParent === null) continue;
                    let teksNav = (nav.getAttribute('aria-label') || nav.value || nav.innerText || nav.textContent || "").trim().toLowerCase();
                    
                    if (teksNav.includes("berikutnya") || teksNav.includes("next") || teksNav.includes("selanjutnya")) {
                        tombolNext = nav.closest('div[role="button"]') || nav;
                        break;
                    } else if (teksNav.includes("kirim") || teksNav.includes("submit") || teksNav.includes("selesai")) {
                        tombolKirim = nav; 
                    }
                }

                if (tombolNext) {
                    klikSepertiManusia(tombolNext);
                    setTimeout(kerjakanSoalOtomatis, 3500); 
                } else if (tombolKirim) {
                    alert("Kuis / Form selesai! Silakan periksa ulang jawaban Anda sebelum menekan tombol Kirim.");
                    hentikanSistem();
                } else {
                    hentikanSistem(); 
                }
            }, 3000); 
        } else {
            console.warn("AI tidak bisa menemukan tombol/kolom yang cocok di layar.");
            hentikanSistem();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'a') {
        if (!sistemAktif) {
            sistemAktif = true;
            buatOverlayAI();
            kerjakanSoalOtomatis();
        }
    }
});