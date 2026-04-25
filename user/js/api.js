/**
 * 用户端API调用
 * 雪板租赁平台
 */

/**
 * 获取商家列表
 * @param {Object} params 查询参数
 * @returns {Promise<Array>} 商家列表
 */
async function getShops(params = {}) {
    try {
        let query = supabase
            .from('shops')
            .select('*')
            .eq('status', 'active')
            .order('rating', { ascending: false });
        
        if (params.location) {
            query = query.ilike('location', `%${params.location}%`);
        }
        
        if (params.keyword) {
            query = query.or(`name.ilike.%${params.keyword}%,description.ilike.%${params.keyword}%`);
        }
        
        const { data, error } = await query;
        
        if (error) {
            console.error('获取商家列表失败:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('网络错误:', e);
        return [];
    }
}

/**
 * 获取商家详情
 * @param {string} shopId 商家ID
 * @returns {Promise<Object|null>} 商家信息
 */
async function getShopDetail(shopId) {
    try {
        const { data, error } = await supabase
            .from('shops')
            .select('*')
            .eq('id', shopId)
            .single();
        
        if (error) {
            console.error('获取商家详情失败:', error);
            return null;
        }
        
        return data;
    } catch (e) {
        console.error('网络错误:', e);
        return null;
    }
}

/**
 * 获取装备列表
 * @param {Object} params 查询参数
 * @returns {Promise<Array>} 装备列表
 */
async function getEquipmentList(params = {}) {
    try {
        let query = supabase
            .from('equipment')
            .select('*')
            .eq('status', 'active');
        
        if (params.shop_id) {
            query = query.eq('shop_id', params.shop_id);
        }
        
        if (params.type) {
            query = query.eq('type', params.type);
        }
        
        if (params.keyword) {
            query = query.or(`name.ilike.%${params.keyword}%,brand.ilike.%${params.keyword}%`);
        }
        
        if (params.min_price) {
            query = query.gte('price_day', params.min_price);
        }
        
        if (params.max_price) {
            query = query.lte('price_day', params.max_price);
        }
        
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) {
            console.error('获取装备列表失败:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('网络错误:', e);
        return [];
    }
}

/**
 * 获取装备详情
 * @param {string} equipmentId 装备ID
 * @returns {Promise<Object|null>} 装备信息
 */
async function getEquipmentDetail(equipmentId) {
    try {
        const { data, error } = await supabase
            .from('equipment')
            .select('*, shops:name, shops:location, shops:phone')
            .eq('id', equipmentId)
            .single();
        
        if (error) {
            console.error('获取装备详情失败:', error);
            return null;
        }
        
        return data;
    } catch (e) {
        console.error('网络错误:', e);
        return null;
    }
}

/**
 * 获取订单列表
 * @param {string} userId 用户ID
 * @returns {Promise<Array>} 订单列表
 */
async function getOrderList(userId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                shops:shop_id(name, location, phone),
                equipment:equipment_id(name, type, brand, images)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取订单列表失败:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('网络错误:', e);
        return [];
    }
}

/**
 * 获取订单详情
 * @param {string} orderId 订单ID
 * @returns {Promise<Object|null>} 订单信息
 */
async function getOrderDetail(orderId) {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                shops:shop_id(name, location, phone),
                equipment:equipment_id(name, type, brand, images, price_day)
            `)
            .eq('id', orderId)
            .single();
        
        if (error) {
            console.error('获取订单详情失败:', error);
            return null;
        }
        
        return data;
    } catch (e) {
        console.error('网络错误:', e);
        return null;
    }
}

/**
 * 创建订单
 * @param {Object} orderData 订单数据
 * @returns {Promise<Object|null>} 创建的订单
 */
async function createOrder(orderData) {
    try {
        const user = getCurrentUserInfo();
        if (!user) {
            showToast('请先登录', 'error');
            return null;
        }
        
        showLoading(true, '创建订单...');
        
        const orderNo = generateOrderNo();
        
        const { data, error } = await supabase
            .from('orders')
            .insert({
                order_no: orderNo,
                user_id: user.id,
                shop_id: orderData.shop_id,
                equipment_id: orderData.equipment_id,
                start_date: orderData.start_date,
                end_date: orderData.end_date,
                days: orderData.days,
                unit_price: orderData.unit_price,
                total_price: orderData.total_price,
                phone: orderData.phone,
                user_name: orderData.user_name || '',
                notes: orderData.notes || '',
                status: 'pending'
            })
            .select()
            .single();
        
        showLoading(false);
        
        if (error) {
            console.error('创建订单失败:', error);
            showToast('创建订单失败', 'error');
            return null;
        }
        
        return data;
    } catch (e) {
        showLoading(false);
        console.error('网络错误:', e);
        showToast('网络错误', 'error');
        return null;
    }
}

/**
 * 取消订单
 * @param {string} orderId 订单ID
 * @returns {Promise<boolean>} 是否成功
 */
async function cancelOrder(orderId) {
    try {
        showLoading(true, '取消订单...');
        
        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId)
            .eq('status', 'pending');
        
        showLoading(false);
        
        if (error) {
            console.error('取消订单失败:', error);
            showToast('取消失败', 'error');
            return false;
        }
        
        showToast('订单已取消', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        console.error('网络错误:', e);
        showToast('网络错误', 'error');
        return false;
    }
}

/**
 * 支付订单（预留接口）
 * @param {string} orderId 订单ID
 * @returns {Promise<boolean>} 是否成功
 */
async function payOrder(orderId) {
    // 预留支付接口，暂不实现具体逻辑
    showToast('支付功能配置中', 'info');
    return false;
}

// 导出到全局
window.getShops = getShops;
window.getShopDetail = getShopDetail;
window.getEquipmentList = getEquipmentList;
window.getEquipmentDetail = getEquipmentDetail;
window.getOrderList = getOrderList;
window.getOrderDetail = getOrderDetail;
window.createOrder = createOrder;
window.cancelOrder = cancelOrder;
window.payOrder = payOrder;
