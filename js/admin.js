/**
 * @file admin.js
 * @description Administrative Logic for VASTRA Team.
 * Optimized for Products and Dynamic Banners.
 */

let allAdminProducts = []; 
let editingProductId = null; 

// --- 1. General Modal Control ---
window.toggleModal = (modalId, show) => {
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

// ================= PRODUCT LOGIC =================
async function loadInventory() {
    const list = document.getElementById('admin-list');
    const emptyMsg = document.getElementById('empty-msg');
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/products');
        const data = await res.json();
        if (!data || data.length === 0) { list.innerHTML = ""; emptyMsg.classList.remove('hidden'); return; }
        emptyMsg.classList.add('hidden');
        allAdminProducts = data; 
        
        list.innerHTML = data.map(p => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4 rounded-l-lg"><img src="${p.image_url}" onerror="this.src='https://via.placeholder.com/100?text=Error'" class="w-12 h-12 object-cover rounded border border-gray-100"></td>
                <td class="py-3 px-2"><div class="text-sm font-semibold text-gray-900 max-w-[150px] md:max-w-[300px] truncate cursor-pointer" title="${p.name}">${p.name}</div></td>
                <td class="py-3 px-2 text-xs font-semibold text-gray-500 uppercase">${p.category}</td>
                <td class="py-3 px-2 font-semibold text-sm text-gray-900">₹${p.price}</td>
                <td class="py-3 px-4 text-right rounded-r-lg">
                    <div class="flex justify-end gap-4">
                        <button onclick="editProduct(${p.id})" class="text-blue-500 hover:text-blue-700 text-lg"><i class="ri-edit-box-line"></i></button>
                        <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-700 text-lg"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error("Sync Error:", err); }
}

window.editProduct = (id) => {
    const product = allAdminProducts.find(p => p.id === id);
    if (!product) return;
    editingProductId = id; 
    document.getElementById('p-title').value = product.name;
    document.getElementById('p-image').value = product.image_url;
    document.getElementById('p-link').value = product.purchase_link;
    document.getElementById('p-mrp').value = product.mrp;
    document.getElementById('p-price').value = product.price;
    document.getElementById('p-category').value = product.category;
    document.querySelector('#productModal h3').innerText = "Edit Product";
    toggleModal('productModal', true);
};

window.saveProduct = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const oldText = btn.innerText; btn.innerText = "SAVING..."; btn.disabled = true;

    const product = {
        name: document.getElementById('p-title').value,
        image_url: document.getElementById('p-image').value, 
        purchase_link: document.getElementById('p-link').value, 
        mrp: document.getElementById('p-mrp').value,
        price: document.getElementById('p-price').value,
        category: document.getElementById('p-category').value
    };

    try {
        let url = 'https://vstra-backend.onrender.com/api/add-product';
        let method = 'POST';
        if (editingProductId) { url = `https://vstra-backend.onrender.com/api/products/${editingProductId}`; method = 'PUT'; }

        const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
        if (res.ok) { toggleModal('productModal', false); await loadInventory(); } 
        else { const err = await res.json(); alert(err.message); }
    } catch (err) { alert("Server Offline."); } finally { btn.innerText = oldText; btn.disabled = false; }
};

window.deleteProduct = async (id) => {
    if (confirm("Delete this product?")) {
        try { const res = await fetch(`https://vstra-backend.onrender.com/api/products/${id}`, { method: 'DELETE' }); if (res.ok) await loadInventory(); } 
        catch (err) { alert("Delete failed."); }
    }
};

// ================= BANNER LOGIC =================
async function loadBanners() {
    const list = document.getElementById('banner-list');
    const emptyMsg = document.getElementById('empty-banner-msg');
    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/banners');
        const data = await res.json();
        if (!data || data.length === 0) { list.innerHTML = ""; emptyMsg.classList.remove('hidden'); return; }
        emptyMsg.classList.add('hidden');
        
        list.innerHTML = data.map(b => `
            <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 px-4"><img src="${b.image_url}" class="w-full h-16 object-cover rounded shadow-sm border border-gray-100"></td>
                <td class="py-3 px-2"><a href="${b.target_link}" target="_blank" class="text-xs text-blue-500 hover:underline truncate block max-w-[200px]">${b.target_link}</a></td>
                <td class="py-3 px-4 text-right">
                    <button onclick="deleteBanner(${b.id})" class="text-red-500 hover:text-red-700 text-lg"><i class="ri-delete-bin-line"></i></button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error("Banner Sync Error:", err); }
}

window.saveBanner = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const oldText = btn.innerText; btn.innerText = "UPLOADING..."; btn.disabled = true;

    const banner = { image_url: document.getElementById('b-image').value, target_link: document.getElementById('b-link').value };

    try {
        const res = await fetch('https://vstra-backend.onrender.com/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(banner) });
        if (res.ok) { toggleModal('bannerModal', false); await loadBanners(); } 
        else { const err = await res.json(); alert(err.message); }
    } catch (err) { alert("Server Offline."); } finally { btn.innerText = oldText; btn.disabled = false; }
};

window.deleteBanner = async (id) => {
    if (confirm("Delete this banner?")) {
        try { const res = await fetch(`https://vstra-backend.onrender.com/api/banners/${id}`, { method: 'DELETE' }); if (res.ok) await loadBanners(); } 
        catch (err) { alert("Delete failed."); }
    }
};

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadBanners();
});