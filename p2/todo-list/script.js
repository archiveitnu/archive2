const inputTask = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task");
const taskList = document.querySelector("main");

let tasks = [
  {id: 1, text: "Practical 1", completed: true},
  {id: 2, text: "Practical 2", completed: false}
]

let nextId = tasks.length + 1;

addTaskBtn.addEventListener("click", () => {
  addTask();
  displayTasks();
  inputTask.value = '';
})

function displayTasks(){
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const taskContainer = document.createElement("div");
    taskContainer.classList.add('task-container');
    const taskText = document.createElement("div");
    taskText.textContent = task.text;
    if(task.completed){
      taskText.classList.add('completed');
    }
    taskText.onclick = () => {
      toggleTaskStatus(task.id);
    }
    const removeBtn = document.createElement("button");
    removeBtn.classList.add('remove-task');
    removeBtn.textContent = "Remove";
    removeBtn.onclick = () => {
      removeTask(task.id)
    }
    taskContainer.appendChild(taskText);
    taskContainer.appendChild(removeBtn);
    taskList.appendChild(taskContainer);
  })
}

function addTask(){
  const newTaskText = inputTask.value.trim();
  if(newTaskText !== ''){
    const newTask = {
      id: nextId++,
      text: newTaskText,
      completed: false
    }
    tasks.push(newTask);
  }
}

function removeTask(id){
  tasks = tasks.filter(task => task.id !== id);
  displayTasks();
}

function toggleTaskStatus(id){
  const taskIndex = tasks.findIndex(task => task.id === id);
  console.log(taskIndex);
  if(taskIndex !== -1){
    const currentStatus = tasks[taskIndex].completed;
    tasks[taskIndex].completed = !currentStatus;
  }
  displayTasks();
}

displayTasks();