document.addEventListener("DOMContentLoaded", () => {
    // Анхны хуудас ачаалагдахад JS элементүүдийг идэвхжүүлэх
    initComponents();

    // AJAX Хуудас ачаалалт (Навигацийн линкүүдийг барьж авах)
    document.addEventListener("click", (e) => {
        const link = e.target.closest("nav a, .btn, .dropdown-content a");
        
        if (link) {
            const url = link.getAttribute("href");
            
            // Хоосон линк болон гадны линкүүдийг алгасах
            if (!url || url.startsWith("#") || url.startsWith("http") || url.includes(":")) return;
            
            e.preventDefault();
            loadPage(url);
        }
    });

    // Хөтөчийн Буцах / Урагшлах товчлуур дарах үед хуудсыг зөв ачаалах
    window.addEventListener("popstate", () => {
        loadPage(window.location.pathname, false);
    });
});

// AJAX-аар хуудас татах функц
async function loadPage(url, pushState = true) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Хуудсыг ачаалахад алдаа гарлаа.");
        
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Зөвхөн <main> таг доторх контентыг солих
        const currentMain = document.querySelector("main");
        const newMain = doc.querySelector("main");
        if (currentMain && newMain) {
            currentMain.innerHTML = newMain.innerHTML;
        }

        // Вэбсайтын нэрийг солих
        document.title = doc.title;

        // Цэсний идэвхтэй (Active) классыг шинэчлэх
        updateActiveNav(url);

        // Шинээр ачаалагдсан хуудасны Слайдер болон Табыг идэвхжүүлэх
        initComponents();

        // Хөтөчийн хаягийн мөрийг солих
        if (pushState) {
            window.history.pushState({}, "", url);
        }

        // Хуудасны орой руу гүйлгэх
        window.scrollTo(0, 0);
    } catch (error) {
        console.error("Алдаа гарлаа:", error);
        // Хэрэв алдаа гарвал ердийн байдлаар үсрэх fallback
        if (pushState) window.location.href = url;
    }
}

// Идэвхтэй байгаа хуудасны линкийг тодруулах функц
function updateActiveNav(url) {
    const filename = url.substring(url.lastIndexOf('/') + 1) || "index.html";
    document.querySelectorAll("nav a").forEach(a => {
        const href = a.getAttribute("href");
        if (href === filename) {
            a.classList.add("active");
        } else {
            // Лабораторийн хуудсууд дээр байвал үндсэн "Лаборатори" товчийг идэвхжүүлэх
            if (href === "#" && a.classList.contains("dropbtn")) {
                if (filename.startsWith("lab")) {
                    a.classList.add("active");
                } else {
                    a.classList.remove("active");
                }
            } else {
                a.classList.remove("active");
            }
        }
    });
}

// Хуудас солигдох бүрд JS элементүүдийг сэргээх нэгдсэн удирдлага
function initComponents() {
    initCarousel();
    initTabs();
}

// 1. СЛАЙДЕР (CAROUSEL) АЖИЛЛАГАА
function initCarousel() {
    const slides = document.querySelectorAll(".carousel-slide");
    if (slides.length === 0) return;

    let currentSlide = 0;
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    function showSlide(index) {
        if (index >= slides.length) currentSlide = 0;
        else if (index < 0) currentSlide = slides.length - 1;
        else currentSlide = index;

        slides.forEach((slide, i) => {
            if (i === currentSlide) {
                slide.classList.add("active");
            } else {
                slide.classList.remove("active");
            }
        });
    }

    if (nextBtn && prevBtn) {
        nextBtn.onclick = (e) => { e.preventDefault(); currentSlide++; showSlide(currentSlide); };
        prevBtn.onclick = (e) => { e.preventDefault(); currentSlide--; showSlide(currentSlide); };
    }

    // 5 секунд тутамд автоматаар дараагийн слайд руу шилжих
    if (window.carouselInterval) clearInterval(window.carouselInterval);
    window.carouselInterval = setInterval(() => {
        currentSlide++;
        showSlide(currentSlide);
    }, 5000);
}

// 2. ТАБ ЦЭСНИЙ (TABS) АЖИЛЛАГАА
function initTabs() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    if (tabButtons.length === 0) return;

    tabButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.preventDefault();
            const targetTab = btn.getAttribute("data-tab");

            tabButtons.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));

            btn.classList.add("active");
            const activeContent = document.getElementById(targetTab);
            if (activeContent) activeContent.classList.add("active");
        };
    });
}