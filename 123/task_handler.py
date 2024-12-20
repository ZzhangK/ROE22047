def get_task_details(task_id):
    # 获取任务基本信息
    task = Task.objects.get(id=task_id)
    
    # 获取发布者信息
    publisher = task.publisher
    task_details = {
        'task_id': task.id,
        'publisher_name': publisher.username,  # 发布者用户名
        'publisher_phone': publisher.phone,    # 发布者电话号码
        'title': task.title,
        'description': task.description,
        # 其他任务详情...
    }
    
    return task_details 