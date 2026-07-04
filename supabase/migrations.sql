-- Database Migrations for SuuqLink Multi-Vendor Marketplace

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('customer', 'seller', 'driver', 'admin')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, role)
);

-- Enable RLS on Profiles and Roles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. TAXONOMY (CATEGORIES & BRANDS)
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_so TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.brands (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

-- 3. PRODUCTS & IMAGES
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name_en TEXT NOT NULL,
    name_so TEXT NOT NULL,
    description_en TEXT,
    description_so TEXT,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand_id BIGINT REFERENCES public.brands(id) ON DELETE SET NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    sku TEXT UNIQUE,
    barcode TEXT,
    stock INT DEFAULT 0 CHECK (stock >= 0),
    type TEXT CHECK (type IN ('physical', 'digital')) DEFAULT 'physical' NOT NULL,
    file_url TEXT, -- For digital products downloads
    is_active BOOLEAN DEFAULT true NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id BIGSERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL UNIQUE,
    quantity INT DEFAULT 0 CHECK (quantity >= 0),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- 4. DISCOUNTS & BANNERS
CREATE TABLE IF NOT EXISTS public.coupons (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount NUMERIC(10, 2) DEFAULT 0 CHECK (min_order_amount >= 0),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.banners (
    id BIGSERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title_en TEXT,
    title_so TEXT,
    link_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 5. ORDERS & PAYMENTS
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT CHECK (status IN ('pending', 'paid', 'completed', 'cancelled')) DEFAULT 'pending' NOT NULL,
    shipping_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    payment_method TEXT CHECK (payment_method IN ('evc_plus', 'sahal', 'edahab')) NOT NULL,
    payment_status TEXT CHECK (payment_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending' NOT NULL,
    payment_proof_url TEXT,
    delivery_method TEXT CHECK (delivery_method IN ('home_delivery', 'store_pickup')) NOT NULL,
    delivery_fee NUMERIC(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
    tax NUMERIC(10, 2) DEFAULT 0 CHECK (tax >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    coupon_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    seller_id UUID REFERENCES public.profiles(id) NOT NULL,
    status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method TEXT NOT NULL,
    transaction_reference TEXT,
    status TEXT CHECK (status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending' NOT NULL,
    verified_by UUID REFERENCES public.profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 6. LOGISTICS & DELIVERIES
CREATE TABLE IF NOT EXISTS public.drivers (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    vehicle_type TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    status TEXT CHECK (status IN ('idle', 'delivering', 'offline')) DEFAULT 'offline' NOT NULL
);

CREATE TABLE IF NOT EXISTS public.deliveries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
    driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    delivery_status TEXT CHECK (delivery_status IN ('assigned', 'picked_up', 'out_for_delivery', 'delivered', 'failed')) DEFAULT 'assigned' NOT NULL,
    delivery_notes TEXT,
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- 7. CUSTOMER ENGAGEMENT (REVIEWS, WISHLIST, CART, ADDRESSES)
CREATE TABLE IF NOT EXISTS public.reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(product_id, customer_id)
);

CREATE TABLE IF NOT EXISTS public.wishlist (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.cart (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    quantity INT DEFAULT 1 NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.addresses (
    id BIGSERIAL PRIMARY KEY,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('billing', 'shipping')) DEFAULT 'shipping' NOT NULL,
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Somalia' NOT NULL,
    is_default BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

-- 8. SYSTEM MESSAGES, NOTIFICATIONS & SETTINGS
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title_en TEXT NOT NULL,
    title_so TEXT NOT NULL,
    message_en TEXT NOT NULL,
    message_so TEXT NOT NULL,
    type TEXT DEFAULT 'general' NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;


-- 9. ROW-LEVEL SECURITY POLICIES

-- Profiles: Viewable by everyone; editable only by owner.
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- User Roles: Read-only.
CREATE POLICY "Roles are viewable by everyone" ON public.user_roles 
    FOR SELECT USING (true);
CREATE POLICY "Only admins can modify user roles" ON public.user_roles 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- Categories & Brands: Public select; admin write.
CREATE POLICY "Categories are public readable" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Brands are public readable" ON public.brands FOR SELECT USING (true);
CREATE POLICY "Categories writable by admin" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Brands writable by admin" ON public.brands FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Products: Public view; sellers edit their own; admin manage all.
CREATE POLICY "Products are viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products" ON public.products FOR ALL USING (
    auth.uid() = seller_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Product Images: Public view; seller manage.
CREATE POLICY "Product images are viewable by everyone" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Sellers can manage images for their products" ON public.product_images FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.products 
        WHERE products.id = product_images.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Inventory: Public read; seller manage.
CREATE POLICY "Inventory is readable by everyone" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Sellers can manage inventory for their products" ON public.inventory FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.products 
        WHERE products.id = inventory.product_id AND products.seller_id = auth.uid()
    ) OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Coupons: Public read (if active); admin manage.
CREATE POLICY "Coupons are viewable by everyone" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins/Sellers can view all coupons" ON public.coupons FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'seller'))
);
CREATE POLICY "Coupons manage by admin or seller" ON public.coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'seller'))
);

-- Banners: Public read; admin manage.
CREATE POLICY "Banners are public readable" ON public.banners FOR SELECT USING (true);
CREATE POLICY "Banners manage by admin" ON public.banners FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Orders & Order Items
CREATE POLICY "Customers can manage their own orders" ON public.orders FOR ALL USING (
    auth.uid() = customer_id OR 
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Sellers can view orders containing their products" ON public.orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.order_items 
        WHERE order_items.order_id = orders.id AND order_items.seller_id = auth.uid()
    )
);

CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Sellers can view and update their own order items" ON public.order_items FOR ALL USING (
    seller_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Payments
CREATE POLICY "Customers can view and submit payments for their orders" ON public.payments FOR ALL USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = payments.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Admins and sellers can view payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'seller'))
);
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Drivers & Deliveries
CREATE POLICY "Drivers viewable by everyone" ON public.drivers FOR SELECT USING (true);
CREATE POLICY "Drivers manage their status" ON public.drivers FOR ALL USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Customers can view their own deliveries" ON public.deliveries FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = deliveries.order_id AND orders.customer_id = auth.uid())
);
CREATE POLICY "Drivers can view and update assigned deliveries" ON public.deliveries FOR ALL USING (
    auth.uid() = driver_id OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Reviews
CREATE POLICY "Reviews viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can write reviews for purchased products" ON public.reviews FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.order_items oi ON o.id = oi.order_id
        WHERE o.customer_id = auth.uid() AND oi.product_id = reviews.product_id
    )
);
CREATE POLICY "Customers can update/delete their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Customers can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = customer_id);

-- Wishlist & Cart & Addresses: Owner access only.
CREATE POLICY "Wishlist owner policy" ON public.wishlist FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Cart owner policy" ON public.cart FOR ALL USING (auth.uid() = customer_id);
CREATE POLICY "Addresses owner policy" ON public.addresses FOR ALL USING (auth.uid() = customer_id);

-- Notifications: User specific
CREATE POLICY "Notifications owner policy" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Messages: Sender / Receiver only
CREATE POLICY "Messages access policy" ON public.messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Settings: Read by all, write by admin
CREATE POLICY "Settings read policy" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Settings write policy" ON public.settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);


-- 10. AUTH TRIGGER TO CREATE PROFILE & SET ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT;
BEGIN
    assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
    
    IF assigned_role NOT IN ('customer', 'seller', 'driver', 'admin') THEN
        assigned_role := 'customer';
    END IF;

    INSERT INTO public.profiles (id, full_name, avatar_url, phone)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        new.raw_user_meta_data->>'avatar_url',
        new.raw_user_meta_data->>'phone'
    );

    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, assigned_role);

    IF assigned_role = 'driver' THEN
        INSERT INTO public.drivers (user_id, vehicle_type, license_plate, status)
        VALUES (new.id, 'Bike', 'PENDING', 'offline');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 11. INVENTORY SYNC TRIGGER (ON PRODUCT CREATION)
CREATE OR REPLACE FUNCTION public.handle_new_product()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.inventory (product_id, quantity)
    VALUES (new.id, new.stock)
    ON CONFLICT (product_id) DO UPDATE SET quantity = new.stock;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_product_created
    AFTER INSERT ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_product();


-- 12. STORAGE BUCKET CREATION (Using Supabase Storage API)
-- Note: Buckets can be manually created but running inserts makes it automated.
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banner-images', 'banner-images', true) ON CONFLICT DO NOTHING;


-- 13. SEED DATA
-- Seed Categories
INSERT INTO public.categories (name_en, name_so, slug, icon) VALUES
('Groceries', 'Raashinka', 'groceries', 'shopping_basket'),
('Electronics', 'Elektaroonigga', 'electronics', 'devices'),
('Fashion', 'Moodada', 'fashion', 'checkroom'),
('Home Decor', 'Qurxinta Guriga', 'home-decor', 'home'),
('Personal Care', 'Daryeelka Shakhsiga', 'personal-care', 'local_hospital'),
('Stationery', 'Agabka Qoraalka', 'stationery', 'menu_book')
ON CONFLICT (slug) DO NOTHING;

-- Seed Brands
INSERT INTO public.brands (name, slug) VALUES
('Soniq', 'soniq'),
('Petbound', 'petbound'),
('TechHub', 'techhub'),
('GreenLeaf', 'greenleaf'),
('Organic Harvest', 'organic-harvest'),
('UrbanStyle', 'urbanstyle')
ON CONFLICT (slug) DO NOTHING;

-- Seed Banners
INSERT INTO public.banners (image_url, title_en, title_so, link_url) VALUES
('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000', 'Everything You Need From Local Businesses', 'Wax Kasta oo Aad U Baahan Tahay oo Laga Helo Ganacsiyada Maxaliga ah', '/#categories')
ON CONFLICT DO NOTHING;

-- Seed Settings
INSERT INTO public.settings (key, value) VALUES
('site_name', 'SuuqLink'),
('delivery_fee_rate', '5.00'),
('tax_rate', '0.05')
ON CONFLICT (key) DO NOTHING;
