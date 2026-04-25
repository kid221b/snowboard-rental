/**
 * Supabase客户端初始化
 * 雪板租赁平台
 */

// Supabase配置
const SUPABASE_URL = 'https://isfsbkhhzfzrefnktbns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZnNia2hoemZ6cmVmbmt0Ym5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNjEyODYsImV4cCI6MjA5MjYzNzI4Nn0.RogfdJf-8gXdDukqWrujFuqy1zlQbO2JVeQ8ksXBTY0';

// 创建Supabase客户端
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * 检查用户认证状态
 * @returns {Promise<Object>} 用户会话信息
 */
async function checkAuth() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) {
        console.error('获取会话失败:', error);
        return null;
    }
    return session;
}

/**
 * 获取当前用户
 * @returns {Promise<Object>} 当前用户信息
 */
async function getCurrentUser() {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error) {
        console.error('获取用户失败:', error);
        return null;
    }
    return user;
}

/**
 * 监听认证状态变化
 * @param {Function} callback 状态变化回调函数
 * @returns {Object} 订阅对象
 */
function onAuthStateChange(callback) {
    return supabaseClient.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}

// 导出到全局
window.supabaseClient = supabaseClient;
window.checkAuth = checkAuth;
window.getCurrentUser = getCurrentUser;
window.onAuthStateChange = onAuthStateChange;
