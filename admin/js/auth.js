/**
 * 商家端认证逻辑
 * 雪板租赁平台
 */

/**
 * 初始化商家认证
 */
function initAdminAuth() {
    const session = getAdminSession();
    if (!session) {
        return null;
    }
    updateAdminUI(session);
    return session;
}

/**
 * 更新商家端UI
 * @param {Object} session 商家会话
 */
function updateAdminUI(session) {
    // 更新商家名称
    const shopNameElements = document.querySelectorAll('.shop-name-display');
    shopNameElements.forEach(el => {
        el.textContent = session.shop?.name || '商家';
    });
    
    // 更新手机号
    const phoneElements = document.querySelectorAll('.admin-phone');
    phoneElements.forEach(el => {
        el.textContent = session.phone || '';
    });
}

/**
 * 更新认证相关UI
 */
function updateAdminAuthUI(session) {
    const authElements = document.querySelectorAll('.admin-auth');
    const userElements = document.querySelectorAll('.admin-user');
    
    authElements.forEach(el => {
        el.style.display = session ? 'none' : 'block';
    });
    
    userElements.forEach(el => {
        el.style.display = session ? 'block' : 'none';
    });
    
    if (session) {
        updateAdminUI(session);
    }
}

/**
 * 商家登录
 * @param {string} phone 手机号
 * @param {string} password 密码
 * @returns {Promise<boolean>} 是否成功
 */
async function adminLogin(phone, password) {
    if (!validatePhone(phone)) {
        showToast('请输入正确的手机号', 'error');
        return false;
    }
    
    if (!password) {
        showToast('请输入密码', 'error');
        return false;
    }
    
    try {
        showLoading(true, '登录中...');
        
        // 查询商家管理员
        const { data: admin, error: adminError } = await supabaseClient
            .from('shop_admins')
            .select('*')
            .eq('phone', phone)
            .single();
        
        if (adminError || !admin) {
            showLoading(false);
            showToast('账号或密码错误', 'error');
            return false;
        }
        
        // 验证密码
        if (admin.password_hash !== btoa(password)) {
            showLoading(false);
            showToast('账号或密码错误', 'error');
            return false;
        }
        
        // 更新最后登录时间
        await supabaseClient
            .from('shop_admins')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', admin.id);
        
        // 获取商家信息
        const { data: shop, error: shopError } = await supabaseClient
            .from('shops')
            .select('*')
            .eq('id', admin.shop_id)
            .single();
        
        showLoading(false);
        
        if (shopError || !shop) {
            showToast('商家信息不存在', 'error');
            return false;
        }
        
        // 保存登录状态
        const adminSession = {
            admin: admin,
            shop: shop,
            phone: phone,
            shop_id: admin.shop_id
        };
        setStorage('admin_session', adminSession);
        
        updateAdminAuthUI(adminSession);
        showToast('登录成功', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
    }
}

/**
 * 商家退出登录
 */
function adminLogout() {
    removeStorage('admin_session');
    window.location.href = 'login.html';
}

/**
 * 获取当前商家会话
 * @returns {Object|null} 商家会话
 */
function getAdminSession() {
    return getStorage('admin_session');
}

/**
 * 检查商家登录状态
 */
function checkAdminAuth() {
    const session = getAdminSession();
    if (!session) {
        window.location.href = 'login.html';
        return null;
    }
    return session;
}

/**
 * 获取当前商家ID
 * @returns {string|null} 商家ID
 */
function getCurrentShopId() {
    const session = getAdminSession();
    return session?.shop_id || null;
}

// 导出到全局
window.initAdminAuth = initAdminAuth;
window.updateAdminAuthUI = updateAdminAuthUI;
window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.getAdminSession = getAdminSession;
window.checkAdminAuth = checkAdminAuth;
window.getCurrentShopId = getCurrentShopId;
