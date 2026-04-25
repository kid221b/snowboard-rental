/**
 * 用户端认证逻辑
 * 雪板租赁平台
 * 邮箱+密码注册登录
 */

// 当前用户信息
let currentUser = null;

/**
 * 初始化认证状态
 */
async function initAuth() {
    const session = await checkAuth();
    if (session?.user) {
        currentUser = session.user;
        // 获取用户详细信息
        await loadUserProfile();
        updateAuthUI();
    }
}

/**
 * 加载用户详细信息
 */
async function loadUserProfile() {
    if (!currentUser) return;
    
    // 优先通过 email 查找用户
    let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', currentUser.email)
        .single();
    
    // 如果没找到，尝试通过 id 查找
    if (error || !data) {
        const { data: dataById, error: errorById } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (!errorById && dataById) {
            data = dataById;
            error = null;
        }
    }
    
    if (!error && data) {
        currentUser.profile = data;
        // 更新 currentUser 的 phone（如果有的话）
        if (data.phone) {
            currentUser.phone = data.phone;
        }
        setStorage('user_profile', data);
    }
}

/**
 * 更新认证相关UI
 */
function updateAuthUI() {
    const authButtons = document.querySelectorAll('.auth-btn');
    const userInfo = document.querySelectorAll('.user-info');
    
    authButtons.forEach(btn => {
        btn.style.display = currentUser ? 'none' : 'block';
    });
    
    userInfo.forEach(el => {
        el.style.display = currentUser ? 'block' : 'none';
        if (currentUser?.profile) {
            const nicknameEl = el.querySelector('.nickname');
            if (nicknameEl) {
                nicknameEl.textContent = currentUser.profile.nickname || currentUser.email;
            }
        }
    });
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
 * 邮箱注册
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @returns {Promise<boolean>} 是否成功
 */
async function doEmailRegister(email, password) {
    if (!validateEmail(email)) {
        showToast('请输入正确的邮箱', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showToast('密码长度至少6位', 'error');
        return false;
    }
    
    try {
        showLoading(true, '注册中...');
        
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password
        });
        
        showLoading(false);
        
        if (error) {
            showToast(error.message || '注册失败', 'error');
            return false;
        }
        
        if (data.user) {
            // 注册成功，在 users 表中创建用户记录
            await createUserProfile(data.user);
            
            // 显示确认邮件提示
            showEmailConfirmTip(email);
            return true;
        }
        
        return false;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
    }
}

/**
 * 创建用户档案
 * @param {Object} user Supabase用户对象
 */
async function createUserProfile(user) {
    try {
        const { error } = await supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                phone: user.phone || '',
                nickname: '',
                avatar_url: ''
            });
        
        if (error) {
            console.error('创建用户档案失败:', error);
        }
    } catch (e) {
        console.error('创建用户档案异常:', e);
    }
}

/**
 * 显示邮箱确认提示
 * @param {string} email 邮箱地址
 */
function showEmailConfirmTip(email) {
    const loginForm = document.querySelector('.login-form');
    const emailConfirmTip = document.getElementById('emailConfirmTip');
    const sentEmail = document.getElementById('sentEmail');
    
    if (loginForm && emailConfirmTip) {
        loginForm.style.display = 'none';
        emailConfirmTip.style.display = 'block';
        if (sentEmail) {
            sentEmail.textContent = email;
        }
    }
}

/**
 * 邮箱登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @returns {Promise<boolean>} 是否成功
 */
async function doEmailLogin(email, password) {
    if (!validateEmail(email)) {
        showToast('请输入正确的邮箱', 'error');
        return false;
    }
    
    if (!password) {
        showToast('请输入密码', 'error');
        return false;
    }
    
    try {
        showLoading(true, '登录中...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        showLoading(false);
        
        if (error) {
            // 根据错误类型给出友好提示
            if (error.message.includes('Invalid login credentials')) {
                showToast('邮箱或密码错误', 'error');
            } else if (error.message.includes('Email not confirmed')) {
                showToast('请先确认邮箱', 'error');
            } else {
                showToast(error.message || '登录失败', 'error');
            }
            return false;
        }
        
        if (data.user) {
            currentUser = data.user;
            await loadUserProfile();
            updateAuthUI();
            showToast('登录成功', 'success');
            
            // 跳转到之前页面或首页
            const redirectUrl = getUrlParam('redirect') || 'index.html';
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1000);
            
            return true;
        }
        
        return false;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
    }
}

/**
 * 发送密码重置邮件
 * @param {string} email 邮箱
 * @returns {Promise<boolean>} 是否成功
 */
async function sendPasswordResetEmail(email) {
    if (!validateEmail(email)) {
        showToast('请输入正确的邮箱', 'error');
        return false;
    }
    
    try {
        showLoading(true, '发送中...');
        
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        
        showLoading(false);
        
        if (error) {
            showToast(error.message || '发送失败', 'error');
            return false;
        }
        
        showToast('密码重置邮件已发送', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
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
        
        const { data, error } = await supabase.auth.signInWithPassword({
            phone: phone,
            password: password
        });
        
        showLoading(false);
        
        if (error) {
            showToast(error.message || '登录失败', 'error');
            return false;
        }
        
        if (data.user) {
            currentUser = data.user;
            await loadUserProfile();
            updateAuthUI();
            showToast('登录成功', 'success');
            
            // 跳转到管理首页
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            
            return true;
        }
        
        return false;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
    }
}

/**
 * 登出
 * @returns {Promise<boolean>} 是否成功
 */
async function doLogout() {
    try {
        showLoading(true, '退出中...');
        
        const { error } = await supabase.auth.signOut();
        
        showLoading(false);
        
        if (error) {
            showToast(error.message || '退出失败', 'error');
            return false;
        }
        
        currentUser = null;
        removeStorage('user_profile');
        updateAuthUI();
        showToast('已退出', 'success');
        
        // 跳转到首页
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
 * 获取当前用户信息
 * @returns {Object|null} 用户信息
 */
function getCurrentUserInfo() {
    return currentUser;
}

/**
 * 检查认证状态
 * @returns {Promise<Object|null>} session信息
 */
async function checkAuth() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('获取认证状态失败:', error);
            return null;
        }
        
        return session;
    } catch (e) {
        console.error('网络错误:', e);
        return null;
    }
}

/**
 * 更新用户资料
 * @param {Object} profileData 要更新的资料
 * @returns {Promise<boolean>} 是否成功
 */
async function updateUserProfile(profileData) {
    if (!currentUser) {
        showToast('请先登录', 'error');
        return false;
    }
    
    try {
        showLoading(true, '更新中...');
        
        const { error } = await supabase
            .from('users')
            .update({
                ...profileData,
                updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.id);
        
        showLoading(false);
        
        if (error) {
            showToast(error.message || '更新失败', 'error');
            return false;
        }
        
        // 更新本地缓存
        if (currentUser.profile) {
            currentUser.profile = { ...currentUser.profile, ...profileData };
            setStorage('user_profile', currentUser.profile);
        }
        
        updateAuthUI();
        showToast('更新成功', 'success');
        return true;
    } catch (e) {
        showLoading(false);
        showToast('网络错误，请重试', 'error');
        return false;
    }
}
