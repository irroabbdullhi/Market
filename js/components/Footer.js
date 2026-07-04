import { t } from '../utils/helpers.js';

export function renderFooter() {
    const footerEl = document.querySelector('footer');
    if (!footerEl) return;

    footerEl.className = 'footer';
    footerEl.innerHTML = `
        <!-- Newsletter subscription banner at the top of the footer -->
        <div class="container" style="margin-bottom: 48px;">
            <div class="flex flex-col align-center text-center" style="background-color: #0f172a; color: white; padding: 48px; border-radius: var(--radius-lg); width: 100%;">
                <h2 class="text-3xl font-extrabold" style="margin-bottom: 8px;">${t('join_title')}</h2>
                <p style="color: var(--text-tertiary); max-width: 540px; margin-bottom: 24px; font-size: 14px;">${t('join_subtitle')}</p>
                <form id="newsletter-form" class="flex flex-wrap justify-center gap-3 w-full" style="max-width: 480px;">
                    <input 
                        type="email" 
                        id="newsletter-email"
                        class="form-input" 
                        placeholder="${t('placeholder_email')}" 
                        style="flex: 1; min-width: 240px; border-color: #334155; background-color: #1e293b; color: white;" 
                        required
                    >
                    <button type="submit" class="btn btn-primary" style="background-color: var(--color-brand);">${t('subscribe')}</button>
                </form>
            </div>
        </div>

        <!-- Directory Sitemap Links -->
        <div class="container grid grid-cols-4 gap-8">
            <div class="footer-column flex flex-col gap-4">
                <span class="logo-text" style="font-size: 28px;">${t('app_name')}</span>
                <p class="text-sm" style="color: var(--text-secondary); max-width: 240px;">
                    Redefining local commerce for the digital age. Premium, dependable, and community-driven.
                </p>
                <div class="flex gap-3" style="color: var(--text-tertiary);">
                    <span class="material-icons-round" style="cursor: pointer;">public</span>
                    <span class="material-icons-round" style="cursor: pointer;">verified_user</span>
                </div>
            </div>

            <div class="footer-column">
                <h4>Shop</h4>
                <ul class="footer-links">
                    <li class="footer-link-item"><a href="/#categories">${t('categories')}</a></li>
                    <li class="footer-link-item"><a href="/#flash-deals">${t('flash_deals')}</a></li>
                    <li class="footer-link-item"><a href="/#local-shops">${t('local_shops')}</a></li>
                    <li class="footer-link-item"><a href="/#new-arrivals">${t('new_arrivals')}</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4>Business</h4>
                <ul class="footer-links">
                    <li class="footer-link-item"><a href="/pages/login.html?role=seller">${t('sell_on_suuqlink')}</a></li>
                    <li class="footer-link-item"><a href="/pages/seller-dashboard.html">Merchant Portal</a></li>
                    <li class="footer-link-item"><a href="/pages/login.html?role=driver">Logistics Partners</a></li>
                    <li class="footer-link-item"><a href="#">Business API</a></li>
                </ul>
            </div>

            <div class="footer-column">
                <h4>Support</h4>
                <ul class="footer-links">
                    <li class="footer-link-item"><a href="#">Help Center</a></li>
                    <li class="footer-link-item"><a href="#">Privacy Policy</a></li>
                    <li class="footer-link-item"><a href="#">Terms of Service</a></li>
                    <li class="footer-link-item"><a href="#">Contact Support</a></li>
                </ul>
            </div>
        </div>

        <!-- Footnote copyrights -->
        <div class="container footer-bottom flex justify-between align-center">
            <p>&copy; ${new Date().getFullYear()} SuuqLink. Premium Local Commerce.</p>
            <div class="flex gap-4">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Use</a>
                <a href="#">Cookies</a>
            </div>
        </div>
    `;

    // Bind newsletter submit
    const form = document.getElementById('newsletter-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('newsletter-email');
            alert(`Thank you for subscribing, ${emailInput.value}!`);
            emailInput.value = '';
        });
    }
}
