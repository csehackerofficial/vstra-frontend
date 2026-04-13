/**
 * @file main.js
 * @description VASTRA Storefront Master Logic (Fully Cloud Integrated).
 */

let allProducts = [];
let currentSlide = 0;
let sliderTimer;

const API_BASE = "https://vstra-backend.onrender.com/api";

// ==========================================
// 🌟 DYNAMIC HERO SLIDER
// ==========================================
async function fetchBanners() {
    try {
        const res = await fetch(`${API_BASE}/banners`);
        const banners = await res.json();
        
        if (banners.length > 0) {
            const container = document.getElementById('dynamic-slider-container');
            const track = document.getElementById('slider-track');
            const nav = document.getElementById('slider-nav');
            
            track.innerHTML = banners.map((b, index) => {
                const posClass = b.text_position === 'left' ? 'text-pos-left' : 
                                 b.text_position === 'right' ? 'text-pos-right' : 'text-pos-center';

                return `
                <div class="slide ${index === 0 ? 'active' : ''}" 
                     style="background-image: url('${b.image_url}');"
                     onclick="window.open('${b.target_link}', '_blank')">
                     ${b.text_content ? `
                     <div class="slide-text-container ${posClass}">
                        <div class="slide-text text-xl md:text-3xl">${b.text_content}</div>
                     </div>` : ''}
                </div>`;
            }).join('');

            if (banners.length > 1) {
                nav.innerHTML = banners.map((b, index) => `<div class="slider-dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>`).join('');
                initSlider();
            }
            container.classList.remove('hidden');
        }
    } catch (err) { console.error("Banner fetch failed", err); }
}

function initSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    
    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
    window.goToSlide = (index) => { showSlide(index); resetTimer(); };
    
    function resetTimer() {
        clearInterval(sliderTimer);
        sliderTimer = setInterval(nextSlide, 5000);
    }
    resetTimer();
}

// ==========================================
// 🌟 INVENTORY & CATEGORY RENDERING
// ==========================================
async function initStorefront() {
    fetchBanners();
    try {
        const res = await fetch(`${API_BASE}/products`);
        allProducts = await res.json();
        displayInventory(allProducts);
    } catch (err) { console.error("VASTRA: Sync Failed.", err); }
}

function displayInventory(products) {
    const categories = ['featured', 'men', 'women', 'kids'];
    categories.forEach(cat => {
        const filtered = products.filter(p => (p.category || "").toLowerCase().trim().includes(cat));
        renderProductGrid(`${cat}-grid`, filtered);
    });
}

function renderProductGrid(id, products) {
    const grid = document.getElementById(id);
    if (!grid) return; 

    if (products.length === 0) {
        grid.innerHTML = `<p class="text-xs text-gray-400 col-span-full pb-8">New collection dropping soon...</p>`;
        return;
    }

    grid.innerHTML = products.map(p => {
        // 🌟 Feature: Real-time Discount Percentage
        const discount = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
        
        return `
        <div class="group border border-transparent hover:border-gray-100 p-2 transition-all bg-white relative">
            <div class="aspect-[3/4] bg-gray-50 mb-3 overflow-hidden relative border border-gray-100 cursor-pointer" 
                 onclick="handlePurchase('${p.purchase_link}', ${p.id})">
                <img src="${p.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500">
                
                ${discount > 0 ? `<div class="absolute top-2 left-2 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">-${discount}% OFF</div>` : ''}
            </div>
            
            <h3 class="text-[10px] font-bold uppercase truncate mb-1 text-gray-800">${p.name}</h3>
            <div class="flex items-baseline gap-2 mb-3">
                <p class="font-black text-xs">₹${p.price}</p>
                <p class="text-[9px] text-gray-400 line-through">₹${p.mrp || 0}</p>
            </div>
            
            <div class="flex gap-2">
                <button onclick="saveToWishlist(${p.id}, event)" title="Save to Wishlist"
                        class="w-1/4 py-2 border border-black flex justify-center items-center hover:bg-gray-100 transition-all rounded-sm">
                    <i class="ri-bookmark-line"></i>
                </button>
                <button onclick="handlePurchase('${p.purchase_link}', ${p.id})" 
                        class="w-3/4 py-2 bg-black text-white text-[9px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-all rounded-sm shadow-md">
                    Buy Now
                </button>
            </div>
        </div>`;
    }).join('');
}

// ==========================================
// 🌟 DATABASE WISHLIST & ORDERS
// ==========================================

window.saveToWishlist = async (productId, event) => {
    const user = JSON.parse(localStorage.getItem('vastra_user'));
    if (!user) { 
        if(window.vastraAlert) vastraAlert('Please login to save items!', 'error');
        else alert('Login Required!');
        return; 
    }
    
    const icon = event.currentTarget.querySelector('i');

    try {
        const res = await fetch(`${API_BASE}/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, product_id: productId })
        });
        const data = await res.json();

        if (data.success) {
            icon.classList.replace('ri-bookmark-line', 'ri-bookmark-fill');
            if (window.vastraAlert) vastraAlert('Added to Wishlist!', 'success');
        } else {
            if (window.vastraAlert) vastraAlert(data.message, 'info');
        }
    } catch (err) { console.error("Wishlist sync error", err); }
};

window.handlePurchase = async (link, productId) => {
    const user = JSON.parse(localStorage.getItem('vastra_user'));
    if (user) {
        try {
            // Save click event to database for analytics/history
            await fetch(`${API_BASE}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, product_id: productId })
            });
        } catch (e) { console.log("Order logging skipped"); }
        window.open(link, '_blank');
    } else {
        window.location.href = 'login.html';
    }
};

// ==========================================
// 🌟 SEARCH LOGIC
// ==========================================
window.handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    const storefront = document.getElementById('storefront-content');
    const searchArea = document.getElementById('search-info');
    
    if (query.length > 0) {
        const results = allProducts.filter(p => (p.name && p.name.toLowerCase().includes(query)) || (p.category && p.category.toLowerCase().includes(query)));
        storefront.classList.add('hidden'); 
        searchArea.classList.remove('hidden'); 
        renderProductGrid('search-results-grid', results);
    } else { clearSearch(); }
};

window.clearSearch = () => { 
    document.getElementById('searchInput').value = ""; 
    document.getElementById('storefront-content').classList.remove('hidden'); 
    document.getElementById('search-info').classList.add('hidden'); 
};

document.addEventListener('DOMContentLoaded', initStorefront);