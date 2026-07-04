import { getLocalizedText, formatCurrency, showToast } from '../utils/helpers.js';
import { dbService } from '../services/dbService.js';
import { authService } from '../services/authService.js';

export function createProductCardHTML(product) {
    const name = getLocalizedText(product, 'name');
    const price = product.price;
    
    // Check for original price or discount calculations
    const originalPrice = product.original_price || product.price;
    const hasDiscount = originalPrice > price;
    const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
    
    const imageUrl = product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';
    const rating = product.rating || 5.0;
    const reviewsCount = product.reviews_count || 0;
    
    // Badge logic
    let badgeHTML = '';
    if (hasDiscount) {
        badgeHTML = `<span class="product-badge badge-discount">${discountPercent}% OFF</span>`;
    } else if (product.stock <= 5 && product.stock > 0) {
        badgeHTML = `<span class="product-badge badge-new" style="background-color: var(--color-accent);">Low Stock</span>`;
    } else if (product.type === 'digital') {
        badgeHTML = `<span class="product-badge badge-new" style="background-color: #8b5cf6;">Digital</span>`;
    } else if (product.is_new) {
        badgeHTML = `<span class="product-badge badge-new">NEW</span>`;
    }

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-container">
                <a href="/pages/product-detail.html?id=${product.id}">
                    <img class="product-card-img" src="${imageUrl}" alt="${name}" loading="lazy">
                </a>
                ${badgeHTML}
                <button class="product-wishlist-btn" title="Add to Wishlist">
                    <span class="material-icons-round">favorite_border</span>
                </button>
            </div>
            <div class="product-info">
                <span class="product-brand">${product.brands?.name || 'Local Store'}</span>
                <a href="/pages/product-detail.html?id=${product.id}">
                    <h3 class="product-title">${name}</h3>
                </a>
                <div class="product-rating">
                    <span class="material-icons-round rating-star-icon">star</span>
                    <span class="font-semibold">${rating}</span>
                    <span style="color: var(--text-tertiary);">(${reviewsCount} reviews)</span>
                </div>
                <div class="product-price-row">
                    <div class="price-container">
                        <span class="current-price">${formatCurrency(price)}</span>
                        ${hasDiscount ? `<span class="original-price">${formatCurrency(originalPrice)}</span>` : ''}
                    </div>
                    <button class="add-cart-btn-circle add-to-cart-direct" title="Add to Cart">
                        <span class="material-icons-round" style="font-size: 20px;">add_shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Bind event listeners to product cards inside a parent container
export function bindProductCardListeners(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Direct Add To Cart
    container.querySelectorAll('.add-to-cart-direct').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = btn.closest('.product-card');
            const productId = card.dataset.productId;

            try {
                const session = await authService.getSession();
                if (session?.user) {
                    await dbService.addToCart(session.user.id, productId, 1);
                } else {
                    // Guest Cart additions stored in local storage
                    const localCart = JSON.parse(localStorage.getItem('suuqlink_cart') || '[]');
                    const existing = localCart.find(c => c.product_id === productId);
                    if (existing) {
                        existing.quantity += 1;
                    } else {
                        localCart.push({ product_id: productId, quantity: 1 });
                    }
                    localStorage.setItem('suuqlink_cart', JSON.stringify(localCart));
                }

                showToast('Item added to cart!');
                
                // Dispatch event to recalculate header counts
                window.dispatchEvent(new Event('cartchange'));
                
            } catch (err) {
                console.error('Cart add error:', err);
                showToast('Failed to add item to cart', 'error');
            }
        });
    });

    // Wishlist Toggle
    container.querySelectorAll('.product-wishlist-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const card = btn.closest('.product-card');
            const productId = card.dataset.productId;

            try {
                const session = await authService.getSession();
                if (!session?.user) {
                    showToast('Please sign in to manage wishlist', 'warning');
                    setTimeout(() => {
                        window.location.href = '/pages/login.html';
                    }, 1500);
                    return;
                }

                // Check or insert wishlist
                const supabase = window.supabase?.createClient 
                    ? window.supabase.createClient(localStorage.getItem('SUUQLINK_SUPABASE_URL'), localStorage.getItem('SUUQLINK_SUPABASE_KEY'))
                    : null;
                
                if (supabase) {
                    // Check if already in wishlist
                    const { data } = await supabase.from('wishlist')
                        .select('id')
                        .eq('customer_id', session.user.id)
                        .eq('product_id', productId)
                        .maybeSingle();

                    if (data) {
                        await supabase.from('wishlist').delete().eq('id', data.id);
                        btn.querySelector('.material-icons-round').textContent = 'favorite_border';
                        btn.style.color = 'inherit';
                        showToast('Removed from wishlist');
                    } else {
                        await supabase.from('wishlist').insert({ customer_id: session.user.id, product_id: productId });
                        btn.querySelector('.material-icons-round').textContent = 'favorite';
                        btn.style.color = '#ef4444';
                        showToast('Added to wishlist!');
                    }
                } else {
                    // Offline/Fallback mode simulation
                    const localWish = JSON.parse(localStorage.getItem('suuqlink_wishlist') || '[]');
                    const idx = localWish.indexOf(productId);
                    if (idx > -1) {
                        localWish.splice(idx, 1);
                        btn.querySelector('.material-icons-round').textContent = 'favorite_border';
                        btn.style.color = 'inherit';
                        showToast('Removed from wishlist');
                    } else {
                        localWish.push(productId);
                        btn.querySelector('.material-icons-round').textContent = 'favorite';
                        btn.style.color = '#ef4444';
                        showToast('Added to wishlist!');
                    }
                    localStorage.setItem('suuqlink_wishlist', JSON.stringify(localWish));
                }
            } catch (err) {
                console.error('Wishlist error:', err);
            }
        });
    });
}
