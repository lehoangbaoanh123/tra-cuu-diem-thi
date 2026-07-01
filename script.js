document.addEventListener("DOMContentLoaded", () => {
    const searchBtn = document.getElementById("searchBtn");
    const sbdInput = document.getElementById("sbdInput");
    const loading = document.getElementById("loading");
    const resultCard = document.getElementById("resultCard");

    // Ràng buộc chỉ nhập số
    sbdInput.addEventListener("input", function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Lắng nghe sự kiện Enter
    sbdInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    function showError(msg) {
        const errorBox = document.getElementById("errorBox");
        errorBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
        errorBox.style.display = "block";
    }

    function hideError() {
        document.getElementById("errorBox").style.display = "none";
    }

    searchBtn.addEventListener("click", performSearch);

    function performSearch() {
        let sbd = sbdInput.value.trim();
        
        hideError();

        if (!sbd) {
            showError("Anh ơi nhập số báo danh vào đã!");
            sbdInput.focus();
            return;
        }

        // Tự động đệm số 0 cho đủ 8 số (giống logic code Go)
        sbd = sbd.padStart(8, '0');
        sbdInput.value = sbd;

        // Ẩn kết quả cũ, hiện loading
        resultCard.classList.remove("active");
        loading.style.display = "block";

        // URL API thực tế của Tuổi Trẻ (thêm year=2026)
        const apiUrl = `https://s6.tuoitre.vn/api/diem-thi-thpt.htm?sbd=${sbd}&year=2026`;

        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 429) throw new Error('Too Many Requests');
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(actualData => {
                loading.style.display = "none";
                
                if (actualData.success && actualData.data && actualData.data.length > 0) {
                    const student = actualData.data[0];
                    // Map dữ liệu từ API Tuổi Trẻ sang format của mình
                    const mappedData = {
                        sbd: sbd,
                        toan: student.TOAN || "",
                        van: student.VA || "",
                        nn: student.NN || student.MON_NN || "",
                        ly: student.LI || "",
                        hoa: student.HO || "",
                        sinh: student.SI || "",
                        su: student.SU || "",
                        dia: student.DI || "",
                        gdcd: student.KTPL || "" // 2026 đổi thành Giáo dục Kinh tế và Pháp luật (KTPL)
                    };
                    renderResult(mappedData);
                } else {
                    showError("Opps! Không tìm thấy điểm của SBD: " + sbd);
                }
            })
            .catch(error => {
                loading.style.display = "none";
                console.error("Lỗi khi tải dữ liệu:", error);
                
                let errorMsg = "Có lỗi xảy ra khi kết nối tới máy chủ tra cứu.<br>";
                if (error.message === 'Too Many Requests') {
                    errorMsg = "Hệ thống đang quá tải (bị chặn 429). Vui lòng đợi một lát rồi thử lại!";
                } else if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
                    errorMsg += "<b>Chi tiết:</b> Bị chặn bởi CORS hoặc rớt mạng (Failed to fetch). <br>Tuổi Trẻ có thể đã chặn IP của anh hoặc chặn CORS từ local file. Anh thử up file này lên Github Pages hoặc chạy qua Live Server nhé!";
                } else {
                    errorMsg += `<b>Chi tiết lỗi:</b> ${error.message}`;
                }
                
                showError(errorMsg);
            });
    }

    function renderResult(data) {
        document.getElementById("resSBD").textContent = data.sbd;
        
        // Render điểm
        const subjects = [
            { id: "ptToan", val: data.toan },
            { id: "ptVan", val: data.van },
            { id: "ptNn", val: data.nn },
            { id: "ptLy", val: data.ly },
            { id: "ptHoa", val: data.hoa },
            { id: "ptSinh", val: data.sinh },
            { id: "ptSu", val: data.su },
            { id: "ptDia", val: data.dia },
            { id: "ptGdcd", val: data.gdcd }
        ];

        let total = 0;
        let count = 0;

        subjects.forEach(sub => {
            const el = document.getElementById(sub.id);
            const parent = el.closest('.score-item');
            
            if (sub.val !== null && sub.val !== undefined && sub.val !== "") {
                el.textContent = sub.val;
                total += parseFloat(sub.val);
                count++;
                parent.style.opacity = "1";
                parent.style.display = "flex";
            } else {
                el.textContent = "-";
                // Ẩn các môn không thi cho gọn UI
                parent.style.display = "none";
            }
        });

        // Tính tổng và trung bình
        document.getElementById("resTotal").textContent = total.toFixed(2);
        document.getElementById("resAvg").textContent = count > 0 ? (total / count).toFixed(2) : "0.00";

        // Hiện card
        resultCard.classList.add("active");
        
        // Cuộn mượt xuống card kết quả trên mobile
        if (window.innerWidth < 768) {
            setTimeout(() => {
                resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }
});
