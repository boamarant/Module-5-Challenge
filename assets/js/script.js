// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

let taskNameInput = $("#task-name");
let dueDateInput = $("#datepicker");
let taskDescInput = $("#task-desc");

const addTaskBtn = $('#add-task-btn');
const taskFormEl = $('#task-form');

// Todo: create a function to generate a unique task id
function generateTaskId(){ // Creates a new ID for each task added
  const id = nextId++;
  localStorage.setItem('nextId', JSON.stringify(nextId));
  return id;
}

function readTasksFromStorage() {
  taskList = JSON.parse(localStorage.getItem("tasks")) || []; // Initializes the array when the add button is pressed
  return taskList;
}

function saveTasksToStorage(taskList) { // Saves taskList to local storage
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $('<div>') // Creates visual elements for each card added
    .addClass('card task-card draggable my-3')
    .attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.taskName); 
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.taskDesc);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>') // Creates the delete button
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-task-id', task.id);
  cardDeleteBtn.on('click', handleDeleteTask);

  if (task.dueDate && task.status !== 'done') { // Updates the color of the cards based on how soon they are due
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

  taskList.forEach(task => {  // Renders each task in the correct column
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  });

  $('.draggable').draggable({ // Makes the cards draggable
    revert: "invalid",
    helper: "clone",
    opacity: 0.7,
    zIndex: 100
  });

}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    event.preventDefault();

    const name = taskNameInput.val().trim(); // Selects values inputted by the user and trims the text-based ones for visual clarity
    const date = dueDateInput.val();
    const desc = taskDescInput.val().trim();

    if (!name || !date || !desc) { // Checks to make sure the user inputted a value in each field
      alert("Please fill in all fields");
      return;
    }

    const newTask = { // Creates a task object for the taskList array
        taskName: name,
        dueDate: date,
        taskDesc: desc,
        status: 'to-do',
        id: generateTaskId()
    };

    taskList.push(newTask); // Inserts the new object into the taskList array
    saveTasksToStorage(taskList);
    renderTaskList();

    taskNameInput.val(''); // Resets the input fields and hides the modal after each task is entered
    dueDateInput.val('');
    taskDescInput.val('');
    $('#formModal').modal('hide');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).attr('data-task-id');
  taskList = taskList.filter(task => task.id != taskId); // Finds the task that is being deleted and filters it out
  saveTasksToStorage(taskList);
  renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.helper.attr('data-task-id'); 
  const newLocation = event.target.id;

  const taskIndex = taskList.findIndex(task => task.id == taskId); // Finds the ID of the card so that its position can be updated
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

    $('#datepicker').datepicker({ // Allows the datepicker to function on the modal
      changeMonth: true,
      changeYear: true,
    });

    $('.lane').droppable({ // Sets the lanes on the page to be able to have cards dropped inside of them
        accept: '.draggable',
        drop: handleDrop,
      });

    addTaskBtn.on('click', readTasksFromStorage); // Event listeners for button functionality
    taskFormEl.on('submit', handleAddTask);
    $(document).on('click', '.delete', handleDeleteTask);

});

    