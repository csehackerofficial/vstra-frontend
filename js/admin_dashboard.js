/**
 * @file admin_dashboard.js
 * @description Full Administrative Logic for VASTRA Dashboard.
 * Features: Role Management, CSV Export, Real-time Search, Products, Sales & Banners.
 */

let allAdminUsers = [];
let allAdminProducts = []; 
let allAdminSales = [];
let editingProductId = null;

// ==========================================
// 🌟 TAB & MODAL LOGIC
// ==========================================

function switchTab(tab) {
    ['sec-users', 'sec-store', 'sec-sales', 'sec-banners'].forEach(id => {
        const el = document.getElementById(id);
        if(el) { el.classList.add('hidden'); el.classList.remove('block'); }
    });
    ['btn-users', 'btn-store', 'btn-sales', 'btn-banners'].forEach(id => {
        const btn = document.getElementById(id);
        if(btn) {
            btn.classList.remove('active', 'text-black');
            if(id === 'btn-banners') btn.classList.remove('bg-blue-50');
        }
    });

    const activeSec = document.getElementById(`sec-${tab}`);
    if(activeSec) { activeSec.classList.remove('hidden'); activeSec.classList.add('block'); }
    
    const activeBtn = document.getElementById(`btn-${tab}`);
    if(activeBtn) {
        activeBtn.classList.add('active', 'text-black');
        if(tab === 'banners') activeBtn.classList.add('bg-blue-50');
    }

    if (tab === 'users') loadUsers();
    else if (tab === 'store') loadInventory(); 
    else if (tab === 'sales') loadSales();
    else if (tab === 'banners') loadBanners();
}

window.toggleModal = (modalId, show) => {
    if (show) {
        const pModal = document.getElementById('productModal');
        const bModal = document.getElementById('bannerModal');
        if(pModal) pModal.style.display = 'none';
        if(bModal) bModal.style.display = 'none';
    }

    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = show ? 'flex' : 'none';
        if (!show) {
            if(modalId === 'productModal') {
                document.getElementById('admin-form').reset();
                editingProductId = null; 
                document.querySelector('#productModal h3').innerText = "List New Product";
            } else if (modalId === 'bannerModal') {
                document.getElementById('banner-form').reset();
            }
        }
    }
};

// ==========================================
// 🌟 USER REGISTRY LOGIC
// ==========================================

async function loadUsers() {
    try {
        const response = await fetch("https://vstra-backend.onrender.com/api/users");
        if (!response.ok) throw new Error("Network response failed.");
        allAdminUsers = await response.json();
        renderUserTable(allAdminUsers);
    } catch (err) { console.error(err); }
}

function renderUserTable(users) {
    const container = document.getElementById("user-list");
    if (!container) return;

    if (users.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">No identities found.</div>`;
        return;
    }

    const rows = users.map(user => {
        const dateObj = new Date(user.created_at);
        const regDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const regTime = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const isAdmin = user.role === 'admin';
        const roleColor = isAdmin ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-gray-50 text-gray-600 border-gray-200';
        const newRole = isAdmin ? 'user' : 'admin';
        const actionText = isAdmin ? 'Remove Admin' : 'Make Admin';

        return `
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 font-mono text-[11px] text-gray-400">#${user.id}</td>
                <td class="py-4 font-black uppercase tracking-tight text-gray-900">${user.name}</td>
                <td class="py-4"><div class="font-semibold text-gray-800 text-xs">${user.email}</div><div class="text-[10px] text-gray-500 mt-0.5">${user.phone_number || 'N/A'}</div></td>
                <td class="py-4 font-semibold italic text-xs text-gray-700">${regDate} <br><span class="text-[9px] text-gray-400">${regTime}</span></td>
                <td class="py-4"><span class="${roleColor} border text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">${user.role}</span></td>
                <td class="py-4 px-4 text-right">
                    <button onclick="toggleAdminRole(${user.id}, '${newRole}', '${user.name}')" class="text-[9px] font-bold uppercase tracking-widest ${isAdmin ? 'text-red-500' : 'text-blue-500'} hover:underline transition-colors">${actionText}</button>
                </td>
            </tr>
        `;
    }).join('');

    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

window.toggleAdminRole = async (userId, newRole, userName) => {
    if(confirm(`Change ${userName} to ${newRole.toUpperCase()}?`)) {
        try {
            const res = await fetch(`https://vstra-backend.onrender.com/api/users/${userId}/role`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: newRole })
            });
            if (res.ok) { alert(`Role updated for ${userName}.`); loadUsers(); } 
            else alert("Failed to update role.");
        } catch (err) { alert("Network error."); }
    }
};

// ==========================================
// 🌟 STORE INVENTORY LOGIC (Products)
// ==========================================

async function loadInventory() {
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/products');
        allAdminProducts = await res.json();
        renderInventoryTable(allAdminProducts);
    } catch (err) { console.error("Inventory Sync Error:", err); }
}

function renderInventoryTable(products) {
    const container = document.getElementById('inventory-list');
    if(!container) return;

    if (products.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">No products found.</div>`;
        return;
    }

    const rows = products.map(p => `
        <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
            <td class="py-4 px-4 w-20"><img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/100?text=V'" class="w-12 h-12 object-cover rounded shadow-inner border border-gray-100"></td>
            <td class="py-4"><div class="text-sm font-semibold text-gray-900 line-clamp-2" title="${p.name}">${p.name}</div></td>
            <td class="py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">${p.category}</td>
            <td class="py-4 font-bold text-sm text-gray-900">₹${p.price} <br><span class="text-[10px] text-gray-400 line-through">₹${p.mrp || 0}</span></td>
            <td class="py-4 px-4 text-right">
                <div class="flex justify-end gap-3.5">
                    <button onclick="editProduct(${p.id})" class="text-blue-500 hover:text-blue-700 text-lg"><i class="ri-edit-box-line"></i></button>
                    <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 text-lg"><i class="ri-delete-bin-line"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

window.editProduct = (id) => {
    const product = allAdminProducts.find(p => p.id === id);
    if (!product) return;
    editingProductId = id; 
    
    // 🌟 FIX: Mapped exactly to HTML IDs
    document.getElementById('p-name').value = product.name;
    document.getElementById('p-img').value = product.image_url;
    document.getElementById('p-link').value = product.purchase_link;
    document.getElementById('p-mrp').value = product.mrp;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-cat').value = product.category;
    
    document.querySelector('#productModal h3').innerText = "Edit Product";
    toggleModal('productModal', true);
};

window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "SAVING..."; btn.disabled = true;

    // 🌟 FIX: Mapped exactly to HTML IDs
    const payload = {
        name: document.getElementById('p-name').value,
        price: document.getElementById('p-price').value,
        mrp: document.getElementById('p-mrp').value || 0,
        category: document.getElementById('p-cat').value,
        image_url: document.getElementById('p-img').value,
        purchase_link: document.getElementById('p-link').value
    };

    try {
        let url = 'https://vstra-backend.onrender.com/api/add-product';
        let method = 'POST';
        if (editingProductId) { 
            url = `https://vstra-backend.onrender.com/api/products/${editingProductId}`; 
            method = 'PUT'; 
        }

        const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (res.ok) { 
            toggleModal('productModal', false); 
            loadInventory(); 
            alert("Product Saved!");
        } else { 
            const err = await res.json(); alert(err.message); 
        }
    } catch (err) { alert("Server Offline."); } 
    finally { btn.innerText = "PUBLISH TO STORE"; btn.disabled = false; }
};

window.deleteProduct = async (id) => {
    if (confirm("Delete this product permanently?")) {
        try { 
            const res = await fetch(`https://vstra-backend.onrender.com/api/products/${id}`, { method: 'DELETE' }); 
            if (res.ok) { loadInventory(); } 
        } catch (err) { alert("Delete failed."); }
    }
};

// ==========================================
// 🌟 BANNER LOGIC (Fixed & Implemented)
// ==========================================

async function loadBanners() {
    const list = document.getElementById('banner-list');
    const loading = document.getElementById('banner-loading');
    if(!list) return;

    list.innerHTML = "";
    if(loading) loading.classList.remove('hidden');

    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/banners');
        const banners = await res.json();
        if(loading) loading.classList.add('hidden');

        if (banners.length === 0) {
            list.innerHTML = `<div class="col-span-full text-center py-12 text-[11px] font-bold text-gray-300 uppercase">No banners active. Add one to show on homepage.</div>`;
            return;
        }

        list.innerHTML = banners.map(b => `
            <div class="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm group h-40">
                <img src="${b.image_url}" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/40 flex flex-col justify-between p-4">
                    <div class="flex justify-between items-start">
                        <span class="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest shadow">Priority: ${b.priority_number || 0}</span>
                        <button onclick="deleteBanner(${b.id})" class="w-8 h-8 bg-white text-red-600 rounded flex items-center justify-center hover:bg-red-50 transition-colors shadow-md"><i class="ri-delete-bin-line"></i></button>
                    </div>
                    ${b.text_content ? `<div class="text-white font-bold text-sm bg-black/50 self-start px-2 py-1 rounded backdrop-blur-sm">${b.text_content}</div>` : ''}
                </div>
            </div>
        `).join('');
    } catch (err) { console.error(err); if(loading) loading.classList.add('hidden'); }
}

window.saveBanner = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.innerText = "PUBLISHING..."; btn.disabled = true;

    const payload = {
        image_url: document.getElementById('b-image').value,
        target_link: document.getElementById('b-link').value,
        text_content: document.getElementById('b-text').value,
        text_position: document.getElementById('b-text-pos').value,
        priority_number: document.getElementById('b-priority').value || 0
    };

    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/banners', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
        });
        if (res.ok) {
            toggleModal('bannerModal', false);
            loadBanners();
        } else { const err = await res.json(); alert(err.message); }
    } catch (err) { alert("Failed to add banner."); }
    finally { btn.innerText = "PUBLISH BANNER"; btn.disabled = false; }
};

window.deleteBanner = async (id) => {
    if(confirm("Remove this banner from homepage?")) {
        try {
            await fetch(`https://vstra-backend.onrender.com/api/banners/${id}`, { method: 'DELETE' });
            loadBanners();
        } catch(err) { alert("Failed to delete."); }
    }
}

// ==========================================
// 🌟 PRODUCTS SOLD LOGIC (Sales)
// ==========================================

async function loadSales() {
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/admin/sales');
        allAdminSales = await res.json();
        renderSalesTable(allAdminSales);
    } catch (err) { console.error("Sales Load Error:", err); }
}

function renderSalesTable(sales) {
    const container = document.getElementById('sales-list');
    if(!container) return;

    if (sales.length === 0) {
        container.innerHTML = `<div class="text-center py-20 text-[11px] font-bold text-gray-300 uppercase">No products have been sold yet.</div>`;
        return;
    }

    const rows = sales.map(s => {
        const dateObj = new Date(s.order_date);
        const purchaseDate = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        return `
            <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td class="py-4 px-4 font-mono text-[11px] text-gray-400">#${s.order_id}</td>
                <td class="py-4 w-16"><img src="${s.product_image}" onerror="this.src='https://via.placeholder.com/100?text=V'" class="w-10 h-10 object-cover rounded shadow-inner border border-gray-100"></td>
                <td class="py-4"><div class="text-sm font-semibold text-gray-900 line-clamp-2">${s.product_name}</div></td>
                <td class="py-4"><div class="text-[11px] font-black uppercase text-gray-900">${s.customer_name}</div><div class="text-[10px] text-gray-500">${s.customer_email}</div></td>
                <td class="py-4 font-bold text-sm text-gray-900">₹${s.price}</td>
                <td class="py-4 px-4 font-semibold italic text-xs text-gray-700">${purchaseDate}</td>
            </tr>
        `;
    }).join('');
    
    container.innerHTML = `<table class="w-full text-left border-collapse"><tbody>${rows}</tbody></table>`;
}

// --- INITIAL BOOT ---
document.addEventListener('DOMContentLoaded', () => {
    loadUsers(); // Boot load Default Tab
});