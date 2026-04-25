-- =====================================================
-- 雪板租赁平台数据库设计 (PostgreSQL/Supabase)
-- 创建日期: 2025-01-01
-- =====================================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 用户表 (users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    nickname VARCHAR(50) DEFAULT '',
    avatar_url VARCHAR(500) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- =====================================================
-- 2. 商家表 (shops)
-- =====================================================
CREATE TABLE IF NOT EXISTS shops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT '',
    location VARCHAR(200) DEFAULT '',
    phone VARCHAR(20) DEFAULT '',
    images JSONB DEFAULT '[]'::jsonb,
    rating DECIMAL(2,1) DEFAULT 5.0,
    review_count INT DEFAULT 0,
    business_hours VARCHAR(100) DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shops_status ON shops(status);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(location);

-- =====================================================
-- 3. 装备表 (equipment)
-- =====================================================
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'snowboard',
    brand VARCHAR(50) DEFAULT '',
    length INT DEFAULT 0,
    flex INT DEFAULT 0,
    din_range VARCHAR(20) DEFAULT '',
    price_day DECIMAL(10,2) NOT NULL DEFAULT 0,
    price_week DECIMAL(10,2) DEFAULT 0,
    stock INT DEFAULT 0,
    images JSONB DEFAULT '[]'::jsonb,
    description TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_equipment_shop_id ON equipment(shop_id);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);

-- =====================================================
-- 4. 订单表 (orders)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    phone VARCHAR(20) NOT NULL,
    user_name VARCHAR(50) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_start_date ON orders(start_date);
CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);

-- =====================================================
-- 5. 商家管理员表 (shop_admins)
-- =====================================================
CREATE TABLE IF NOT EXISTS shop_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) DEFAULT '',
    role VARCHAR(20) DEFAULT 'admin',
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_shop_admins_phone ON shop_admins(phone);
CREATE INDEX IF NOT EXISTS idx_shop_admins_shop_id ON shop_admins(shop_id);

-- =====================================================
-- 6. 添加列注释 (PostgreSQL风格)
-- =====================================================

-- users表注释
COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.email IS '邮箱（登录账号）';
COMMENT ON COLUMN users.phone IS '手机号（用于联系）';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.avatar_url IS '头像URL';

-- shops表注释
COMMENT ON TABLE shops IS '商家表';
COMMENT ON COLUMN shops.name IS '商家名称';
COMMENT ON COLUMN shops.description IS '商家描述';
COMMENT ON COLUMN shops.location IS '地址';
COMMENT ON COLUMN shops.phone IS '联系电话';
COMMENT ON COLUMN shops.images IS '店铺图片JSON数组';
COMMENT ON COLUMN shops.rating IS '评分';
COMMENT ON COLUMN shops.review_count IS '评价数量';
COMMENT ON COLUMN shops.business_hours IS '营业时间';
COMMENT ON COLUMN shops.status IS '状态: active/inactive';

-- equipment表注释
COMMENT ON TABLE equipment IS '装备表';
COMMENT ON COLUMN equipment.name IS '装备名称';
COMMENT ON COLUMN equipment.type IS '类型: snowboard单板/ski双板/accessory配件';
COMMENT ON COLUMN equipment.brand IS '品牌';
COMMENT ON COLUMN equipment.length IS '长度(cm)';
COMMENT ON COLUMN equipment.flex IS '软硬度(1-10)';
COMMENT ON COLUMN equipment.din_range IS 'DIN值范围';
COMMENT ON COLUMN equipment.price_day IS '日租价格';
COMMENT ON COLUMN equipment.price_week IS '周租价格';
COMMENT ON COLUMN equipment.stock IS '库存数量';
COMMENT ON COLUMN equipment.images IS '装备图片JSON数组';
COMMENT ON COLUMN equipment.description IS '详细描述';
COMMENT ON COLUMN equipment.status IS '状态: active/inactive/sold_out';

-- orders表注释
COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.order_no IS '订单号';
COMMENT ON COLUMN orders.start_date IS '开始日期';
COMMENT ON COLUMN orders.end_date IS '结束日期';
COMMENT ON COLUMN orders.days IS '租赁天数';
COMMENT ON COLUMN orders.unit_price IS '单价';
COMMENT ON COLUMN orders.total_price IS '总价';
COMMENT ON COLUMN orders.status IS '状态: pending待支付/confirmed已确认/rented已出租/completed已完成/cancelled已取消';
COMMENT ON COLUMN orders.phone IS '联系电话';
COMMENT ON COLUMN orders.user_name IS '用户姓名';
COMMENT ON COLUMN orders.notes IS '备注';

-- shop_admins表注释
COMMENT ON TABLE shop_admins IS '商家管理员表';
COMMENT ON COLUMN shop_admins.phone IS '登录手机号';
COMMENT ON COLUMN shop_admins.password_hash IS '密码哈希';
COMMENT ON COLUMN shop_admins.name IS '管理员姓名';
COMMENT ON COLUMN shop_admins.role IS '角色: admin/super_admin';

-- =====================================================
-- 7. RLS (Row Level Security) 策略
-- =====================================================

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_admins ENABLE ROW LEVEL SECURITY;

-- users表策略
CREATE POLICY "允许公开查看用户基本信息" ON users
    FOR SELECT USING (true);

CREATE POLICY "用户只能查看自己的信息" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "用户可以更新自己的信息" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的信息" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- shops表策略（商家信息公开可见）
CREATE POLICY "允许公开查看商家" ON shops
    FOR SELECT USING (status = 'active');

CREATE POLICY "允许插入商家" ON shops
    FOR INSERT WITH CHECK (true);

-- equipment表策略
CREATE POLICY "允许公开查看装备" ON equipment
    FOR SELECT USING (status = 'active');

CREATE POLICY "允许插入装备" ON equipment
    FOR INSERT WITH CHECK (true);

CREATE POLICY "允许更新装备" ON equipment
    FOR UPDATE USING (true);

-- orders表策略
CREATE POLICY "用户可以查看自己的订单" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建订单" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "用户可以更新自己的订单" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "允许公开查看订单" ON orders
    FOR SELECT USING (true);

-- shop_admins表策略
CREATE POLICY "管理员可以查看自己的信息" ON shop_admins
    FOR SELECT USING (true);

CREATE POLICY "允许插入管理员" ON shop_admins
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 8. 创建更新时间触发器函数
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为每个表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 完成！
-- =====================================================
