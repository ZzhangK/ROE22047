class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    // 注册新用户
    register(userData) {
        // 检查用户名是否已存在
        if (this.users.find(user => user.username === userData.username)) {
            throw new Error('用户名已存在');
        }

        // 创建新用户
        const newUser = {
            id: Date.now(),
            username: userData.username,
            password: userData.password,
            phone: userData.phone,
            publishedTasks: [],
            acceptedTasks: []
        };

        // 保存用户
        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        return newUser;
    }

    // 用户登录
    login(username, password) {
        const user = this.users.find(u => u.username === username && u.password === password);
        if (!user) {
            throw new Error('用户名或密码错误');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    // 用户登出
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    // 获取当前用户
    getCurrentUser() {
        return this.currentUser;
    }

    // 添加更新用户信息方法
    updateUser(userData) {
        const userIndex = this.users.findIndex(u => u.id === userData.id);
        if (userIndex !== -1) {
            this.users[userIndex] = userData;
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(userData));
            this.currentUser = userData;
        }
    }
} 