// Data Awal Bawaan (Default Sample Jobs)
const DEFAULT_JOBS = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "PT Maju Terus Digital",
        location: "Jakarta Selatan",
        type: "Full-time",
        salary: "Rp 6.000.000 - 8.000.000",
        skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind"],
        hrdWa: "6281234567890",
        date: "2026-03-25"
    },
    {
        id: 2,
        title: "Social Media Admin",
        company: "Kopi Senja Nusantara",
        location: "Bandung",
        type: "Part-time",
        salary: "Rp 3.500.000 - 4.500.000",
        skills: ["Instagram", "TikTok", "Canva", "Copywriting"],
        hrdWa: "6289876543210",
        date: "2026-03-26"
    },
    {
        id: 3,
        title: "Desainer Grafis / UI",
        company: "StartupKreatif",
        location: "Remote",
        type: "Freelance",
        salary: "Rp 4.000.000 - 7.000.000",
        skills: ["Figma", "UI/UX", "Illustrator", "Photoshop"],
        hrdWa: "628111222333",
        date: "2026-03-27"
    }
];

let jobsData = [];
let selectedJobForApply = null;

// Initialization Aplikasi
document.addEventListener("DOMContentLoaded", () => {
    loadJobsFromStorage();
    renderJobFeed(jobsData);
    renderHRDList();
});

// Load Data dari LocalStorage
function loadJobsFromStorage() {
    const savedJobs = localStorage.getItem("kerjaai_jobs_data");
    if (savedJobs) {
        jobsData = JSON.parse(savedJobs);
    } else {
        jobsData = [...DEFAULT_JOBS];
        saveJobsToStorage();
    }
}

// Simpan Data ke LocalStorage
function saveJobsToStorage() {
    localStorage.setItem("kerjaai_jobs_data", JSON.stringify(jobsData));
}

// Fitur Navigasi Tab (Pencari Kerja vs Dashboard HRD)
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
        renderHRDList();
    }
}

// Render Daftar Lowongan di Halaman Utama Pencari Kerja
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
        const skillsTags = job.skills.map(s => `<span class="bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 rounded font-medium">${s}</span>`).join(" ");

        const cardHTML = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-300 p-6 flex flex-col justify-between h-full relative">
                <div>
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded border border-blue-100">${job.type}</span>
                        <span class="text-[11px] text-gray-400">${job.date}</span>
                    </div>

                    <h3 class="text-lg font-bold text-gray-800 leading-snug">${job.title}</h3>
                    <p class="text-sm font-semibold text-blue-600 mb-3">${job.company}</p>

                    <div class="space-y-1.5 mb-4 text-xs text-gray-600">
                        <p class="flex items-center"><i class="fa-solid fa-location-dot w-4 text-gray-400"></i> ${job.location}</p>
                        <p class="flex items-center"><i class="fa-solid fa-money-bill-wave w-4 text-gray-400"></i> ${job.salary}</p>
                    </div>

                    <div class="mb-5">
                        <p class="text-[11px] text-gray-400 uppercase font-bold mb-1">Kualifikasi Skill:</p>
                        <div class="flex flex-wrap gap-1">
                            ${skillsTags}
                        </div>
                    </div>
                </div>

                <button onclick="openApplyModal(${job.id})" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition duration-300 shadow-sm flex items-center justify-center gap-2">
                    <i class="fa-solid fa-paper-plane"></i> Lamar Sekarang
                </button>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

// Filter Pencarian Pekerjaan Live
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

// Fitur Tambah Lowongan oleh HRD (Form Handler)
function handlePostJob(event) {
    event.preventDefault();

    const title = document.getElementById("post-title").value.trim();
    const company = document.getElementById("post-company").value.trim();
    const location = document.getElementById("post-location").value.trim();
    const type = document.getElementById("post-type").value;
    const salary = document.getElementById("post-salary").value.trim();
    let wa = document.getElementById("post-wa").value.trim();
    const skillsRaw = document.getElementById("post-skills").value;

    // Format sanitize WA
    wa = wa.replace(/[^0-9]/g, '');
    if (wa.startsWith("0")) {
        wa = "62" + wa.slice(1);
    }

    const skillsArr = skillsRaw.split(",").map(s => s.trim()).filter(s => s.length > 0);

    const newJob = {
        id: Date.now(),
        title: title,
        company: company,
        location: location,
        type: type,
        salary: salary,
        skills: skillsArr,
        hrdWa: wa,
        date: new Date().toISOString().split('T')[0]
    };

    jobsData.unshift(newJob);
    saveJobsToStorage();

    // Reset Form
    document.getElementById("hrd-post-form").reset();
    
    alert("Berhasil! Lowongan baru telah dipublikasikan secara nyata.");
    renderHRDList();
    renderJobFeed(jobsData);
}

// Render Daftar Loker Manajemen HRD
function renderHRDList() {
    const container = document.getElementById("hrd-job-list");
    const countLabel = document.getElementById("hrd-job-count");

    container.innerHTML = "";
    countLabel.innerText = `${jobsData.length} Total Loker Aktif`;

    if (jobsData.length === 0) {
        container.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Belum ada lowongan terdaftar.</p>`;
        return;
    }

    jobsData.forEach((job) => {
        const itemHTML = `
            <div class="p-4 rounded-lg border border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h4 class="font-bold text-gray-800 text-sm">${job.title}</h4>
                    <p class="text-xs text-gray-600">${job.company} • ${job.location} (${job.type})</p>
                    <p class="text-[11px] text-gray-400 mt-1">WA: +${job.hrdWa}</p>
                </div>
                <button onclick="deleteJob(${job.id})" class="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded text-xs border border-red-200 transition">
                    <i class="fa-solid fa-trash-can mr-1"></i> Hapus
                </button>
            </div>
        `;
        container.innerHTML += itemHTML;
    });
}

// Fitur Hapus Loker oleh HRD
function deleteJob(id) {
    if (confirm("Apakah Anda yakin ingin menghapus lowongan kerja ini?")) {
        jobsData = jobsData.filter(j => j.id !== id);
        saveJobsToStorage();
        renderHRDList();
        renderJobFeed(jobsData);
    }
}

// Reset Data Bawaan
function resetDefaultJobs() {
    if (confirm("Kembalikan data ke kondisi awal (Sample Data)? Data buatan kamu akan hilang.")) {
        jobsData = [...DEFAULT_JOBS];
        saveJobsToStorage();
        renderHRDList();
        renderJobFeed(jobsData);
    }
}

// Logika Modal Apply Pekerjaan
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

// Algoritma AI Match Score (Client-side overlapping calculation)
function calculateRealtimeMatch() {
    if (!selectedJobForApply) return;

    const userSkillsInput = document.getElementById("applicant-skills").value.toLowerCase();
    const userSkillsArr = userSkillsInput.split(",").map(s => s.trim()).filter(s => s.length > 0);

    const requiredSkills = selectedJobForApply.skills.map(s => s.toLowerCase());

    if (userSkillsArr.length === 0 || requiredSkills.length === 0) {
        document.getElementById("modal-ai-score-val").innerText = "0%";
        document.getElementById("modal-ai-score-label").innerText = "Masukkan skill Anda di atas";
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
        scoreValEl.className = "text-xl font-black text-green-600";
        scoreLabelEl.innerText = "Sangat Cocok! Rekomendasi Tinggi";
    } else if (score >= 40) {
        scoreValEl.className = "text-xl font-black text-amber-500";
        scoreLabelEl.innerText = "Cukup Cocok";
    } else {
        scoreValEl.className = "text-xl font-black text-red-500";
        scoreLabelEl.innerText = "Kurang Cocok dengan Kriteria";
    }
}

// Kirim Form ke WhatsApp HRD Direct
function submitApplication(event) {
    event.preventDefault();

    if (!selectedJobForApply) return;

    const name = document.getElementById("applicant-name").value.trim();
    const skills = document.getElementById("applicant-skills").value.trim();
    const cvLink = document.getElementById("applicant-cv-link").value.trim();
    const message = document.getElementById("applicant-message").value.trim();
    const aiScore = document.getElementById("modal-ai-score-val").innerText;

    // Teks Terstruktur untuk Pesan WhatsApp
    const textMsg = `Halo HRD *${selectedJobForApply.company}*,%0A%0APerkenalkan saya *${name}*. Saya melamar posisi *${selectedJobForApply.title}* via platform KerjaAI.%0A%0A📊 *AI Match Score Profile:* ${aiScore}%0A💪 *Keahlian/Skill:* ${skills}%0A📄 *Tautan CV/Portofolio:* ${cvLink}%0A%0A💬 *Catatan Pelamar:*%0A"${message}"%0A%0AMohon arahannya untuk proses seleksi selanjutnya. Terima kasih!`;

    const waUrl = `https://wa.me/${selectedJobForApply.hrdWa}?text=${textMsg}`;

    // Open WhatsApp
    window.open(waUrl, "_blank");

    closeModal();
    alert("Lamaran berhasil diproses! Anda dialihkan ke WhatsApp HRD.");
}
