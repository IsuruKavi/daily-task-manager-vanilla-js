// ============================================
// IMPORTING MODULES - Load required packages
// ============================================
// Express is a web framework for Node.js to create servers
const express = require('express')

// Body-parser helps read data from HTTP requests
const bodyParser = require('body-parser');

// CORS allows our frontend to communicate with this backend
const cors = require('cors')

// Create an Express application
const app = express()

// ============================================
// SERVER CONFIGURATION
// ============================================
// Port number where server will run
const port = 3000

// Array to store all tasks (in-memory storage - data is lost when server restarts)
const taskList=[]

// ============================================
// MIDDLEWARE SETUP - Functions that run before routes
// ============================================
// Enable CORS - Allow requests from frontend running on port 5500
app.use(cors({ origin: 'http://127.0.0.1:5500', optionsSuccessStatus: 200 }))

// Parse JSON data from request body
app.use(bodyParser.json());

// Middleware 1 - Logs a message for every request
app.use(function (req, res, next) {
    console.log("this is middleware 1")
    next()  // Continue to next middleware or route
})

// Middleware 2 - Adds a property to request body
app.use(function (req, res, next) {
    console.log("this is middleware 2")
    if (req.body) {
        // Add a new property to the request body
        req.body.newVal="add in middleware"
    }
    next()  // Continue to next middleware or route
})

// ============================================
// CUSTOM MIDDLEWARE FUNCTIONS
// ============================================
// Authentication middleware (placeholder - for learning purposes)
const authMiddleware = (req, res, next) => {
    console.log("this is for auth purposes")
    next()  // Continue to next middleware or route
}

// Form validation middleware (placeholder - for learning purposes)
const formValidationMiddleware = (req, res, next) => {
    console.log("this if for form validation purposes")
    next()  // Continue to next middleware or route
}

// Apply authentication middleware to all routes
app.use(authMiddleware)

// ============================================
// API ROUTES - Define endpoints for the server
// ============================================

// GET /tasks - Retrieve all tasks
// This route returns all tasks sorted by completion status
app.get('/tasks', (req, res) => {
    // Sort tasks: incomplete tasks first, then completed tasks
    const filteredTaskList = taskList.sort((a, b) => a.isComplete - b.isComplete);
    console.log(JSON.stringify(filteredTaskList))
    console.log(taskList)
    // Send sorted task list as JSON response with status 201
    res.status(201).json(filteredTaskList)
  })
  
// POST /tasks - Create a new task
// This route creates a new task and adds it to the taskList array
app.post('/tasks',formValidationMiddleware, (req, res) => {
    console.log(req.body)
    // Extract task name, start time, and newVal from request body
    const { task ,startTime,newVal} = req.body;
    
    // Create a new task object
    // id: auto-increment based on array length
    // isComplete: set to false by default
    const newTask = { id: taskList.length + 1, task, startTime,isComplete:false }
    
    // Add the new task to the array
    taskList.push(newTask)
    console.log("taskList",taskList)
    
    // Send the newly created task as JSON response with status 201
    res.status(201).json(newTask);
    
})

// PATCH /tasks - Update a task's completion status
// This route updates whether a task is complete or not
app.patch('/tasks', formValidationMiddleware, (req, res) => {
    console.log(req.body)
    // Extract task id and new completion status from request body
    const { id, isComplete } = req.body;
    
    // Find the index of the task with matching id
    const indexToChangeValue = taskList.findIndex(task => task.id === Number(id));
    
    // Update the task's completion status
    taskList[indexToChangeValue].isComplete = isComplete;
    
    // Send the updated task as JSON response with status 201
    res.status(201).json(taskList[indexToChangeValue]);


})

// DELETE /tasks/:id - Delete a task by ID
// This route removes a task from the taskList array
app.delete('/tasks/:id', (req, res) => {
    // Get the task ID from the URL parameter
    const taskId=req.params.id
    
    // Find the index of the task with matching id
    const indexToRemove = taskList.findIndex(task => task.id === Number(taskId));
    
    // If task is found (index is not -1), remove it from array
    if (indexToRemove !== -1) {
        // Remove 1 element at the found index
        taskList.splice(indexToRemove,1)
    }
    
    // Send confirmation with the deleted task's ID
    res.json({id:req.params.id});
})

// ============================================
// START SERVER - Make server listen on port 3000
// ============================================
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
