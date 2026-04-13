/**
 * @file profile.js
 * @description Live Database integration for Profile, Wishlist, and Orders.
 */

const API_BASE = "https://vstra-backend.onrender.com/api";

function switchTab(tab) {
    ['sec-info', 'sec-wishlist', 'sec-orders'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        document.getElementById(id).classList.remove('block');
    });
    ['btn-info', 'btn-wishlist', 'btn-orders'].forEach(id => {
        document.getElementById(id).classList.remove('active', 'text-black');
    });

    document.getElementById(`sec-${tab}`).classList.remove('hidden');
    document.getElementById(`sec-${tab}`).classList.add('block');
    document.getElementById(`btn-${tab}`).classList.add('active', 'text-black');

    if (tab === 'wishlist') loadWishlist();
    if (tab === 'orders') loadOrderHistory();
}

async function loadProfileData() {
    const userData = localStorage.getItem('vastra_user');
    if (!userData) { window.location.href = 'login.html'; return; }

    const user = JSON.parse(userData);
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-email').innerText = user.email;
    document.getElementById('user-phone').innerText = user.phone || "Not Provided";

    const savedPic = localStorage.getItem(`profile_pic_${user.email}`);
    const display = document.getElementById('profile-pic-display');
    if (savedPic) {
        display.innerHTML = `<img src="${savedPic}" class="w-full h-full object-cover">`;
    } else {
        display.innerText = user.name.charAt(0).toUpperCase();
    }
}

// 🌟 WISHLIST: LOAD FROM DATABASE & DIRECT AMAZON LINK
async function loadWishlist() {
    const user = JSON.parse(localStorage.getItem('vastra_user'));
    const grid = document.getElementById('wishlist-grid');
    grid.innerHTML = "<p class='col-span-full text-center py-10 text-xs text-gray-400 animate-pulse'>Fetching your wishlist...</p>";

    try {
        const res = await fetch(`${API_BASE}/wishlist/${user.email}`);
        const items = await res.json();

        if (items.length === 0) {
            grid.innerHTML = `<div class='col-span-full text-center py-12'><i class='ri-heart-line text-4xl text-gray-200'></i><p class='text-xs text-gray-400 mt-2 uppercase font-bold tracking-widest'>Wishlist is Empty</p></div>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="relative bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-all group cursor-pointer" 
                 onclick="window.open('${item.purchase_link}', '_blank')">
                
                <button onclick="event.stopPropagation(); removeFromWishlist(${item.wishlist_id})" 
                        class="absolute top-2 right-2 w-7 h-7 bg-white/90 text-red-500 rounded-full flex items-center justify-center border shadow-sm z-20 hover:bg-red-50 transition-colors">
                    <i class="ri-delete-bin-line text-xs"></i>
                </button>

                <div class="aspect-[3/4] overflow-hidden rounded-md mb-3">
                    <img src="${item.image_url}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                </div>

                <h3 class="text-[10px] font-bold text-gray-900 uppercase truncate mb-1">${item.name}</h3>
                <div class="flex items-center justify-between">
                    <div class="text-sm font-black">₹${item.price}</div>
                    <div class="text-[9px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        Buy Now <i class="ri-external-link-line"></i>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

async function removeFromWishlist(id) {
    if (confirm("Remove this item?")) {
        try {
            await fetch(`${API_BASE}/wishlist/${id}`, { method: 'DELETE' });
            loadWishlist();
        } catch (err) { alert("Error removing item."); }
    }
}

// 🌟 ORDERS: LOAD FROM DATABASE
async function loadOrderHistory() {
    const user = JSON.parse(localStorage.getItem('vastra_user'));
    const list = document.getElementById('orders-list');
    list.innerHTML = "<p class='text-center py-10 text-xs text-gray-400 animate-pulse'>Loading orders...</p>";

    try {
        const res = await fetch(`${API_BASE}/orders/${user.email}`);
        const orders = await res.json();

        if (orders.length === 0) {
            list.innerHTML = `<p class="text-gray-400 text-xs italic uppercase tracking-widest text-center py-10">No recent orders found.</p>`;
            return;
        }

        list.innerHTML = orders.map(item => `
            <div class="flex items-center gap-4 border border-gray-100 p-3 rounded hover:bg-gray-50 transition-colors cursor-pointer" onclick="window.open('${item.purchase_link}', '_blank')">
                <div class="w-16 h-16 bg-gray-100 shrink-0">
                    <img src="${item.image_url}" class="w-full h-full object-cover rounded-sm">
                </div>
                <div class="flex-grow">
                    <h3 class="text-xs font-bold uppercase text-gray-800 line-clamp-1">${item.name}</h3>
                    <p class="text-[10px] text-gray-500 mt-1"><span class="font-semibold text-green-600">Purchase Link Clicked</span></p>
                </div>
                <div class="text-right">
                    <p class="text-xs font-black">₹${item.price}</p>
                    <p class="text-[8px] text-gray-400 uppercase mt-1">${new Date(item.order_date).toLocaleDateString()}</p>
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); }
}

function updateProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const display = document.getElementById('profile-pic-display');
            display.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            const user = JSON.parse(localStorage.getItem('vastra_user'));
            localStorage.setItem(`profile_pic_${user.email}`, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

window.handleSidebarLogout = () => {
    if (typeof window.triggerLogout === 'function') {
        window.triggerLogout();
    } else {
        localStorage.removeItem('vastra_user');
        window.location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', loadProfileData);