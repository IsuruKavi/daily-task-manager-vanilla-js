// ============================================
// PAGE LOAD EVENT - Runs when page finishes loading
// ============================================
// This waits for the HTML to fully load before running JavaScript
document.addEventListener("DOMContentLoaded", function () {
  console.log("website loaded!")
  // Load all tasks from the server when page loads
  getTasks()
})

// ============================================
// TIME FORMATTING FUNCTION
// ============================================
// Converts 24-hour time (like "14:30") to 12-hour format with AM/PM (like "2:30 PM")
function formatTimeTo12Hour(time24) {
  // If no time is provided, return empty string
  if (!time24) return '';
  
  // Split the time string by ":" to get hours and minutes
  // Example: "14:30" becomes ["14", "30"]
  const [hours, minutes] = time24.split(':');
  
  // Convert hours string to a number
  const hour = parseInt(hours, 10);
  
  // Determine if it's AM or PM (12 and above is PM)
  const ampm = hour >= 12 ? 'PM' : 'AM';
  
  // Convert to 12-hour format (0 becomes 12, 13 becomes 1, etc.)
  const hour12 = hour % 12 || 12;
  
  // Return formatted time string like "2:30 PM"
  return `${hour12}:${minutes} ${ampm}`;
}

// ============================================
// ADD TASK BUTTON - Opens the modal/popup
// ============================================
// Find the "Add task" button on the page
const addTaskBtn = document.querySelector(".addBtn");
console.log(addTaskBtn)

// When the button is clicked, show the modal
addTaskBtn.addEventListener("click", function () {
    console.log("add btn clicked")
    // Change the modal display from "none" to "flex" to make it visible
    document.querySelector(".addTask").style.display="flex"
})

// ============================================
// GET TASKS FUNCTION - Fetches tasks from server
// ============================================
// This function gets all tasks from the backend server and displays them
const getTasks = async()=>{
  // Find the table body where we'll add task rows
  const table = document.getElementById("task-table").getElementsByTagName("tbody")[0];
  // Clear any existing tasks in the table
  table.innerHTML=""
  
  try {
    // Send a GET request to the server to fetch all tasks
    const response = await fetch("http://127.0.0.1:3000/tasks");
    
    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    // Convert the response to JSON format (JavaScript object)
    const result = await response.json();
    
    // Loop through each task and add it to the table
    result.map((task) => {
      // Get the table body again
      const table = document.getElementById("task-table").getElementsByTagName("tbody")[0];
      // Create a new row in the table
      const newRow = table.insertRow();
      
      // If task is completed, add a CSS class for styling
      if (task.isComplete) {
        newRow.classList.add('completed-task');
      }
      
      // Add task name to first column
      newRow.insertCell(0).innerHTML = task.task;
      // Add formatted time to second column (convert to AM/PM format)
      newRow.insertCell(1).innerHTML = formatTimeTo12Hour(task.startTime);
      
      // Add mark/unmark button based on completion status
      if (task.isComplete) {
         // If completed, show "Unmark as complete" button
         newRow.insertCell(2).innerHTML=`<button data-task-id=${task.id} data-state=${task.isComplete} class="mark-btn" style="margin-right:1dvw; background-color:papayawhip">Unmark as complete</button>`
      } else {
         // If not completed, show "Mark as complete" button
         newRow.insertCell(2).innerHTML=`<button data-task-id=${task.id} data-state=${task.isComplete} class="mark-btn" style="margin-right:1dvw; background-color:lightblue">Mark as complete</button>`
      }
     
      // Add delete button to last column
      newRow.insertCell(3).innerHTML=`<button data-task-id=${task.id} class="delete-btn" >delete</button>`
    })
    console.log(result);
  } catch (error) {
    // If there's an error, log it to the console
    console.error(error.message);
  }

}

// ============================================
// FORM SUBMISSION - Adds a new task
// ============================================
// When the form is submitted (user clicks "Add Task" button)
document.querySelector("#taskAddForm").addEventListener('submit', async function (event) {
    // Prevent the form from refreshing the page (default behavior)
    event.preventDefault();
    
    // Get the input fields
    const task = document.querySelector("#task");
    const startTime = document.querySelector("#start-time");
    
    // Send a POST request to the server to create a new task
    const response = await fetch("http://127.0.0.1:3000/tasks", {
        method: "POST",  // HTTP method for creating new data
        headers: {
          "Content-Type": "application/json",  // Tell server we're sending JSON
        },
        // Convert task data to JSON string and send it
        body: JSON.stringify({ task:task.value,startTime:startTime.value }),
      });
  
  console.log("submit form", task.value, startTime.value)
  
  // Clear the input fields after submission
  task.value =""
  startTime.value=""
  
  // Hide the modal after adding task
  document.querySelector(".addTask").style.display = "none"
  
  // Refresh the task list to show the new task
  await getTasks();
})

// ============================================
// CLOSE MODAL BUTTON - Hides the modal
// ============================================
// When the close button (X) is clicked
document.querySelector("#form-close").addEventListener('click', function () {
    console.log("close btn clicked")
    // Hide the modal by setting display to "none"
     document.querySelector(".addTask").style.display="none"
})

// ============================================
// TASK LIST EVENT HANDLER - Handles clicks on buttons
// ============================================
// Find the task list table body
const taskList = document.querySelector("#task-list");

// Listen for clicks anywhere in the task list (event delegation)
taskList.addEventListener("click", async function (e) {
  // Get the task ID from the clicked button's data attribute
  const id = Number(e.target.dataset.taskId);
 
  // Get the current completion state (convert string to boolean)
  const state =(e.target.dataset.state==='false'? false:true);
  console.log("currentState",!state)
  
  // ============================================
  // DELETE BUTTON CLICKED
  // ============================================
  // Check if the clicked element is a delete button
  if (e.target.classList.contains('delete-btn')) {
   
  try {
    // Send DELETE request to server to remove the task
    await fetch(`http://127.0.0.1:3000/tasks/${id}`, {
      method: "DELETE",  // HTTP method for deleting data
    })
    console.log("success full deleted")
  } catch (error) {
    // If error occurs, log it
    console.error("error in deleting")
  } finally {
    // Always refresh the task list after deletion attempt
    getTasks()
  }
  
  }
  
  // ============================================
  // MARK/UNMARK BUTTON CLICKED
  // ============================================
  // Check if the clicked element is a mark/unmark button
  if (e.target.classList.contains('mark-btn')) {
    try {
      // Send PATCH request to update the task's completion status
      await fetch('http://127.0.0.1:3000/tasks', {
        method: "PATCH",  // HTTP method for updating data
        headers: {
          "Content-Type": "application/json",  // Tell server we're sending JSON
        },
        // Send task ID and new completion status (toggle it)
        body: JSON.stringify({ id, isComplete:!state  }),
      })
      console.log("updated one",{id,isComplete:!state})
    } catch (error) {
      // If error occurs, log it
      console.error("error in updating")
    } finally {
      // Always refresh the task list after update attempt
      getTasks()
    }
  }

  
})
