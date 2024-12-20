class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    // 创建新任务
    createTask(taskData) {
        const newTask = {
            id: Date.now(),
            title: taskData.title,
            description: taskData.description,
            reward: taskData.reward,
            status: '待接单',
            publisherId: taskData.publisherId,
            publisherName: taskData.publisherName,
            publisherPhone: taskData.publisherPhone,
            accepterId: null,
            createdAt: new Date().toISOString(),
            deadline: taskData.deadline
        };

        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    // 接受任务
    acceptTask(taskId, userId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('任务不存在');
        if (task.status !== '待接单') throw new Error('任务已被接受');
        if (task.publisherId === userId) throw new Error('不能接受自己发布的任务');

        task.status = '进行中';
        task.accepterId = userId;
        this.saveTasks();
        return task;
    }

    // 完成任务
    completeTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('任务不存在');
        
        task.status = '已完成';
        this.saveTasks();
        return task;
    }

    // 取消任务
    cancelTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) throw new Error('任务不存在');
        
        task.status = '待接单';
        task.accepterId = null;
        this.saveTasks();
        return task;
    }

    // 获取所有可接任务
    getAvailableTasks() {
        return this.tasks.filter(task => task.status === '待接单');
    }

    // 获取用户发布的任务
    getUserPublishedTasks(userId) {
        return this.tasks.filter(task => task.publisherId === userId);
    }

    // 获取用户接受的任务
    getUserAcceptedTasks(userId) {
        return this.tasks.filter(task => task.accepterId === userId);
    }

    // 保存任务到localStorage
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// 创建任务管理器实例
const taskManager = new TaskManager();

// 渲染任务列表
function renderTasks(tasks, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        container.appendChild(taskElement);
    });
}

// 创建任务元素
function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-card';
    
    // 格式化时间
    const createdTime = new Date(task.createdAt).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    taskElement.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <p>报酬: ¥${task.reward}</p>
        <p>状态: ${task.status}</p>
        <p>发布者: ${task.publisherName}</p>
        <div class="task-time">发布时间: ${createdTime}</div>
        ${task.status === '待接单' ? '<button class="accept-btn">接受任务</button>' : ''}
        ${task.status === '进行中' ? '<button class="complete-btn">完成任务</button>' : ''}
    `;

    // 添加接受任务按钮事件
    const acceptBtn = taskElement.querySelector('.accept-btn');
    if (acceptBtn) {
        acceptBtn.onclick = () => acceptTaskHandler(task.id);
    }

    // 添加完成任务按钮事件
    const completeBtn = taskElement.querySelector('.complete-btn');
    if (completeBtn) {
        completeBtn.onclick = () => completeTaskHandler(task.id);
    }

    return taskElement;
}

// 初始化页面
function initializeTasks() {
    // 渲染可接任务列表
    const availableTasks = taskManager.getAvailableTasks();
    renderTasks(availableTasks, 'taskList');

    // 如果用户已登录，渲染个人任务
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const publishedTasks = taskManager.getUserPublishedTasks(currentUser.id);
        const acceptedTasks = taskManager.getUserAcceptedTasks(currentUser.id);
        
        renderTasks(publishedTasks, 'publishedTasks');
        renderTasks(acceptedTasks, 'acceptedTasks');
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', initializeTasks); 