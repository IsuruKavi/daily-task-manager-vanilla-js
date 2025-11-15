document.addEventListener("DOMContentLoaded", function () {
  console.log("website loaded!")
  getTasks()
})


const addTaskBtn = document.querySelector(".addBtn");
console.log(addTaskBtn)
addTaskBtn.addEventListener("click", function () {
    console.log("add btn clicked")
    document.querySelector(".addTask").style.display="flex"
})

const getTasks = async()=>{
  const table = document.getElementById("task-table").getElementsByTagName("tbody")[0];
  table.innerHTML=""
  try {
    const response = await fetch("http://127.0.0.1:3000/tasks");
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    
    result.map((task) => {
      const table = document.getElementById("task-table").getElementsByTagName("tbody")[0];
      const newRow = table.insertRow();
      newRow.insertCell(0).innerHTML = task.task;
      newRow.insertCell(1).innerHTML = task.startTime;
      if (task.isComplete) {
         newRow.insertCell(2).innerHTML=`<button data-task-id=${task.id} data-state=${task.isComplete} class="mark-btn" style="margin-right:1dvw; background-color:papayawhip">Unmark as complete</button>`
      } else {
         newRow.insertCell(2).innerHTML=`<button data-task-id=${task.id} data-state=${task.isComplete} class="mark-btn" style="margin-right:1dvw; background-color:lightblue">Mark as complete</button>`
      }
     
      newRow.insertCell(3).innerHTML=`<button data-task-id=${task.id} class="delete-btn" >delete</button>`
    })
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }

}
document.querySelector("#taskAddForm").addEventListener('submit', async function (event) {
    event.preventDefault();
    const task = document.querySelector("#task");
    const startTime = document.querySelector("#start-time");
    const response = await fetch("http://127.0.0.1:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task:task.value,startTime:startTime.value }),
        // …
      });
  console.log("submit form", task.value, startTime.value)
  task.value =""
  startTime.value=""
  document.querySelector(".addTask").style.display = "none"
  await getTasks();
})

document.querySelector("#form-close").addEventListener('click', function () {
    console.log("close btn clicked")
     document.querySelector(".addTask").style.display="none"
})

const taskList = document.querySelector("#task-list");
taskList.addEventListener("click", async function (e) {
  const id = Number(e.target.dataset.taskId);
 
  const state =(e.target.dataset.state==='false'? false:true);
  console.log("currentState",!state)
  if (e.target.classList.contains('delete-btn')) {
   
  try {
    await fetch(`http://127.0.0.1:3000/tasks/${id}`, {
      method: "DELETE",
    })
    console.log("success full deleted")
  } catch (error) {
    console.error("error in deleting")
  } finally {
    getTasks()
  }
  
  }
  if (e.target.classList.contains('mark-btn')) {
    try {
      await fetch('http://127.0.0.1:3000/tasks', {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, isComplete:!state  }),
      })
      console.log("updated one",{id,isComplete:!state})
    } catch (error) {
      console.error("error in updating")
    } finally {
      getTasks()
    }
  }

  
})

