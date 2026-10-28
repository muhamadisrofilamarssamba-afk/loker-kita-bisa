// 1. KONFIGURASI FIREBASE (Terhubung ke Realtime Database Milikmu)
const firebaseConfig = {
    databaseURL: "https://lokerkerja-f6a20-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "lokerkerja-f6a20",
    authDomain: "lokerkerja-f6a20.firebaseapp.com",
    storageBucket: "lokerkerja-f6a20.appspot.com"
};

// Inisialisasi Firebase App & Realtime Database
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// PIN MASTER ADMIN WEB
const ADMIN_MASTER_PIN = "admin123";

let jobsData = [];
let selectedJobForApply = null;

// 2. REALTIME LISTENER (Sync Data Otomatis)
document.addEventListener("DOMContentLoaded", () => {
    db.ref('jobs').on('value', (snapshot) => {
        const data = snapshot.val();
        jobsData = [];

        if (data) {
            Object.keys(data).forEach((key) => {
                jobsData.unshift({
                    id: key,
                    ...data[key]
                });
            });
        }

        renderJobFeed(jobsData);
        renderHRDList();
    });
});

// 3. TAMBAH LOKER BARU DENGAN PIN RAHASIA
function handlePostJob(event) {
    event.preventDefault();

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Mempublikasikan...";

    const title = document.getElementById("post-title").value.trim();
    const company = document.getElementById("post-company").value.trim();
    const location = document.getElementById("post-location").value.trim();
    const type = document.getElementById("post-type").value;
    const salary = document.getElementById("post-salary").value.trim();
    let wa = document.getElementById("post-wa").value.trim();
    const skillsRaw = document.getElementById("post-skills").value;
    const pin = document.getElementById("post-pin").value.trim();

    // Sanitasi Format WhatsApp
    wa = wa.replace(/[^0-9]/g, '');
    if (wa.startsWith("0")) {
        wa = "62" + wa.slice(1);
    }

    const skillsArr = skillsRaw.split(",").map(s => s.trim()).filter(s => s.length > 0);

    const newJob = {
        title: title,
        company: company,
        location: location,
        type: type,
        salary: salary,
        skills: skillsArr,
        hrdWa: wa,
        pin: pin,
        date: new Date().toISOString().split('T')[0]
    };

    db.ref('jobs').push(newJob, (error) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Publikasikan Lowongan SMABAJA`;

        if (error) {
            alert("Gagal mempublikasikan lowongan: " + error.message);
        } else {
            alert("Berhasil! Lowongan dipublikasikan di SMABAJA. Simpan PIN Anda untuk kebutuhan menghapus lowongan nanti.");
            document.getElementById("hrd-post-form").reset();
        }
    });
}

// 4. HAPUS LOKER DENGAN VERIFIKASI PIN
function deleteJob(id) {
    const targetJob = jobsData.find(j => j.id === id);
    if (!targetJob) return;

    const inputPin = prompt(`Konfirmasi Penghapusan Lowongan "${targetJob.title}":\n\nMasukkan PIN Rahasia HRD Anda (atau PIN Master Admin):`);

    if (inputPin === null) return;

    if (inputPin === targetJob.pin || inputPin === ADMIN_MASTER_PIN) {
        db.ref('jobs/' + id).remove()
            .then(() => alert("Akses Diterima: Lowongan berhasil dihapus dari database SMABAJA."))
            .catch(err => alert("Gagal menghapus: " + err.message));
    } else {
        alert("Akses Ditolak: PIN salah! Hanya HRD pembuat lowongan atau Admin yang berhak menghapus.");
    }
}

// 5. RENDER DAFTAR LOKER PENCARI KERJA
function renderJobFeed(dataToRender) {
    const container = document.getElementById("job-container");
    const emptyState = document.getElementById("empty-state");
    const badgeCount = document.getElementById("job-count-badge");

    container.innerHTML = "";
    badgeCount.innerText = `${dataToRender.length} Lowongan Ditemukan`;

    if (dataToRender.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    } else {
        emptyState.classList.add("hidden");
    }

    dataToRender.forEach((job) => {
        const skillsTags = job.skills.map(s => `<span class="bg-amber-100/60 text-amber-900 border border-amber-300 text-[11px] px-2 py-0.5 rounded font-medium">${s}</span>`).join(" ");

        const cardHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-300 p-6 flex flex-col justify-between h-full relative">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs bg-red-50 text-red-800 font-semibold px-2.5 py-1 rounded border border-red-200">${job.type}</span>
                        <span class="text-[11px] text-gray-400">${job.date}</span>
                    </div>

                    <h3 class="text-lg font-bold text-gray-900 leading-snug">${job.title}</h3>
                    <p class="text-sm font-semibold text-red-800 mb-3">${job.company}</p>

                    <div class="space-y-1.5 mb-4 text-xs text-gray-600">
                        <p class="flex items-center"><i class="fa-solid fa-location-dot w-4 text-amber-600"></i> ${job.location}</p>
                        <p class="flex items-center"><i class="fa-solid fa-money-bill-wave w-4 text-amber-600"></i> ${job.salary}</p>
                    </div>

                    <div class="mb-5">
                        <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">Kualifikasi Skill:</p>
                        <div class="flex flex-wrap gap-1">
                            ${skillsTags}
                        </div>
                    </div>
                </div>

                <button onclick="openApplyModal('${job.id}')" class="w-full bg-red-800 hover:bg-red-900 text-amber-300 font-bold py-2 rounded-lg text-sm transition duration-300 shadow-sm flex items-center justify-center gap-2 border border-amber-500">
                    <i class="fa-solid fa-paper-plane"></i> Lamar Sekarang
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// 6. RENDER DAFTAR LOKER MANAJEMEN HRD
function renderHRDList() {
    const container = document.getElementById("hrd-job-list");
    const countLabel = document.getElementById("hrd-job-count");

    container.innerHTML = "";
    countLabel.innerText = `${jobsData.length} Total Loker Aktif`;

    if (jobsData.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Belum ada lowongan terdaftar di SMABAJA.</p>`;
        return;
    }

    jobsData.forEach((job) => {
        const itemHTML = `
            <div class="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${job.title}</h4>
                    <p class="text-xs text-gray-600">${job.company} • ${job.location} (${job.type})</p>
                    <p class="text-[11px] text-gray-400 mt-1"><i class="fa-solid fa-lock text-amber-600 mr-1"></i> Terproteksi PIN HRD</p>
                </div>
                <button onclick="deleteJob('${job.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded text-xs border border-red-200 transition flex items-center gap-1">
                    <i class="fa-solid fa-lock-open"></i> Hapus (Butuh PIN)
                </button>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}

// 7. FILTER PENCARIAN LIVE
function filterJobs() {
    const keyword = document.getElementById("search-keyword").value.toLowerCase();
    const type = document.getElementById("filter-type").value;

    const filtered = jobsData.filter((job) => {
        const matchKeyword = job.title.toLowerCase().includes(keyword) || 
                             job.company.toLowerCase().includes(keyword) || 
                             job.location.toLowerCase().includes(keyword);
        const matchType = type === "" || job.type === type;

        return matchKeyword && matchType;
    });

    renderJobFeed(filtered);
}

// 8. LOGIKA MODAL LAMARAN & AI SCORE
function openApplyModal(jobId) {
    selectedJobForApply = jobsData.find(j => j.id === jobId);
    if (!selectedJobForApply) return;

    document.getElementById("modal-job-title").innerText = selectedJobForApply.title;
    document.getElementById("modal-company-name").innerText = selectedJobForApply.company;

    const modal = document.getElementById("apply-modal");
    modal.classList.remove("hidden-modal");
    document.body.classList.add("modal-open");

    calculateRealtimeMatch();
}

function closeModal() {
    const modal = document.getElementById("apply-modal");
    modal.classList.add("hidden-modal");
    document.body.classList.remove("modal-open");
    document.getElementById("apply-form").reset();
    selectedJobForApply = null;
}

function calculateRealtimeMatch() {
    if (!selectedJobForApply) return;

    const userSkillsInput = document.getElementById("applicant-skills").value.toLowerCase();
    const userSkillsArr = userSkillsInput.split(",").map(s => s.trim()).filter(s => s.length > 0);
    const requiredSkills = selectedJobForApply.skills.map(s => s.toLowerCase());

    if (userSkillsArr.length === 0 || requiredSkills.length === 0) {
        document.getElementById("modal-ai-score-val").innerText = "0%";
        document.getElementById("modal-ai-score-label").innerText = "Ketik skill Anda di atas";
        return;
    }

    let matches = 0;
    userSkillsArr.forEach(uSkill => {
        if (requiredSkills.some(reqSkill => reqSkill.includes(uSkill) || uSkill.includes(reqSkill))) {
            matches++;
        }
    });

    let score = Math.round((matches / requiredSkills.length) * 100);
    if (score > 100) score = 100;

    const scoreValEl = document.getElementById("modal-ai-score-val");
    const scoreLabelEl = document.getElementById("modal-ai-score-label");

    scoreValEl.innerText = `${score}%`;

    if (score >= 75) {
        scoreValEl.className = "text-xl font-black text-green-700";
        scoreLabelEl.innerText = "Sangat Cocok! Rekomendasi Tinggi";
    } else if (score >= 40) {
        scoreValEl.className = "text-xl font-black text-amber-600";
        scoreLabelEl.innerText = "Cukup Cocok";
    } else {
        scoreValEl.className = "text-xl font-black text-red-700";
        scoreLabelEl.innerText = "Kurang Cocok dengan Kriteria";
    }
}

// 9. SUBMIT LAMARAN KE WHATSAPP HRD
function submitApplication(event) {
    event.preventDefault();

    if (!selectedJobForApply) return;

    const name = document.getElementById("applicant-name").value.trim();
    const skills = document.getElementById("applicant-skills").value.trim();
    const cvLink = document.getElementById("applicant-cv-link").value.trim();
    const message = document.getElementById("applicant-message").value.trim();
    const aiScore = document.getElementById("modal-ai-score-val").innerText;

    const textMsg = `Halo HRD *${selectedJobForApply.company}*,%0A%0APerkenalkan saya *${name}*. Saya melamar posisi *${selectedJobForApply.title}* via portal *SMABAJA (SMA Bareng Kerja)*.%0A%0A📊 *AI Match Score Profile:* ${aiScore}%0A💪 *Keahlian/Skill:* ${skills}%0A📄 *Tautan CV/Portofolio:* ${cvLink}%0A%0A💬 *Catatan Pelamar:*%0A"${message}"%0A%0AMohon arahannya. Terima kasih!`;

    const waUrl = `https://wa.me/${selectedJobForApply.hrdWa}?text=${textMsg}`;
    window.open(waUrl, "_blank");

    closeModal();
    alert("Lamaran diproses! Dialihkan ke WhatsApp HRD.");
}

// 10. NAVIGASI TAB
function switchTab(tabName) {
    const tabJobs = document.getElementById("tab-jobs");
    const tabHrd = document.getElementById("tab-hrd");
    const btnJobs = document.getElementById("nav-btn-jobs");
    const btnHrd = document.getElementById("nav-btn-hrd");

    if (tabName === "jobs") {
        tabJobs.classList.remove("hidden");
        tabHrd.classList.add("hidden");
        btnJobs.className = "nav-tab-active font-medium px-3 py-2 text-sm rounded-lg transition duration-200";
        btnHrd.className = "nav-tab-inactive font-medium px-3 py-2 text-sm rounded-lg transition duration-200";
    } else {
        tabJobs.classList.add("hidden");
        tabHrd.classList.remove("hidden");
        btnJobs.className = "nav-tab-inactive font-medium px-3 py-2 text-sm rounded-lg transition duration-200";
        btnHrd.className = "nav-tab-active font-medium px-3 py-2 text-sm rounded-lg transition duration-200";
    }
}
