import { CONFIG } from './config.js';
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { showToast } from './utils/helpers.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Theme (Light/Dark)
    const savedTheme = localStorage.getItem('suuqlink_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Render Global Layout (Header & Footer)
    try {
        await renderHeader();
        renderFooter();
    } catch (err) {
        console.error('Error rendering page shell:', err);
    }

    // 3. Inject configuration setup assistant if credentials are not configured yet
    injectSupabaseAssistant();

    // 4. Cart Changes listener to re-render Header counts
    window.addEventListener('cartchange', async () => {
        await renderHeader();
    });
});

function injectSupabaseAssistant() {
    if (CONFIG.isConfigured) return;

    // Check if widget already exists
    if (document.getElementById('supabase-assistant-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'supabase-assistant-bar';
    bar.style.cssText = `
        background-color: var(--color-accent-light);
        color: var(--color-accent);
        padding: 12px;
        text-align: center;
        font-size: 13px;
        font-weight: 600;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        position: sticky;
        top: 0;
        z-index: 1000;
    `;

    bar.innerHTML = `
        <span>🔌 SuuqLink is currently running in Offline Demo Mode. Connect your Supabase instance.</span>
        <button id="open-assistant-btn" class="btn btn-primary" style="padding: 4px 12px; font-size: 11px; background-color: var(--color-brand);">Connect Supabase</button>
    `;

    document.body.prepend(bar);

    // Create configuration Modal
    const modal = document.createElement('div');
    modal.id = 'supabase-config-modal';
    modal.className = 'hidden';
    modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
        <div style="background-color: var(--bg-primary); padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border-color); max-width: 440px; width: 90%; box-shadow: var(--card-shadow);">
            <h3 class="text-xl font-bold" style="margin-bottom: 8px; color: var(--text-primary);">Supabase Connection Manager</h3>
            <p class="text-xs" style="color: var(--text-secondary); margin-bottom: 20px; line-height: 1.4;">
                Enter your Supabase API credentials to transition from local mockup data to a fully functional, live database back-end. You can run the migrations file inside <code>supabase/migrations.sql</code> in your Supabase SQL editor.
            </p>
            <form id="supabase-config-form">
                <div class="form-group">
                    <label class="form-label">Supabase URL</label>
                    <input type="url" id="config-url" class="form-input" placeholder="https://xxxx.supabase.co" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Supabase Anon Key</label>
                    <input type="text" id="config-key" class="form-input" placeholder="eyJhbGciOi..." required>
                </div>
                <div class="flex justify-between" style="margin-top: 24px;">
                    <button type="button" id="close-config-btn" class="btn btn-secondary" style="padding: 8px 16px;">Cancel</button>
                    <button type="submit" class="btn btn-primary" style="padding: 8px 16px;">Save & Reload</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('open-assistant-btn').addEventListener('click', () => {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
    });

    document.getElementById('close-config-btn').addEventListener('click', () => {
        modal.style.display = 'none';
        modal.classList.add('hidden');
    });

    document.getElementById('supabase-config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('config-url').value;
        const key = document.getElementById('config-key').value;

        CONFIG.setCredentials(url, key);
        showToast('Supabase connected successfully!');
        
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}
