document.addEventListener('DOMContentLoaded', () => {
    // Muat data tersimpan
    chrome.storage.local.get(['groqKey', 'openRouterKey', 'providerAktif', 'modelOR'], (result) => {
        if (result.groqKey) document.getElementById('keyGroq').value = result.groqKey;
        if (result.openRouterKey) document.getElementById('keyOpenRouter').value = result.openRouterKey;
        if (result.providerAktif) document.getElementById('pilihanProvider').value = result.providerAktif;
        if (result.modelOR) document.getElementById('pilihanModelOR').value = result.modelOR;
        
        aturTampilanMenu(); // Jalankan sekali saat halaman dimuat
    });
});

// Deteksi perubahan pada dropdown Provider
document.getElementById('pilihanProvider').addEventListener('change', aturTampilanMenu);

function aturTampilanMenu() {
    const provider = document.getElementById('pilihanProvider').value;
    const grupModel = document.getElementById('grupModelOR');
    
    if (provider === 'openrouter') {
        grupModel.style.display = 'block'; // Tampilkan menu model
    } else {
        grupModel.style.display = 'none'; // Sembunyikan menu model
    }
}

document.getElementById('simpanBtn').addEventListener('click', () => {
    const dataSimpan = {
        groqKey: document.getElementById('keyGroq').value.trim(),
        openRouterKey: document.getElementById('keyOpenRouter').value.trim(),
        providerAktif: document.getElementById('pilihanProvider').value,
        modelOR: document.getElementById('pilihanModelOR').value
    };

    chrome.storage.local.set(dataSimpan, () => {
        document.getElementById('status').textContent = 'Pengaturan Berhasil Tersimpan!';
        setTimeout(() => document.getElementById('status').textContent = '', 2500);
    });
});