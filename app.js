// Dùng corsproxy.io để vượt qua CORS khi host trên GitHub Pages
const API_URL = "https://corsproxy.io/?https://tienbry.com/api-diem-thi.php?sbd=";

const input = document.getElementById('sbdInput');
const btn = document.getElementById('searchBtn');
const errorMsg = document.getElementById('errorMsg');
const resultSection = document.getElementById('resultSection');
const loading = document.getElementById('loading');
const resultData = document.getElementById('resultData');

const resSBD = document.getElementById('resSBD');
const resSGD = document.getElementById('resSGD');
const scoreGrid = document.getElementById('scoreGrid');

// Prevent non-numeric input
input.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
});

// Trigger search on Enter key
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchSBD();
    }
});

btn.addEventListener('click', searchSBD);

async function searchSBD() {
    const sbd = input.value.trim();
    
    if (sbd.length === 0) {
        showError("Vui lòng nhập Số Báo Danh!");
        return;
    }
    
    // Reset and show loading state
    hideError();
    resultData.classList.add('hidden');
    resultSection.classList.remove('hidden');
    loading.classList.remove('hidden');
    scoreGrid.innerHTML = ''; // Clear previous scores

    try {
        const response = await fetch(`${API_URL}${sbd}`);
        
        if (!response.ok) {
            throw new Error("Lỗi mạng hoặc server!");
        }
        
        const data = await response.json();
        
        if (data && data.success === true && data.data) {
            renderResult(data.data);
        } else {
            showError("Không tìm thấy kết quả cho Số Báo Danh này.");
        }
    } catch (err) {
        showError("Đã xảy ra lỗi kết nối. Vui lòng thử lại!");
        console.error(err);
    } finally {
        loading.classList.add('hidden');
    }
}

function renderResult(data) {
    // Populate Info Box
    resSBD.textContent = data.so_bao_danh || input.value;
    resSGD.textContent = data.so_gd_dt || "Không rõ";

    // Populate Score Grid
    const diem = data.diem || {};
    const subjects = Object.keys(diem);
    
    if (subjects.length === 0) {
        scoreGrid.innerHTML = '<p style="text-align:center; width:100%; color:var(--text-secondary);">Chưa có dữ liệu điểm.</p>';
    } else {
        subjects.forEach((subject, index) => {
            const score = diem[subject];
            
            // Skip if score is empty
            if (score === "" || score === null) return;
            
            // Create Score Card
            const card = document.createElement('div');
            card.className = 'score-card';
            
            // Staggered animation for cards appearing one by one
            card.style.animation = `slideUp 0.4s ease forwards ${index * 0.1}s`;
            card.style.opacity = '0'; // Hide initially so animation can reveal it
            
            card.innerHTML = `
                <div class="subject-name">${subject}</div>
                <div class="subject-score">${score}</div>
            `;
            scoreGrid.appendChild(card);
        });
    }

    // Show the result panels smoothly
    resultData.classList.remove('hidden');
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
    resultSection.classList.add('hidden');
}

function hideError() {
    errorMsg.classList.add('hidden');
}
