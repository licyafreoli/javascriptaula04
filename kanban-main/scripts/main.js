document.addEventListener('DOMContentLoaded', loadTasks);

function loadTasks() {
    fetch('data/tasks.json')
        .then(response => response.json())
        .then(data => {
            data.tasks.forEach(task => {
                createTaskElement(task);
            });
        });
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task', 'animate__animated');
    taskElement.setAttribute('draggable', 'true');
    taskElement.setAttribute('ondragstart', 'drag(event)');
    taskElement.setAttribute('data-status', task.status);
    taskElement.innerHTML = `${task.description} (Due: ${task.dueDate}) <button onclick="deleteTask(this)">Delete</button>`;

    // Check if the task is due soon
    if (isDueSoon(task.dueDate)) {
        taskElement.classList.add('due-soon');
    }

    document.getElementById(`${task.status}-tasks`).appendChild(taskElement);

    // Add animation class for new task
    taskElement.classList.add('animate__fadeIn');
}

function addTask(status) {
    const description = prompt("Enter task description:");
    const dueDate = prompt("Enter due date (YYYY-MM-DD):");
    if (description && dueDate) {
        const newTask = { status, description, dueDate };
        createTaskElement(newTask);
        saveTask(newTask);
    }
}

function saveTask(task) {
    fetch('data/tasks.json')
        .then(response => response.json())
        .then(data => {
            data.tasks.push(task);
            saveTasksToFile(data.tasks);
        });
}

function saveTasksToFile(tasks) {
    // This function is a placeholder. In a real application, you would need a backend service to save the tasks.
    console.log('Tasks saved:', tasks);
}

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData("text", event.target.innerText);
    event.dataTransfer.setData("status", event.target.getAttribute('data-status'));
    event.dataTransfer.setData("element", event.target);
    event.target.classList.add('dragging');
}

function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const oldStatus = event.dataTransfer.getData("status");
    const element = event.dataTransfer.getData("element");
    const newStatus = event.target.id.split('-')[0];

    if (event.target.classList.contains('kanban-tasks')) {
        const taskElement = document.querySelector('.dragging');
        event.target.appendChild(taskElement);
        taskElement.classList.remove('dragging');

        // Update task status
        updateTaskStatus(data, oldStatus, newStatus);

        // Add animation class for moved task
        taskElement.classList.add('animate__animated', 'animate__fadeIn');
    }
}

function updateTaskStatus(description, oldStatus, newStatus) {
    fetch('data/tasks.json')
        .then(response => response.json())
        .then(data => {
            const task = data.tasks.find(task => task.description === description && task.status === oldStatus);
            if (task) {
                task.status = newStatus;
                saveTasksToFile(data.tasks);
            }
        });
}

function isDueSoon(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
}

function deleteTask(button) {
    const taskElement = button.parentElement;
    taskElement.classList.add('animate__fadeOut');
    taskElement.addEventListener('animationend', () => {
        taskElement.remove();
        // Optionally, you can also update the JSON file to remove the task permanently
    });
}
