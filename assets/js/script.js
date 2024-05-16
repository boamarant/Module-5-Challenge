// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

let taskNameInput = $("#task-name");
let dueDateInput = $("#datepicker");
let taskDescInput = $("#task-desc");

const addTaskBtn = $('#add-task-btn');
const taskFormEl = $('#task-form');

// Todo: create a function to generate a unique task id
function generateTaskId(){
  nextId++;
}

function readTasksFromStorage() {
  if (!taskList) {
    taskList = [];
  }
  return taskList;
}

function saveTasksToStorage(taskList) {
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
      .addClass('card task-card draggable my-3')
      .attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.taskName);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.taskDesc);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>')
      .addClass('btn btn-danger delete')
      .text('Delete')
      .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const todoList = $('#todo-cards').empty();
  const inProgressList = $('#in-progress-cards').empty();
  const doneList = $('#done-cards').empty();

  taskList.forEach(task => {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  });
  

}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const name = taskNameInput.val().trim();
    const date = dueDateInput.val();
    const desc = taskDescInput.val().trim();

    const newTask = {
        taskName: name,
        dueDate: date,
        taskDesc: desc,
        status: 'to-do',
        id: generateTaskId()
    };

    taskList.push(newTask);
    saveTasksToStorage(taskList);
    renderTaskList();

    taskNameInput.val('');
    dueDateInput.val('');
    taskDescInput.val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-task-id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasksToStorage(taskList);
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr('data-task-id');
  const newLocation = event.target.id;

  const taskIndex = taskList.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    taskList[taskIndex].status = newLocation;
    saveTasksToStorage(taskList);
    renderTaskList();
  }
}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    readTasksFromStorage();
    renderTaskList();

    $('#datepicker').datepicker({
      changeMonth: true,
      changeYear: true,
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
      });

    $(document).on('mouseover', '.draggable', function(){
        $(this).draggable({
            opacity: 0.7,
            zIndex: 100,
            helper: function (e) {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    })
    });
    addTaskBtn.on('click', readTasksFromStorage);
    taskFormEl.on('submit', handleAddTask);
    $(document).on('click', '.delete', handleDeleteTask);

});

    