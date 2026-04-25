/**
 * 通用工具函数
 * 雪板租赁平台
 */

/**
 * 日期格式化
 * @param {Date|string} date 日期
 * @param {string} format 格式 'YYYY-MM-DD' | 'YYYY-MM-DD HH:mm' | 'MM-DD' 等
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 计算日期差（天数）
 * @param {Date|string} startDate 开始日期
 * @param {Date|string} endDate 结束日期
 * @returns {number} 天数差
 */
function daysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // 包含当天
}

/**
 * 验证手机号
 * @param {string} phone 手机号
 * @returns {boolean} 是否有效
 */
function validatePhone(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证密码（6位数字）
 * @param {string} password 密码
 * @returns {boolean} 是否有效
 */
function validatePassword(password) {
    return /^\d{6}$/.test(password);
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱
 * @returns {boolean} 是否有效
 */
function validateEmail(email) {
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return reg.test(email);
}

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的金额
 */
function formatMoney(amount, decimals = 2) {
    return Number(amount).toFixed(decimals);
}

/**
 * 生成唯一订单号
 * @returns {string} 订单号
 */
function generateOrderNo() {
    const now = new Date();
    const dateStr = formatDate(now, 'YYYYMMDD');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SN${dateStr}${random}`;
}

/**
 * 显示提示信息
 * @param {string} message 消息内容
 * @param {string} type 类型 'success' | 'error' | 'info'
 */
function showToast(message, type = 'info') {
    // 移除已存在的toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // 添加样式
    Object.assign(toast.style, {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        padding: '16px 24px',
        borderRadius: '8px',
        backgroundColor: type === 'success' ? '#52c41a' : type === 'error' ? '#f5222d' : '#1890ff',
        color: '#fff',
        fontSize: '14px',
        zIndex: 9999,
        opacity: 0,
        transition: 'opacity 0.3s'
    });
    
    document.body.appendChild(toast);
    
    // 淡入
    requestAnimationFrame(() => {
        toast.style.opacity = 1;
    });
    
    // 3秒后淡出
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * 显示加载状态
 * @param {boolean} show 是否显示
 * @param {string} message 加载文案
 */
function showLoading(show, message = '加载中...') {
    if (show) {
        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border: 3px solid #fff;
                    border-top-color: transparent;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div style="color: #fff; margin-top: 16px; font-size: 14px;">${message}</div>
            </div>
        `;
        loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;';
        
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        
        document.body.appendChild(loader);
    } else {
        const loader = document.getElementById('global-loader');
        if (loader) loader.remove();
    }
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * 设置本地存储
 * @param {string} key 键
 * @param {any} value 值
 */
function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

/**
 * 获取本地存储
 * @param {string} key 键
 * @returns {any} 值
 */
function getStorage(key) {
    const value = localStorage.getItem(key);
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

/**
 * 清除本地存储
 * @param {string} key 键
 */
function removeStorage(key) {
    localStorage.removeItem(key);
}

/**
 * 获取相对时间描述
 * @param {Date|string} date 日期
 * @returns {string} 相对时间
 */
function getRelativeTime(date) {
    const now = new Date();
    const d = new Date(date);
    const diff = now - d;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return formatDate(date, 'MM-DD HH:mm');
}

/**
 * 设备类型文本映射
 */
const EQUIPMENT_TYPES = {
    'snowboard': '单板',
    'ski': '双板',
    'accessory': '配件'
};

/**
 * 订单状态文本和颜色映射
 */
const ORDER_STATUS = {
    'pending': { text: '待支付', color: '#faad14', bgColor: '#fffbe6' },
    'confirmed': { text: '已确认', color: '#1890ff', bgColor: '#e6f7ff' },
    'rented': { text: '已出租', color: '#722ed1', bgColor: '#f9f0ff' },
    'completed': { text: '已完成', color: '#52c41a', bgColor: '#f6ffed' },
    'cancelled': { text: '已取消', color: '#8c8c8c', bgColor: '#f5f5f5' }
};

/**
 * 获取设备类型文本
 * @param {string} type 类型
 * @returns {string} 文本
 */
function getEquipmentTypeText(type) {
    return EQUIPMENT_TYPES[type] || type;
}

/**
 * 获取订单状态信息
 * @param {string} status 状态
 * @returns {Object} 状态信息
 */
function getOrderStatusInfo(status) {
    return ORDER_STATUS[status] || { text: status, color: '#333', bgColor: '#fff' };
}

// 导出到全局
window.formatDate = formatDate;
window.daysBetween = daysBetween;
window.validatePhone = validatePhone;
window.validatePassword = validatePassword;
window.validateEmail = validateEmail;
window.formatMoney = formatMoney;
window.generateOrderNo = generateOrderNo;
window.showToast = showToast;
window.showLoading = showLoading;
window.getUrlParam = getUrlParam;
window.setStorage = setStorage;
window.getStorage = getStorage;
window.removeStorage = removeStorage;
window.getRelativeTime = getRelativeTime;
window.getEquipmentTypeText = getEquipmentTypeText;
window.getOrderStatusInfo = getOrderStatusInfo;
