/**
 * @file auth.js
 * @description Authentication, Navbar Dropdown, and Custom Professional UI Modals.
 */

// ==========================================
// 🌟 CUSTOM PROFESSIONAL UI ALERTS & MODALS
// ==========================================
window.vastraAlert = (message, type = 'info') => {
    const container = document.getElementById('custom-alert-container') || document.body;
    const bgColors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-black' };
    const icons = { success: 'ri-checkbox-circle-fill', error: 'ri-error-warning-fill', info: 'ri-information-fill' };
    
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 right-5 ${bgColors[type]} text-white px-6 py-3 rounded shadow-2xl flex items-center gap-3 z-[9999] transform translate-y-10 opacity-0 transition-all duration-300`;
    toast.innerHTML = `<i class="${icons[type]} text-xl"></i> <span class="text-sm font-bold tracking-wide">${message}</span>`;
    
    container.appendChild(toast);
    
    // Animate In
    setTimeout(() => { toast.classList.remove('translate-y-10', 'opacity-0'); }, 10);
    // Animate Out & Remove
    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

window.vastraConfirm = (title, message, confirmBtnText, onConfirm) => {
    const container = document.createElement('div');
    container.className = "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-200";
    
    container.innerHTML = `
        <div class="bg-white w-full max-w-sm rounded-lg p-6 shadow-2xl transform scale-95 transition-transform duration-200">
            <h3 class="text-lg font-black uppercase tracking-tight text-gray-900 mb-2">${title}</h3>
            <p class="text-sm text-gray-600 mb-6 font-medium">${message}</p>
            <div class="flex justify-end gap-3">
                <button id="cancel-btn" class="px-4 py-2 text-xs font-bold uppercase text-gray-500 hover:bg-gray-100 rounded transition-colors">Cancel</button>
                <button id="confirm-btn" class="px-5 py-2 text-xs font-bold uppercase tracking-widest bg-red-600 text-white rounded hover:bg-red-700 shadow-md transition-colors">${confirmBtnText}</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // Animate In
    setTimeout(() => {
        container.classList.remove('opacity-0');
        container.querySelector('div').classList.remove('scale-95');
    }, 10);

    const close = () => {
        container.classList.add('opacity-0');
        container.querySelector('div').classList.add('scale-95');
        setTimeout(() => container.remove(), 200);
    };

    container.querySelector('#cancel-btn').onclick = close;
    container.querySelector('#confirm-btn').onclick = () => { close(); onConfirm(); };
};

// ==========================================
// 🌟 AUTHENTICATION LOGIC & NAVBAR DROPDOWN
// ==========================================

function checkAuthState() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const userStr = localStorage.getItem('vastra_user');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        // 🌟 FIX: Admin status अब सीधा डेटाबेस से आएगा (user.role)
        const isAdmin = user.role === 'admin';

        authSection.innerHTML = `
            <div class="relative group cursor-pointer flex items-center gap-2 z-50">
                <div class="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner border border-gray-200">
                    ${user.name.charAt(0)}
                </div>
                <div class="hidden sm:block text-right leading-none">
                    <p class="text-[10px] font-black uppercase text-gray-800 tracking-tight">${user.name.split(' ')[0]} <i class="ri-arrow-down-s-line text-gray-500"></i></p>
                </div>
                
                <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <a href="profile.html" class="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                        <i class="ri-user-line mr-2 text-lg align-middle text-gray-400"></i> Profile
                    </a>
                    
                    ${isAdmin ? `
                    <a href="admin_dashboard.html" class="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 border-b border-gray-100">
                        <i class="ri-admin-line mr-2 text-lg align-middle text-blue-400"></i> Admin Panel
                    </a>` : ''}

                    <button onclick="triggerLogout()" class="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                        <i class="ri-logout-box-r-line mr-2 text-lg align-middle text-red-400"></i> Logout
                    </button>
                </div>
            </div>
        `;
    } else {
        authSection.innerHTML = `<a href="login.html" class="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded shadow-md hover:bg-gray-800 transition-all">Sign In</a>`;
    }
}

// 🌟 FIX: Professional Confirmation Dialog before Logout
window.triggerLogout = () => {
    vastraConfirm(
        "Sign Out", 
        "Are you sure you want to end your current session?", 
        "Log Out", 
        () => {
            localStorage.removeItem('vastra_user');
            vastraAlert('Successfully logged out.', 'success');
            setTimeout(() => { window.location.href = 'index.html'; }, 1000);
        }
    );
};

document.addEventListener('DOMContentLoaded', checkAuthState);