// Data Dummy Lowongan Kerja (Simulasi Database)
const jobs = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "PT Maju Terus Digital",
        location: "Jakarta Selatan",
        type: "Full-time",
        salary: "Rp 6.000.000 - 8.000.000",
        aiMatch: "98%", 
        hrdWa: "6281234567890" // Ganti dengan nomor WA aslimu untuk uji coba
    },
    {
        id: 2,
        title: "Social Media Admin",
        company: "Kopi Senja Nusantara",
        location: "Bandung (WFO)",
        type: "Kontrak",
        salary: "Rp 3.500.000 - 4.500.000",
        aiMatch: "90%",
        hrdWa: "6289876543210"
    },
    {
        id: 3,
        title: "Desainer Grafis / UI",
        company: "StartupKreatif",
        location: "Remote (WFA)",
        type: "Freelance",
        salary: "Berdasarkan Proyek",
        aiMatch: "85%",
        hrdWa: "628111222333"
    }
];

let selectedJob = null;

// Fungsi menampilkan data loker ke HTML
function renderJobs() {
    const container = document.getElementById('job-container');
    container.innerHTML = ''; 

    jobs.forEach(job => {
        const card = `
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-300 p-6 flex flex-col h-full relative overflow-hidden">
                <div class="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                    <i class="fa-solid fa-robot"></i> AI Match: ${job.aiMatch}
                </div>
                <h3 class="text-xl font-bold text-gray-800 mt-2">${job.title}</h3>
                <p class="text-gray-600 font-medium mb-4">${job.company}</p>
                
                <div class="space-y-2 mb-6 flex-grow">
                    <p class="text-sm text-gray-500"><i class="fa-solid fa-location-dot w-5 text-center"></i> ${job.location}</p>
                    <p class="text-sm text-gray-500"><i class="fa-solid fa-briefcase w-5 text-center"></i> ${job.type}</p>
                    <p class="text-sm text-gray-500"><i class="fa-solid fa-money-bill-wave w-5 text-center"></i> ${job.salary}</p>
                </div>
                
                <button onclick="openModal(${job.id})" class="w-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold py-2 rounded-lg transition duration-300 border border-blue-200">
                    Lamar Sekarang
                </button>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Logika Modal
const modal = document.getElementById('apply-modal');

function openModal(jobId) {
    selectedJob = jobs.find(j => j.id === jobId);
    document.getElementById('modal-job-title').innerText = selectedJob.title;
    document.getElementById('modal-company-name').innerText = selectedJob.company;
    
    modal.classList.remove('hidden-modal');
    document.body.classList.add('modal-open'); 
}

function closeModal() {
    modal.classList.add('hidden-modal');
    document.body.classList.remove('modal-open');
    document.getElementById('apply-form').reset(); 
    selectedJob = null;
}

// Logika Pengiriman Form ke WhatsApp
function submitApplication(event) {
    event.preventDefault(); 
    
    const name = document.getElementById('applicant-name').value;
    const message = document.getElementById('applicant-message').value;
    
    // Teks yang akan dikirim ke WhatsApp HRD
    const waText = `Halo HRD ${selectedJob.company},%0A%0APerkenalkan saya *${name}*. Saya melihat lowongan *${selectedJob.title}* di platform KerjaAI dan tertarik untuk melamar.%0A%0A*Pesan Singkat:*%0A"${message}"%0A%0ACV saya telah siap, mohon arahannya. Terima kasih!`;
    
    const waUrl = `https://wa.me/${selectedJob.hrdWa}?text=${waText}`;
    
    window.open(waUrl, '_blank');
    
    closeModal();
    alert(`Sukses! Mengalihkan Anda ke WhatsApp HRD ${selectedJob.company}.`);
}

// Render awal saat web dibuka
renderJobs();
