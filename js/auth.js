/**
 * @file auth.js
 * @description Authentication & Profile Dropdown Logic
 */

function checkAuthState() {
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    const userStr = localStorage.getItem('vastra_user');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        const isAdmin = user.role === 'admin' || user.email === "kumaraayush7501@gmail.com";

        authSection.innerHTML = `
            <div class="relative group cursor-pointer flex items-center gap-2 z-50">
                <div class="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">${user.name.charAt(0)}</div>
                <div class="hidden sm:block text-right leading-none">
                    <p class="text-[10px] font-black uppercase text-gray-800">${user.name.split(' ')[0]} <i class="ri-arrow-down-s-line text-gray-500"></i></p>
                </div>
                
                <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                    <a href="profile.html" class="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                        <i class="ri-user-line mr-2 text-lg align-middle"></i> Profile
                    </a>
                    
                    ${isAdmin ? `
                    <a href="admin.html" class="block px-4 py-3 text-xs font-bold uppercase tracking-widest text-blue-600 hover:bg-blue-50 border-b border-gray-100">
                        <i class="ri-admin-line mr-2 text-lg align-middle"></i> Admin Panel
                    </a>` : ''}

                    <button onclick="handleLogout()" class="w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-600 hover:bg-red-50 transition-colors">
                        <i class="ri-logout-box-r-line mr-2 text-lg align-middle"></i> Logout
                    </button>
                </div>
            </div>
        `;
    } else {
        authSection.innerHTML = `<a href="login.html" class="bg-black text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-slate-800 transition-all">Login</a>`;
    }
}

window.handleLogout = () => {
    localStorage.removeItem('vastra_user');
    window.location.href = 'index.html'; // Redirect to home on logout
};

document.addEventListener('DOMContentLoaded', checkAuthState);