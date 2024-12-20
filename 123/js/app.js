// 页面导航
const navLinks = {
    'homeLink': 'taskList',
    'publishLink': 'publishTask',
    'personalCenterLink': 'personalCenter',
    'loginLink': 'loginForm',
    'registerLink': 'registerForm'
};

// 初始化Auth实例
const auth = new Auth();

// 导航事件处理
Object.entries(navLinks).forEach(([linkId, sectionId]) => {
    document.getElementById(linkId)?.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 检查登录状态
        const currentUser = auth.getCurrentUser();
        const personalCenterLink = document.getElementById('personalCenterLink');
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');

        if (currentUser) {
            // 已登录状态
            personalCenterLink.classList.remove('hidden');
            loginLink.classList.add('hidden');
            registerLink.classList.add('hidden');
        } else {
            // 未登录状态
            personalCenterLink.classList.add('hidden');
            loginLink.classList.remove('hidden');
            registerLink.classList.remove('hidden');
        }

        // 权限检查
        if ((sectionId === 'personalCenter' || sectionId === 'publishTask') && !currentUser) {
            alert('请先登录');
            showSection('loginForm');
            return;
        }

        showSection(sectionId);
        if (sectionId === 'personalCenter') {
            initializePersonalTasks();
        }
    });
});

// 更新登录后的UI
function updateUIAfterLogin() {
    const authRequired = document.querySelector('.auth-required');
    const authNotRequired = document.querySelector('.auth-not-required');
    
    // 显示需要登录的元素
    authRequired.classList.remove('hidden');
    // 隐藏不需要登录的元素
    authNotRequired.classList.add('hidden');
    // 显示任务列表
    showSection('taskList');
    initializeTasks();
}

// 更新登出后的UI
function updateUIAfterLogout() {
    const authRequired = document.querySelector('.auth-required');
    const authNotRequired = document.querySelector('.auth-not-required');
    
    // 隐藏需要登录的元素
    authRequired.classList.add('hidden');
    // 显示不需要登录的元素
    authNotRequired.classList.remove('hidden');
    // 显示登录页面
    showSection('loginForm');
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = auth.getCurrentUser();
    const authRequired = document.querySelector('.auth-required');
    const authNotRequired = document.querySelector('.auth-not-required');

    if (currentUser) {
        authRequired.classList.remove('hidden');
        authNotRequired.classList.add('hidden');
        showSection('taskList');
        initializeTasks();
    } else {
        authRequired.classList.add('hidden');
        authNotRequired.classList.remove('hidden');
        showSection('loginForm');
    }
});

// 修改注销事件处理
document.getElementById('logoutLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    auth.logout();
    updateUIAfterLogout();
});

// 修改登录表单处理
document.querySelector('#loginForm form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        auth.login(username, password);
        updateUIAfterLogin();
    } catch (error) {
        alert(error.message);
    }
});

// 显示指定页面
function showSection(sectionId) {
    // 先将所有section淡出
    document.querySelectorAll('.section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        setTimeout(() => {
            section.classList.add('hidden');
        }, 300);
    });

    // 显示目标section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        setTimeout(() => {
            targetSection.classList.remove('hidden');
            // 触发重排以启动动画
            void targetSection.offsetWidth;
            targetSection.style.opacity = '1';
            targetSection.style.transform = 'translateY(0)';
        }, 300);
    }
}

// 注册表单处理
document.querySelector('#registerForm form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        phone: document.getElementById('phone').value
    };

    if (formData.password !== formData.confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }

    try {
        auth.register(formData);
        alert('注册成功！');
        showSection('loginForm');
    } catch (error) {
        alert(error.message);
    }
});

// 发布任务表单处理
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        reward: parseFloat(document.getElementById('taskReward').value),
        publisherId: currentUser.id,
        publisherName: currentUser.username,
        publisherPhone: currentUser.phone
    };

    try {
        taskManager.createTask(taskData);
        alert('任务发布成功！');
        document.getElementById('taskForm').reset();
        showSection('taskList');
        initializeTasks();
    } catch (error) {
        alert(error.message);
    }
});

// 接受任务处理
function acceptTaskHandler(taskId) {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    try {
        taskManager.acceptTask(taskId, currentUser.id);
        alert('接受任务成功！');
        initializeTasks();
    } catch (error) {
        alert(error.message);
    }
}

// 完成任务处理
function completeTaskHandler(taskId) {
    try {
        taskManager.completeTask(taskId);
        alert('任务已完成！');
        initializeTasks();
    } catch (error) {
        alert(error.message);
    }
}

// 初始化个人中心
function initializePersonalTasks() {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) return;

    // 显示个人信息
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profilePhone').textContent = currentUser.phone;
    document.getElementById('profileAddress').textContent = currentUser.address || '未设置';

    // 渲染任务列表
    const publishedTasks = taskManager.getUserPublishedTasks(currentUser.id);
    const acceptedTasks = taskManager.getUserAcceptedTasks(currentUser.id);
    
    renderTasks(publishedTasks, 'publishedTasks');
    renderTasks(acceptedTasks, 'acceptedTasks');

    // 添加地址修改功能
    setupAddressEdit();
}

// 设置地址修改功能
function setupAddressEdit() {
    const editBtn = document.getElementById('editAddressBtn');
    const modal = document.getElementById('addressModal');
    const cancelBtn = document.getElementById('cancelAddressEdit');
    const addressForm = document.getElementById('addressForm');

    // 显示模态框
    editBtn.onclick = () => {
        modal.classList.remove('hidden');
    };

    // 隐藏模态框
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');
    };

    // 处理地址修改
    addressForm.onsubmit = (e) => {
        e.preventDefault();
        const newAddress = document.getElementById('newAddress').value;
        const currentUser = auth.getCurrentUser();
        
        // 更新用户地址
        currentUser.address = newAddress;
        auth.updateUser(currentUser);
        
        // 更新显示
        document.getElementById('profileAddress').textContent = newAddress;
        modal.classList.add('hidden');
        addressForm.reset();
    };
}
 