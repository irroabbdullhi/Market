import { getSupabase } from './supabaseClient.js';
import { CONFIG } from '../config.js';

// --- MOCK DATA FALLBACKS ---
const MOCK_CATEGORIES = [
    { id: 1, name_en: 'Groceries', name_so: 'Raashinka', slug: 'groceries', icon: 'shopping_basket' },
    { id: 2, name_en: 'Electronics', name_so: 'Elektaroonigga', slug: 'electronics', icon: 'devices' },
    { id: 3, name_en: 'Fashion', name_so: 'Moodada', slug: 'fashion', icon: 'checkroom' },
    { id: 4, name_en: 'Home Decor', name_so: 'Qurxinta Guriga', slug: 'home-decor', icon: 'home' },
    { id: 5, name_en: 'Personal Care', name_so: 'Daryeelka Shakhsiga', slug: 'personal-care', icon: 'local_hospital' },
    { id: 6, name_en: 'Stationery', name_so: 'Agabka Qoraalka', slug: 'stationery', icon: 'menu_book' }
];

const MOCK_BRANDS = [
    { id: 1, name: 'Soniq', slug: 'soniq' },
    { id: 2, name: 'Petbound', slug: 'petbound' },
    { id: 3, name: 'TechHub', slug: 'techhub' },
    { id: 4, name: 'GreenLeaf', slug: 'greenleaf' },
    { id: 5, name: 'Organic Harvest', slug: 'organic-harvest' },
    { id: 6, name: 'UrbanStyle', slug: 'urbanstyle' }
];

const MOCK_PRODUCTS = [
    {
        id: 'p1',
        name_en: 'EliteSound Pro X1000 - Wireless Noise Cancelling',
        name_so: 'EliteSound Pro X1000 - Sameecadaha Qaylada Reeba',
        description_en: 'Experience sound like never before with the EliteSound Pro X1000. Engineered for those who demand uncompromising audio quality and world-class noise cancellation, these headphones redefine your listening experience whether you are commuting, working in a bustling office, or relaxing at home. Our proprietary Adaptive Silence technology scans your environment 1,000 times per second to block out even the most persistent ambient noises.',
        description_so: 'La kulan cod ka duwan mid kasta oo aad hore u maqashay. Sameecadaha EliteSound Pro X1000 waxaa loogu talagalay dadka doonaya cod tayo sare leh iyo tignoolajiyada qaylada reebta oo heer caalami ah. Tignoolajiyada Adaptive Silence waxay iskaan garaysaa hareerahaaga 1,000 jeer ilbiriqsigiiba si ay u xanibto qaylo kasta.',
        price: 349.00,
        discount_price: 349.00,
        original_price: 429.00,
        discount_percentage: 18,
        sku: 'SQ-SONIQ-X1000',
        barcode: '840192301920',
        stock: 42,
        type: 'physical',
        is_active: true,
        category_id: 2,
        brand_id: 1,
        seller_id: 's1',
        seller_name: 'Soniq Local Electronics',
        seller_rating: 4.98,
        rating: 4.9,
        reviews_count: 1200,
        images: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800',
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800'
        ],
        colors: ['Midnight Silver', 'Ice Blue', 'Charcoal Black'],
        features: [
            'Up to 45 hours of wireless playtime on a single charge.',
            'Smart Touch™ controls for effortless navigation.',
            'Multi-point pairing—connect to two devices simultaneously.',
            'Crystal clear calls with beam-forming microphone technology.'
        ],
        specs: {
            'Brand': 'Soniq',
            'Model': 'Pro X1000',
            'Battery': '45 Hours',
            'Connectivity': 'Bluetooth 5.3',
            'Weight': '250g'
        }
    },
    {
        id: 'p2',
        name_en: 'Petbound Wireless Earbuds',
        name_so: 'Petbound Kula-dhegaha Dhegta Bilaa siligga',
        description_en: 'Compact wireless earbuds with deep bass and snug fit. Waterproof casing is perfect for gym and outdoor sports.',
        description_so: 'Kula-dhegaha dhegta oo yar, bilaa silig ah, leh cod hoose oo xoogan. Ku haboon jimicsiga iyo ciyaaraha dibada.',
        price: 199.00,
        discount_price: 199.00,
        original_price: 249.00,
        discount_percentage: 15,
        sku: 'SQ-PETB-EAR',
        barcode: '840192301921',
        stock: 15,
        type: 'physical',
        is_active: true,
        category_id: 2,
        brand_id: 2,
        seller_id: 's2',
        seller_name: 'Petbound Tech Shop',
        seller_rating: 4.75,
        rating: 4.8,
        reviews_count: 120,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=800'],
        features: ['IPX7 Waterproof rating', '10mm Dynamic Drivers', '30hr battery life with case'],
        specs: { 'Brand': 'Petbound', 'Model': 'PB-Wireless', 'Battery': '30 Hours', 'Connectivity': 'Bluetooth 5.2' }
    },
    {
        id: 'p3',
        name_en: 'Organic Harvest Market Fresh Basket',
        name_so: 'Kallada Khudaarta Cusub ee Beerta',
        description_en: 'Fresh organic greens and vegetables directly sourced from local farms in Janale.',
        description_so: 'Khudaar iyo caleemo cusub oo organic ah oo laga keenay beeraleyda maxaliga ah ee Janaale.',
        price: 45.00,
        discount_price: 45.00,
        original_price: 45.00,
        discount_percentage: 0,
        sku: 'SQ-ORG-FRESH',
        barcode: '840192301922',
        stock: 8,
        type: 'physical',
        is_active: true,
        category_id: 1,
        brand_id: 5,
        seller_id: 's3',
        seller_name: 'GreenLeaf Organics',
        seller_rating: 4.85,
        rating: 4.9,
        reviews_count: 88,
        images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'],
        features: ['100% Pesticide Free', 'Picked daily on demand', 'Supports local farmers'],
        specs: { 'Origin': 'Janale Farms', 'Weight': '5kg', 'Freshness': 'Guaranteed' }
    },
    {
        id: 'p4',
        name_en: 'Minimalist Chrono Watch',
        name_so: 'Saacada Fudud ee Chrono',
        description_en: 'A timeless minimalist watch featuring genuine leather straps and a stainless steel body.',
        description_so: 'Saacad fudud oo qurxoon oo ka samaysan maqaar sax ah iyo birta aan daxaloobin.',
        price: 120.00,
        discount_price: 120.00,
        original_price: 120.00,
        discount_percentage: 0,
        sku: 'SQ-CHRONO-MIN',
        barcode: '840192301923',
        stock: 12,
        type: 'physical',
        is_active: true,
        category_id: 3,
        brand_id: 6,
        seller_id: 's4',
        seller_name: 'UrbanStyle Boutique',
        seller_rating: 4.60,
        rating: 4.7,
        reviews_count: 52,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800'],
        features: ['3ATM Water Resistant', 'Japanese Quartz Movement', 'Genuine Calfskin Leather strap'],
        specs: { 'Brand': 'UrbanStyle', 'Diameter': '40mm', 'Strap': 'Leather' }
    },
    {
        id: 'p5',
        name_en: 'Smart Home Speaker 2.0',
        name_so: 'Sameecada caqliga ee Guriga 2.0',
        description_en: 'High fidelity smart speaker with built-in voice assistant and localized capabilities.',
        description_so: 'Sameecad caqli badan oo guriga ah oo leh caawiyaha codka oo ku hadasha luuqadaada.',
        price: 89.00,
        discount_price: 89.00,
        original_price: 109.00,
        discount_percentage: 15,
        sku: 'SQ-SMART-SPK',
        barcode: '840192301924',
        stock: 22,
        type: 'physical',
        is_active: true,
        category_id: 2,
        brand_id: 3,
        seller_id: 's5',
        seller_name: 'TechHub Local',
        seller_rating: 4.70,
        rating: 4.6,
        reviews_count: 170,
        images: ['https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=800'],
        features: ['360 Omnidirectional sound', 'Voice Control Enabled', 'Smart Home Integration'],
        specs: { 'Brand': 'TechHub', 'Model': 'Speaker 2.0', 'Power': '30W' }
    }
];

const MOCK_SHOPS = [
    { id: 's3', name: 'GreenLeaf Organics', rating: 4.8, distance: '2.5 miles away', desc: 'Premium organic groceries sourced directly from local sustainable farms.', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=100' },
    { id: 's5', name: 'TechHub Local', rating: 4.7, distance: '1.1 miles away', desc: 'Your neighborhood destination for the latest gadgets and professional advice.', logo: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=100' },
    { id: 's4', name: 'UrbanStyle Boutique', rating: 4.6, distance: '3.5 miles away', desc: 'Curated fashion selections from local designers and premium independent brands.', logo: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100' }
];

const MOCK_BANNERS = [
    { id: 1, image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000', title_en: 'Everything You Need From Local Businesses', title_so: 'Wax Kasta oo Aad U Baahan Tahay oo Laga Helo Ganacsiyada Maxaliga ah', link_url: '#categories' }
];

// In-Memory state for local development when Supabase is not connected
const localState = {
    cart: [],
    wishlist: [],
    orders: [
        { id: 'SQ-98421', customer_name: 'Marcus Wright', customer_id: 'c1', total_amount: 452.00, status: 'pending', payment_status: 'pending', delivery_status: 'assigned', date: 'Oct 24, 2023', items_count: 3 },
        { id: 'SQ-98420', customer_name: 'Elena Chen', customer_id: 'c2', total_amount: 128.50, status: 'paid', payment_status: 'verified', delivery_status: 'picked_up', date: 'Oct 24, 2023', items_count: 1 },
        { id: 'SQ-98419', customer_name: 'James Dorian', customer_id: 'c3', total_amount: 2104.00, status: 'completed', payment_status: 'verified', delivery_status: 'delivered', date: 'Oct 23, 2023', items_count: 5 }
    ],
    reviews: [
        { id: 1, product_id: 'p1', customer_name: 'Ahmed Y.', rating: 5, comment: 'Exceptional headphones! The noise cancellation blocks everything.', created_at: '2023-10-25' }
    ]
};

// --- DATABASE SERVICE IMPLEMENTATION ---
export const dbService = {
    // 1. Categories & Brands
    async getCategories() {
        const supabase = getSupabase();
        if (!supabase) return MOCK_CATEGORIES;

        const { data, error } = await supabase.from('categories').select('*').order('name_en', { ascending: true });
        if (error) {
            console.error('Error fetching categories, falling back to mock:', error);
            return MOCK_CATEGORIES;
        }
        return data;
    },

    async getBrands() {
        const supabase = getSupabase();
        if (!supabase) return MOCK_BRANDS;

        const { data, error } = await supabase.from('brands').select('*').order('name', { ascending: true });
        if (error) {
            console.error('Error fetching brands, falling back to mock:', error);
            return MOCK_BRANDS;
        }
        return data;
    },

    // 2. Products
    async getProducts(options = {}) {
        const supabase = getSupabase();
        if (!supabase) {
            let products = [...MOCK_PRODUCTS];
            if (options.categorySlug) {
                const category = MOCK_CATEGORIES.find(c => c.slug === options.categorySlug);
                if (category) products = products.filter(p => p.category_id === category.id);
            }
            if (options.search) {
                const term = options.search.toLowerCase();
                products = products.filter(p => p.name_en.toLowerCase().includes(term) || p.name_so.toLowerCase().includes(term));
            }
            if (options.sellerId) {
                products = products.filter(p => p.seller_id === options.sellerId);
            }
            return products;
        }

        let query = supabase.from('products').select(`
            *,
            categories (name_en, name_so, slug),
            brands (name, slug),
            product_images (image_url, display_order)
        `).eq('is_active', true);

        if (options.categorySlug) {
            const { data: cat } = await supabase.from('categories').select('id').eq('slug', options.categorySlug).maybeSingle();
            if (cat) query = query.eq('category_id', cat.id);
        }

        if (options.brandSlug) {
            const { data: br } = await supabase.from('brands').select('id').eq('slug', options.brandSlug).maybeSingle();
            if (br) query = query.eq('brand_id', br.id);
        }

        if (options.search) {
            query = query.or(`name_en.ilike.%${options.search}%,name_so.ilike.%${options.search}%,description_en.ilike.%${options.search}%,description_so.ilike.%${options.search}%`);
        }

        if (options.sellerId) {
            query = query.eq('seller_id', options.sellerId);
        }

        if (options.minPrice) query = query.gte('price', options.minPrice);
        if (options.maxPrice) query = query.lte('price', options.maxPrice);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching products, falling back to mock:', error);
            return MOCK_PRODUCTS;
        }

        // Map relation structures to easy property formats
        return data.map(p => ({
            ...p,
            images: p.product_images?.sort((a,b) => a.display_order - b.display_order).map(img => img.image_url) || [],
            seller_name: 'Shop Owner' // Simplification
        }));
    },

    async getProductById(id) {
        const supabase = getSupabase();
        if (!supabase || id.startsWith('p')) {
            return MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
        }

        const { data, error } = await supabase.from('products').select(`
            *,
            categories (*),
            brands (*),
            product_images (*),
            profiles!products_seller_id_fkey (full_name, avatar_url)
        `).eq('id', id).maybeSingle();

        if (error || !data) return null;

        // Fetch specs from metadata if stored in DB or populate standard specs
        const features = data.description_en.split('.').filter(f => f.trim().length > 10).map(f => f.trim() + '.');

        return {
            ...data,
            images: data.product_images?.sort((a,b) => a.display_order - b.display_order).map(img => img.image_url) || [],
            seller_name: data.profiles?.full_name || 'Verified Partner',
            features: features.slice(0, 4),
            specs: {
                'Brand': data.brands?.name || 'Local',
                'Model': data.sku || 'N/A',
                'Type': data.type,
                'Barcode': data.barcode || 'N/A'
            }
        };
    },

    async getLocalShops() {
        return MOCK_SHOPS;
    },

    async getBanners() {
        const supabase = getSupabase();
        if (!supabase) return MOCK_BANNERS;

        const { data, error } = await supabase.from('banners').select('*').eq('is_active', true);
        if (error) return MOCK_BANNERS;
        return data;
    },

    // 3. Cart & Wishlist
    async getCart(userId) {
        const supabase = getSupabase();
        if (!supabase) return localState.cart;

        const { data, error } = await supabase.from('cart').select(`
            *,
            products (*)
        `).eq('customer_id', userId);

        if (error) return [];
        return data;
    },

    async addToCart(userId, productId, quantity = 1) {
        const supabase = getSupabase();
        if (!supabase) {
            const existing = localState.cart.find(c => c.product_id === productId);
            if (existing) {
                existing.quantity += quantity;
            } else {
                localState.cart.push({ id: Math.random().toString(), product_id: productId, quantity, products: MOCK_PRODUCTS.find(p => p.id === productId) });
            }
            return localState.cart;
        }

        const { data, error } = await supabase.from('cart').upsert(
            { customer_id: userId, product_id: productId, quantity },
            { onConflict: 'customer_id,product_id' }
        ).select();

        if (error) throw error;
        return data;
    },

    async updateCartQuantity(cartId, quantity) {
        const supabase = getSupabase();
        if (!supabase) {
            const existing = localState.cart.find(c => c.id === cartId);
            if (existing) existing.quantity = quantity;
            return;
        }

        const { error } = await supabase.from('cart').update({ quantity }).eq('id', cartId);
        if (error) throw error;
    },

    async removeFromCart(cartId) {
        const supabase = getSupabase();
        if (!supabase) {
            localState.cart = localState.cart.filter(c => c.id !== cartId);
            return;
        }

        const { error } = await supabase.from('cart').delete().eq('id', cartId);
        if (error) throw error;
    },

    async clearCart(userId) {
        const supabase = getSupabase();
        if (!supabase) {
            localState.cart = [];
            return;
        }

        await supabase.from('cart').delete().eq('customer_id', userId);
    },

    // 4. Coupons
    async getCoupon(code) {
        const supabase = getSupabase();
        if (!supabase) {
            if (code.toUpperCase() === 'WELCOME10') {
                return { code: 'WELCOME10', discount_type: 'percentage', discount_value: 10, min_order_amount: 50 };
            }
            if (code.toUpperCase() === 'ADE15') {
                return { code: 'ADE15', discount_type: 'fixed', discount_value: 15, min_order_amount: 100 };
            }
            return null;
        }

        const { data, error } = await supabase.from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('is_active', true)
            .gte('expires_at', new Date().toISOString())
            .maybeSingle();

        if (error) return null;
        return data;
    },

    // 5. Orders & Payments
    async createOrder(orderData, items) {
        const supabase = getSupabase();
        if (!supabase) {
            const newOrder = {
                id: 'SQ-' + Math.floor(100000 + Math.random() * 900000),
                customer_id: orderData.customer_id,
                total_amount: orderData.total_amount,
                status: 'pending',
                payment_status: 'pending',
                delivery_status: 'assigned',
                payment_method: orderData.payment_method,
                shipping_address: orderData.shipping_address,
                phone: orderData.phone,
                delivery_method: orderData.delivery_method,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                items_count: items.length
            };
            localState.orders.unshift(newOrder);
            localState.cart = [];
            return newOrder;
        }

        // 1. Create main order record
        const { data: order, error: orderErr } = await supabase.from('orders').insert({
            customer_id: orderData.customer_id,
            total_amount: orderData.total_amount,
            shipping_address: orderData.shipping_address,
            phone: orderData.phone,
            payment_method: orderData.payment_method,
            delivery_method: orderData.delivery_method,
            delivery_fee: orderData.delivery_fee,
            tax: orderData.tax,
            discount_amount: orderData.discount_amount,
            coupon_code: orderData.coupon_code
        }).select().single();

        if (orderErr) throw orderErr;

        // 2. Map items with order_id and seller_id
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            seller_id: item.seller_id
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItems);
        if (itemsErr) throw itemsErr;

        // 3. Clear customer's cart
        await this.clearCart(orderData.customer_id);

        // 4. Create empty delivery record
        await supabase.from('deliveries').insert({
            order_id: order.id,
            delivery_status: 'assigned'
        });

        return order;
    },

    async submitPaymentProof(orderId, amount, method, reference, fileBlob) {
        const supabase = getSupabase();
        let proofUrl = '';

        if (supabase && fileBlob) {
            // Upload proof to Supabase Storage
            const user = (await supabase.auth.getUser()).data.user;
            const fileExt = fileBlob.name ? fileBlob.name.split('.').pop() : 'png';
            const filePath = `${user.id}/${Date.now()}_proof.${fileExt}`;
            
            const { error: uploadErr } = await supabase.storage
                .from('payment-proofs')
                .upload(filePath, fileBlob);

            if (uploadErr) throw uploadErr;

            const { data } = supabase.storage
                .from('payment-proofs')
                .getPublicUrl(filePath);

            proofUrl = data.publicUrl;
        } else {
            proofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=400';
        }

        if (!supabase) {
            const order = localState.orders.find(o => o.id === orderId);
            if (order) {
                order.payment_status = 'pending';
                order.payment_proof_url = proofUrl;
            }
            return;
        }

        // Update payment table and order details
        const { error: payErr } = await supabase.from('payments').insert({
            order_id: orderId,
            amount: amount,
            payment_method: method,
            transaction_reference: reference,
            status: 'pending'
        });

        if (payErr) throw payErr;

        await supabase.from('orders').update({
            payment_proof_url: proofUrl,
            status: 'pending'
        }).eq('id', orderId);
    },

    async getOrders(role, userId) {
        const supabase = getSupabase();
        if (!supabase) {
            if (role === 'seller') {
                return localState.orders; // Simplification
            }
            return localState.orders;
        }

        let query = supabase.from('orders').select(`
            *,
            profiles!orders_customer_id_fkey (full_name),
            order_items (*, products (*))
        `);

        if (role === 'customer') {
            query = query.eq('customer_id', userId);
        } else if (role === 'seller') {
            // Fetch orders containing products owned by this seller
            const { data: itemData } = await supabase.from('order_items').select('order_id').eq('seller_id', userId);
            const orderIds = [...new Set(itemData?.map(item => item.order_id) || [])];
            query = query.in('id', orderIds);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) return [];
        return data;
    },

    async updateOrderStatus(orderId, status) {
        const supabase = getSupabase();
        if (!supabase) {
            const order = localState.orders.find(o => o.id === orderId);
            if (order) order.status = status;
            return;
        }

        await supabase.from('orders').update({ status }).eq('id', orderId);
    },

    // 6. Admin Panel specific database functions
    async getPendingPayments() {
        const supabase = getSupabase();
        if (!supabase) {
            return localState.orders.filter(o => o.payment_status === 'pending');
        }

        const { data, error } = await supabase.from('payments')
            .select(`
                *,
                orders (*, profiles!orders_customer_id_fkey (full_name))
            `)
            .eq('status', 'pending');

        if (error) return [];
        return data;
    },

    async approvePayment(paymentId, adminId) {
        const supabase = getSupabase();
        if (!supabase) {
            // Find order matching ID
            const order = localState.orders.find(o => o.id === paymentId);
            if (order) {
                order.payment_status = 'verified';
                order.status = 'paid';
            }
            return;
        }

        // Transaction updates: payments status to verified & orders status to paid
        const { data: payment } = await supabase.from('payments').update({
            status: 'verified',
            verified_by: adminId,
            verified_at: new Date().toISOString()
        }).eq('id', paymentId).select().single();

        if (payment) {
            await supabase.from('orders').update({
                payment_status: 'verified',
                status: 'paid'
            }).eq('id', payment.order_id);
        }
    },

    async rejectPayment(paymentId) {
        const supabase = getSupabase();
        if (!supabase) {
            const order = localState.orders.find(o => o.id === paymentId);
            if (order) order.payment_status = 'rejected';
            return;
        }

        const { data: payment } = await supabase.from('payments').update({
            status: 'rejected'
        }).eq('id', paymentId).select().single();

        if (payment) {
            await supabase.from('orders').update({
                payment_status: 'rejected'
            }).eq('id', payment.order_id);
        }
    },

    // 7. Seller Management dashboard operations
    async addProduct(productData, fileBlob) {
        const supabase = getSupabase();
        let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400';

        if (supabase && fileBlob) {
            const fileExt = fileBlob.name ? fileBlob.name.split('.').pop() : 'png';
            const filePath = `${productData.seller_id}/${Date.now()}_prod.${fileExt}`;
            
            const { error: uploadErr } = await supabase.storage
                .from('product-images')
                .upload(filePath, fileBlob);

            if (!uploadErr) {
                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);
                imageUrl = data.publicUrl;
            }
        }

        if (!supabase) {
            const newProd = {
                id: 'p' + (MOCK_PRODUCTS.length + 1),
                name_en: productData.name_en,
                name_so: productData.name_so,
                description_en: productData.description_en,
                description_so: productData.description_so,
                price: parseFloat(productData.price),
                discount_price: parseFloat(productData.price),
                original_price: parseFloat(productData.price),
                sku: productData.sku,
                stock: parseInt(productData.stock),
                type: productData.type,
                images: [imageUrl],
                seller_id: productData.seller_id,
                seller_name: 'My Store',
                rating: 5.0,
                reviews_count: 0
            };
            MOCK_PRODUCTS.unshift(newProd);
            return newProd;
        }

        // Insert into products table (stock column fires the inventory log trigger)
        const { data: product, error } = await supabase.from('products').insert({
            seller_id: productData.seller_id,
            name_en: productData.name_en,
            name_so: productData.name_so,
            description_en: productData.description_en,
            description_so: productData.description_so,
            category_id: productData.category_id,
            brand_id: productData.brand_id,
            price: parseFloat(productData.price),
            sku: productData.sku,
            barcode: productData.barcode,
            stock: parseInt(productData.stock),
            type: productData.type,
            seo_title: productData.seo_title,
            seo_description: productData.seo_description
        }).select().single();

        if (error) throw error;

        // Insert image
        await supabase.from('product_images').insert({
            product_id: product.id,
            image_url: imageUrl,
            display_order: 0
        });

        return product;
    },

    // 8. Logistics and Driver Operations
    async getDrivers() {
        const supabase = getSupabase();
        if (!supabase) {
            return [{ user_id: 'd1', full_name: 'Driver Ali', vehicle_type: 'Motorcycle', license_plate: 'SL-2039', status: 'idle' }];
        }

        const { data, error } = await supabase.from('drivers')
            .select(`
                *,
                profiles (full_name, phone)
            `);
        
        if (error) return [];
        return data.map(d => ({
            user_id: d.user_id,
            full_name: d.profiles?.full_name || 'Active Driver',
            phone: d.profiles?.phone || '',
            vehicle_type: d.vehicle_type,
            license_plate: d.license_plate,
            status: d.status
        }));
    },

    async assignDriver(orderId, driverId) {
        const supabase = getSupabase();
        if (!supabase) return;

        await supabase.from('deliveries')
            .update({ driver_id: driverId, delivery_status: 'assigned' })
            .eq('order_id', orderId);
        
        await supabase.from('drivers')
            .update({ status: 'delivering' })
            .eq('user_id', driverId);
    },

    async getDriverDeliveries(driverId) {
        const supabase = getSupabase();
        if (!supabase) {
            return localState.orders.filter(o => o.delivery_status !== 'delivered');
        }

        const { data, error } = await supabase.from('deliveries')
            .select(`
                *,
                orders (*, profiles!orders_customer_id_fkey (full_name, phone))
            `)
            .eq('driver_id', driverId);

        if (error) return [];
        return data;
    },

    async updateDeliveryStatus(deliveryId, status) {
        const supabase = getSupabase();
        if (!supabase) {
            // Find in mock orders
            const order = localState.orders.find(o => o.delivery_status !== 'delivered');
            if (order) order.delivery_status = status;
            return;
        }

        const updates = {
            delivery_status: status,
            updated_at: new Date().toISOString()
        };

        if (status === 'delivered') {
            updates.actual_delivery_time = new Date().toISOString();
        }

        const { data: del } = await supabase.from('deliveries')
            .update(updates)
            .eq('id', deliveryId)
            .select()
            .single();

        if (del && status === 'delivered') {
            // Update parent order
            await supabase.from('orders').update({ status: 'completed' }).eq('id', del.order_id);
            // Free driver
            if (del.driver_id) {
                await supabase.from('drivers').update({ status: 'idle' }).eq('user_id', del.driver_id);
            }
        }
    },

    // 9. Reviews & Customer engagements
    async getProductReviews(productId) {
        const supabase = getSupabase();
        if (!supabase || productId.startsWith('p')) {
            return localState.reviews.filter(r => r.product_id === productId);
        }

        const { data, error } = await supabase.from('reviews')
            .select(`
                *,
                profiles (full_name)
            `)
            .eq('product_id', productId);

        if (error) return [];
        return data;
    },

    async addReview(productId, customerId, rating, comment) {
        const supabase = getSupabase();
        if (!supabase) {
            const newRev = { id: Math.random(), product_id: productId, customer_name: 'Valued Customer', rating, comment, created_at: new Date().toISOString().split('T')[0] };
            localState.reviews.push(newRev);
            return;
        }

        await supabase.from('reviews').insert({
            product_id: productId,
            customer_id: customerId,
            rating,
            comment
        });
    }
};
