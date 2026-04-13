/**
 * @file profile.js
 * @description User Profile, Wishlist, and Order Logic with Phone Details
 */

function switchTab(tab) {
    // Hide all sections
    ['sec-info', 'sec-wishlist', 'sec-orders'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
        document.getElementById(id).classList.remove('block');
    });
    // Remove active styling from buttons
    ['btn-info', 'btn-wishlist', 'btn-orders'].forEach(id => {
        document.getElementById(id).classList.remove('active');
        document.getElementById(id).classList.remove('text-black');
    });

    // Show selected section
    document.getElementById(`sec-${tab}`).classList.remove('hidden');
    document.getElementById(`sec-${tab}`).classList.add('block');
    
    const activeBtn = document.getElementById(`btn-${tab}`);
    activeBtn.classList.add('active');
    activeBtn.classList.add('text-black');
}

function loadProfileData() {
    const userData = localStorage.getItem('vastra_user');
    if (!userData) { window.location.href = 'login.html'; return; }

    const user = JSON.parse(userData);
    document.getElementById('user-name').innerText = user.name;
    document.getElementById('user-email').innerText = user.email;
    
    // 🌟 FIX: Show Phone Number
    document.getElementById('user-phone').innerText = user.phone || "Not Provided";
    
    // Check if profile pic exists in localStorage
    const savedPic = localStorage.getItem(`profile_pic_${user.email}`);
    const display = document.getElementById('profile-pic-display');
    if (savedPic) {
        display.innerHTML = `<img src="${savedPic}" class="w-full h-full object-cover">`;
    } else {
        display.innerText = user.name.charAt(0).toUpperCase();
    }

    renderWishlist();
    renderOrders();
}

function updateProfilePic(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const display = document.getElementById('profile-pic-display');
            display.innerHTML = `<img src="${e.target.result}" class="w-full h-full object-cover">`;
            
            // Save to localStorage for this specific user
            const user = JSON.parse(localStorage.getItem('vastra_user'));
            localStorage.setItem(`profile_pic_${user.email}`, e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const wishlist = JSON.parse(localStorage.getItem('vastra_wishlist')) || [];

    if (wishlist.length === 0) {
        grid.innerHTML = `<p class="text-gray-400 text-xs italic uppercase tracking-widest col-span-full">Your wishlist is empty.</p>`;
        return;
    }

    grid.innerHTML = wishlist.map(item => `
        <div class="border border-gray-100 p-2 rounded relative">
            <button onclick="removeFromWishlist(${item.id})" class="absolute top-3 right-3 bg-white w-6 h-6 rounded-full shadow text-red-500 flex items-center justify-center hover:scale-110 z-10">
                <i class="ri-delete-bin-line text-xs"></i>
            </button>
            <div class="aspect-[3/4] bg-gray-50 mb-2 overflow-hidden">
                <img src="${item.image}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-[10px] font-bold uppercase truncate mb-1 text-gray-800">${item.name}</h3>
            <p class="font-bold text-xs">₹${item.price}</p>
        </div>
    `).join('');
}

function removeFromWishlist(id) {
    let wishlist = JSON.parse(localStorage.getItem('vastra_wishlist')) || [];
    wishlist = wishlist.filter(item => item.id !== id);
    localStorage.setItem('vastra_wishlist', JSON.stringify(wishlist));
    renderWishlist();
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    const orders = JSON.parse(localStorage.getItem('vastra_orders')) || [];

    if (orders.length === 0) {
        list.innerHTML = `<p class="text-gray-400 text-xs italic uppercase tracking-widest">No recent orders found.</p>`;
        return;
    }

    // Reverse to show latest first
    const reversedOrders = [...orders].reverse();

    list.innerHTML = reversedOrders.map(item => `
        <div class="flex items-center gap-4 border border-gray-100 p-3 rounded hover:bg-gray-50 transition-colors">
            <div class="w-16 h-16 bg-gray-100 shrink-0">
                <img src="${item.image}" class="w-full h-full object-cover rounded-sm">
            </div>
            <div class="flex-grow">
                <h3 class="text-xs font-bold uppercase text-gray-800 line-clamp-1">${item.name}</h3>
                <p class="text-[10px] text-gray-500 mt-1"><span class="font-semibold text-green-600">Purchase Initiated</span> on ${item.date}</p>
            </div>
            <button class="px-3 py-1 bg-black text-white text-[9px] font-bold uppercase tracking-widest rounded-sm hidden sm:block">
                Track
            </button>
        </div>
    `).join('');
}

// 🌟 NEW: Link sidebar logout to auth.js confirmation modal
window.handleSidebarLogout = () => {
    // Check if triggerLogout exists in auth.js
    if (typeof window.triggerLogout === 'function') {
        window.triggerLogout();
    } else {
        // Fallback just in case
        localStorage.removeItem('vastra_user');
        window.location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', loadProfileData);