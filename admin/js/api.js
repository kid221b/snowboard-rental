/**
 * 商家端API调用
 * 雪板租赁平台
 */

/**
 * 获取装备列表（商家自己的）
 * @param {string} shopId 商家ID
 * @returns {Promise<Array>} 装备列表
 */
async function getAdminEquipmentList(shopId) {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .select('*')
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });
        
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
async function getAdminEquipmentDetail(equipmentId) {
    try {
        const { data, error } = await supabaseClient
            .from('equipment')
            .select('*')
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
 * 创建装备
 * @param {Object} equipmentData 装备数据
 * @returns {Promise<Object|null>} 创建的装备
 */
async function createEquipment(equipmentData) {
    try {
        showLoading(true, '保存中...');
        
        const { data, error } = await supabaseClient
            .from('equipment')
            .insert({
                shop_id: equipmentData.shop_id,
                name: equipmentData.name,
                type: equipmentData.type || 'snowboard',
                brand: equipmentData.brand || '',
                length: equipmentData.length || 0,
                flex: equipmentData.flex || 0,
                din_range: equipmentData.din_range || '',
                price_day: equipmentData.price_day,
                price_week: equipmentData.price_week || 0,
                stock: equipmentData.stock || 1,
                images: equipmentData.images || [],
                description: equipmentData.description || '',
                status: 'active'
            })
            .select()
            .single();
        
        showLoading(false);
        
        if (error) {
            showToast('保存失败', 'error');
            console.error('创建装备失败:', error);
            return null;
        }
        
        showToast('保存成功', 'success');
        return data;
    } catch (e) {
        showLoading(false);
        showToast('网络错误', 'error');
        return null;
    }
}

/**
 * 更新装备
 * @param {string} equipmentId 装备ID
 * @param {Object} equipmentData 装备数据
 * @returns {Promise<boolean>} 是否成功
 */
async function updateEquipment(equipmentId, equipmentData) {
    try {
        showLoading(true, '保存中...');
        
        const { error } = await supabaseClient
            .from('equipment')
            .update({
                name: equipmentData.name,
                type: equipmentData.type,
                brand: equipmentData.brand,
                length: equipmentData.length,
                flex: equipmentData.flex,
                din_range: equipmentData.din_range,
                price_day: equipmentData.price_day,
                price_week: equipmentData.price_week,
                stock: equipmentData.stock,
                images: equipmentData.images,
                description: equipmentData.description,
                status: equipmentData.status
            })
            .eq('id', equipmentId);
        
        showLoading(false);
        
        if (error) {
            showToast('保存失败', 'error');
            console.error('更新装备失败:', error);
            return false;
        }
        
        showToast('保存成功', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误', 'error');
        return false;
    }
}

/**
 * 删除装备
 * @param {string} equipmentId 装备ID
 * @returns {Promise<boolean>} 是否成功
 */
async function deleteEquipment(equipmentId) {
    try {
        showLoading(true, '删除中...');
        
        const { error } = await supabaseClient
            .from('equipment')
            .delete()
            .eq('id', equipmentId);
        
        showLoading(false);
        
        if (error) {
            showToast('删除失败', 'error');
            return false;
        }
        
        showToast('删除成功', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误', 'error');
        return false;
    }
}

/**
 * 获取订单列表（商家自己的）
 * @param {string} shopId 商家ID
 * @param {string} status 订单状态（可选）
 * @returns {Promise<Array>} 订单列表
 */
async function getAdminOrderList(shopId, status = '') {
    try {
        let query = supabaseClient
            .from('orders')
            .select(`
                *,
                users:user_id(nickname, phone),
                equipment:equipment_id(name, type, brand)
            `)
            .eq('shop_id', shopId)
            .order('created_at', { ascending: false });
        
        if (status) {
            query = query.eq('status', status);
        }
        
        const { data, error } = await query;
        
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
 * 获取今日订单
 * @param {string} shopId 商家ID
 * @returns {Promise<Array>} 今日订单
 */
async function getTodayOrders(shopId) {
    try {
        const today = formatDate(new Date(), 'YYYY-MM-DD');
        
        const { data, error } = await supabaseClient
            .from('orders')
            .select(`
                *,
                users:user_id(nickname, phone),
                equipment:equipment_id(name, type)
            `)
            .eq('shop_id', shopId)
            .gte('created_at', today + 'T00:00:00')
            .lte('created_at', today + 'T23:59:59')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('获取今日订单失败:', error);
            return [];
        }
        
        return data || [];
    } catch (e) {
        console.error('网络错误:', e);
        return [];
    }
}

/**
 * 更新订单状态
 * @param {string} orderId 订单ID
 * @param {string} status 新状态
 * @returns {Promise<boolean>} 是否成功
 */
async function updateOrderStatus(orderId, status) {
    try {
        showLoading(true, '更新中...');
        
        const { error } = await supabaseClient
            .from('orders')
            .update({ status: status })
            .eq('id', orderId);
        
        showLoading(false);
        
        if (error) {
            showToast('更新失败', 'error');
            return false;
        }
        
        showToast('更新成功', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误', 'error');
        return false;
    }
}

/**
 * 获取统计数据
 * @param {string} shopId 商家ID
 * @returns {Promise<Object>} 统计数据
 */
async function getStatistics(shopId) {
    try {
        const today = formatDate(new Date(), 'YYYY-MM-DD');
        
        // 获取今日订单数
        const { count: todayOrders } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopId)
            .gte('created_at', today + 'T00:00:00');
        
        // 获取待处理订单数
        const { count: pendingOrders } = await supabaseClient
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopId)
            .in('status', ['pending', 'confirmed']);
        
        // 获取装备总数
        const { count: totalEquipment } = await supabaseClient
            .from('equipment')
            .select('*', { count: 'exact', head: true })
            .eq('shop_id', shopId);
        
        // 获取本月收入
        const monthStart = formatDate(new Date(), 'YYYY-MM') + '-01';
        const { data: monthOrders } = await supabaseClient
            .from('orders')
            .select('total_price')
            .eq('shop_id', shopId)
            .eq('status', 'completed')
            .gte('created_at', monthStart);
        
        const monthIncome = monthOrders?.reduce((sum, o) => sum + parseFloat(o.total_price || 0), 0) || 0;
        
        return {
            todayOrders: todayOrders || 0,
            pendingOrders: pendingOrders || 0,
            totalEquipment: totalEquipment || 0,
            monthIncome: monthIncome
        };
    } catch (e) {
        console.error('获取统计数据失败:', e);
        return {
            todayOrders: 0,
            pendingOrders: 0,
            totalEquipment: 0,
            monthIncome: 0
        };
    }
}

/**
 * 更新商家信息
 * @param {string} shopId 商家ID
 * @param {Object} shopData 商家数据
 * @returns {Promise<boolean>} 是否成功
 */
async function updateShopInfo(shopId, shopData) {
    try {
        showLoading(true, '保存中...');
        
        const { error } = await supabaseClient
            .from('shops')
            .update({
                name: shopData.name,
                description: shopData.description,
                location: shopData.location,
                phone: shopData.phone,
                business_hours: shopData.business_hours,
                images: shopData.images
            })
            .eq('id', shopId);
        
        showLoading(false);
        
        if (error) {
            showToast('保存失败', 'error');
            return false;
        }
        
        // 更新本地会话
        const session = getAdminSession();
        if (session) {
            session.shop = { ...session.shop, ...shopData };
            setStorage('admin_session', session);
        }
        
        showToast('保存成功', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误', 'error');
        return false;
    }
}

// 导出到全局
window.getAdminEquipmentList = getAdminEquipmentList;
window.getAdminEquipmentDetail = getAdminEquipmentDetail;
window.createEquipment = createEquipment;
window.updateEquipment = updateEquipment;
window.deleteEquipment = deleteEquipment;
window.getAdminOrderList = getAdminOrderList;
window.getTodayOrders = getTodayOrders;
window.updateOrderStatus = updateOrderStatus;
window.getStatistics = getStatistics;
window.updateShopInfo = updateShopInfo;
