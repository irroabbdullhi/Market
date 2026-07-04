import { getLanguage, setLanguage, t } from '../utils/helpers.js';
import { authService } from '../services/authService.js';
import { dbService } from '../services/dbService.js';

export async function renderHeader() {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    // Get active session and role
    const session = await authService.getSession();
    const user = session?.user;
    let role = null;
    let profile = null;

    if (user) {
        role = await authService.getUserRole(user.id);
        profile = await authService.getUserProfile(user.id);
    }

    // Determine cart count
    let cartCount = 0;
    if (user) {
        const cartItems = await dbService.getCart(user.id);
        cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    } else {
        const localCart = JSON.parse(localStorage.getItem('suuqlink_cart') || '[]');
        cartCount = localCart.reduce((sum, item) => sum + item.quantity, 0);
    }

    const currentLang = getLanguage();
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Render header contents
    headerEl.className = 'header-top';
    headerEl.innerHTML = `
        <div class="container flex align-center justify-between">
            <!-- Left Side Logo -->
            <a href="/" class="logo-container">
                <span class="logo-text">${t('app_name')}</span>
            </a>

            <!-- Navigation Links -->
            <nav class="nav-links">
                <a href="/#categories" class="nav-link">${t('categories')}</a>
                <a href="/#flash-deals" class="nav-link">${t('flash_deals')}</a>
                <a href="/#local-shops" class="nav-link">${t('local_shops')}</a>
                <a href="/#new-arrivals" class="nav-link">${t('new_arrivals')}</a>
            </nav>

            <!-- Search Bar -->
            <form id="global-search-form" class="search-bar" action="/pages/search-results.html" method="GET">
                <span class="material-icons-round search-icon">search</span>
                <input 
                    type="text" 
                    name="query" 
                    class="search-input" 
                    placeholder="${t('search_placeholder')}"
                    value="${new URLSearchParams(window.location.search).get('query') || ''}"
                    required
                >
            </form>

            <!-- Actions and States -->
            <div class="header-actions">
                <!-- Theme Toggle -->
                <button id="theme-toggle-btn" class="btn-icon" title="Toggle Theme">
                    <span class="material-icons-round">${isDark ? 'light_mode' : 'dark_mode'}</span>
                </button>

                <!-- Language Toggle -->
                <button id="lang-toggle-btn" class="btn-icon" title="Switch Language" style="font-size: 14px; font-weight: 700;">
                    ${currentLang === 'en' ? 'SO' : 'EN'}
                </button>

                <!-- Wishlist -->
                <a href="/pages/profile.html?tab=wishlist" class="btn-icon" title="Wishlist">
                    <span class="material-icons-round">favorite_border</span>
                </a>

                <!-- Cart -->
                <a href="/pages/cart.html" class="btn-icon cart-icon-wrapper" title="Shopping Cart">
                    <span class="material-icons-round">shopping_cart</span>
                    ${cartCount > 0 ? `<span class="cart-count">${cartCount}</span>` : ''}
                </a>

                <!-- Auth/Dashboard Button -->
                ${user ? `
                    <div style="position: relative; display: inline-block;">
                        <button id="profile-dropdown-btn" class="flex align-center gap-2 btn btn-secondary" style="padding: 6px 12px; border-radius: var(--radius-full);">
                            <img src="${profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=80'}" alt="Avatar" style="width: 24px; height: 24px; border-radius: var(--radius-full); object-fit: cover;">
                            <span class="text-sm font-semibold">${profile?.full_name?.split(' ')[0] || 'User'}</span>
                            <span class="material-icons-round" style="font-size: 16px;">keyboard_arrow_down</span>
                        </button>
                        <div id="profile-dropdown-menu" class="hidden" style="position: absolute; right: 0; top: 110%; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--card-shadow); min-width: 180px; padding: 8px; z-index: 150;">
                            <a href="/pages/profile.html" class="sidebar-link" style="padding: 8px 12px; font-size: 14px;">
                                <span class="material-icons-round">person</span> Profile
                            </a>
                            ${role === 'seller' ? `
                                <a href="/pages/seller-dashboard.html" class="sidebar-link" style="padding: 8px 12px; font-size: 14px;">
                                    <span class="material-icons-round">storefront</span> Seller Portal
                                </a>
                            ` : ''}
                            ${role === 'admin' ? `
                                <a href="/pages/admin-dashboard.html" class="sidebar-link" style="padding: 8px 12px; font-size: 14px;">
                                    <span class="material-icons-round">admin_panel_settings</span> Admin Panel
                                </a>
                            ` : ''}
                            ${role === 'driver' ? `
                                <a href="/pages/driver-dashboard.html" class="sidebar-link" style="padding: 8px 12px; font-size: 14px;">
                                    <span class="material-icons-round">local_shipping</span> Driver Portal
                                </a>
                            ` : ''}
                            <button id="header-logout-btn" class="sidebar-link text-red w-full text-left" style="padding: 8px 12px; font-size: 14px; color: #ef4444; border: none; background: none;">
                                <span class="material-icons-round">logout</span> ${t('sign_out')}
                            </button>
                        </div>
                    </div>
                ` : `
                    <a href="/pages/login.html" class="btn btn-primary">${t('sign_in')}</a>
                `}

                <!-- Sell Link for Guest/Customers -->
                ${(!user || role === 'customer') ? `
                    <a href="/pages/login.html?role=seller" class="btn btn-outline-brand hidden-mobile">${t('sell_on_suuqlink')}</a>
                ` : ''}
            </div>
        </div>
    `;

    // Bind event handlers
    setupHeaderEvents();
}

function setupHeaderEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', targetTheme);
            localStorage.setItem('suuqlink_theme', targetTheme);
            themeBtn.querySelector('.material-icons-round').textContent = targetTheme === 'dark' ? 'light_mode' : 'dark_mode';
        });
    }

    // Language Toggle
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const nextLang = getLanguage() === 'en' ? 'so' : 'en';
            setLanguage(nextLang);
        });
    }

    // Profile Dropdown Toggle
    const profileBtn = document.getElementById('profile-dropdown-btn');
    const dropdownMenu = document.getElementById('profile-dropdown-menu');
    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('hidden');
        });
        
        document.addEventListener('click', () => {
            dropdownMenu.classList.add('hidden');
        });
    }

    // Logout Action
    const logoutBtn = document.getElementById('header-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await authService.logout();
                window.location.href = '/';
            } catch (err) {
                console.error('Logout error:', err);
            }
        });
    }

    // Handle Language Change Event
    window.addEventListener('languagechange', () => {
        renderHeader();
    }, { once: true });
}

// Watch for language changes and reload DOM elements dynamically
window.addEventListener('languagechange', () => {
    // Refresh page components
    window.location.reload();
});
