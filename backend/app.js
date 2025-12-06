// Import middleware functions from util.js
const {
    middleware1,
    middleware2,
    authMiddleware,
    formValidationMiddleware,
    errorHandler,
    notFoundHandler
} = require('./util')


const express = require('express')
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'isuru',
    host: 'localhost', //host is the address where your PostgreSQL server is running
    database: 'my_db',
    password: "123456",
    dialect: 'postgres',
    port: 5432
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error(
            'Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
        release()
        if (err) {
            return console.error(
                'Error executing query', err.stack)
        }
        console.log("Connected to Database !")
    })
})

// Body-parser helps read data from HTTP requests
const bodyParser = require('body-parser');

// CORS allows our frontend to communicate with this backend
const cors = require('cors')



// Create an Express application
const app = express()
const port = 3000

// Array to store all tasks (in-memory storage - data is lost when server restarts)
const taskList = []

//Middlewares

//app.use(cors({ origin: 'http://127.0.0.1:5500', optionsSuccessStatus: 200 })) only allow for specific origin
app.use(cors()) //allow all origin requests, not recommand for production only for dev environment

// Parse JSON data from request body
app.use(bodyParser.json());

// Use middleware functions from util.js
app.use(middleware1)  // Logs message for every request
app.use(middleware2)  // Adds property to request body
app.use(authMiddleware)  // Authentication middleware (placeholder)

// ============================================
// API ROUTES - Define endpoints for the server
// ============================================

app.get('/tasks', (req, res) => {
    try {
        // Sort tasks: incomplete tasks first, then completed tasks
        const filteredTaskList = taskList.sort((a, b) => a.isComplete - b.isComplete);
        console.log(JSON.stringify(filteredTaskList))
        console.log(taskList)
        // Send sorted task list as JSON response with status 200 (OK)
        res.status(200).json(filteredTaskList)
    } catch (error) {
        // If any error occurs, send error response
        console.error("Error getting tasks:", error);
        res.status(500).json({ error: "Failed to retrieve tasks" });
    }
})

// POST /tasks - Create a new task
// This route creates a new task and adds it to the taskList array
// formValidationMiddleware runs FIRST to validate the data before this handler executes
app.post('/tasks', formValidationMiddleware, (req, res) => {
    try {
        console.log("Creating new task...")
        console.log(req.body)
        
        // Extract task name and start time (already validated by middleware)
        const { task, startTime } = req.body;
        
        // Create a new task object
        // id: Use timestamp to ensure unique IDs (better than array length)
        // Using Date.now() ensures unique IDs even if tasks are deleted
        // isComplete: set to false by default
        const newTask = { id: Date.now(), task, startTime, isComplete: false }
        
        // Add the new task to the array
        taskList.push(newTask)
        console.log("taskList", taskList)
        
        // Send the newly created task as JSON response with status 201 (Created)
        res.status(201).json(newTask);
    } catch (error) {
        // If any error occurs, send error response
        console.error("Error creating task:", error);
        res.status(500).json({ error: "Failed to create task" });
    }
})

// PATCH /tasks - Update a task's completion status
// This route updates whether a task is complete or not
// formValidationMiddleware runs FIRST to validate the data before this handler executes
app.patch('/tasks', formValidationMiddleware, (req, res) => {
    try {
        console.log("Updating task...")
        console.log(req.body)
        
        // Extract task id and new completion status (already validated by middleware)
        const { id, isComplete } = req.body;
        
        // Find the index of the task with matching id
        const indexToChangeValue = taskList.findIndex(task => task.id === Number(id));
        
        // Check if task was found
        if (indexToChangeValue === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        // Update the task's completion status
        taskList[indexToChangeValue].isComplete = isComplete;
        
        // Send the updated task as JSON response with status 200 (OK)
        res.status(200).json(taskList[indexToChangeValue]);
    } catch (error) {
        // If any error occurs, send error response
        console.error("Error updating task:", error);
        res.status(500).json({ error: "Failed to update task" });
    }
})

// DELETE /tasks/:id - Delete a task by ID
// This route removes a task from the taskList array
app.delete('/tasks/:id', (req, res) => {
    try {
        // Get the task ID from the URL parameter
        const taskId = req.params.id
        
        // Validate that ID is provided
        if (!taskId) {
            return res.status(400).json({ error: "Task ID is required" });
        }
        
        // Find the index of the task with matching id
        const indexToRemove = taskList.findIndex(task => task.id === Number(taskId));
        
        // Check if task was found
        if (indexToRemove === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        // Remove 1 element at the found index
        taskList.splice(indexToRemove, 1)
        
        // Send confirmation with the deleted task's ID and status 200 (OK)
        res.status(200).json({ message: "Task deleted successfully", id: taskId });
    } catch (error) {
        // If any error occurs, send error response
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Failed to delete task" });
    }
})

// ============================================
// TEST ROUTE - Demonstrates error handler
// ============================================
// This route is for learning purposes to see how error handler works
// Try accessing: GET http://127.0.0.1:3000/test-error
app.get('/test-error', (req, res, next) => {
    // Scenario 1: Manually throw an error and pass it to next()
    // This will trigger the error handler middleware
    const error = new Error("This is a test error to demonstrate error handler");
    next(error);  // Pass error to error handler middleware
})

// Another test route that throws an unhandled error
app.get('/test-error-2', (req, res) => {
    // Scenario 2: This will cause an error that might not be caught
    // Accessing a property that doesn't exist
    const obj = null;
    const value = obj.someProperty;  // This will throw an error
    res.json({ value });
})

// ============================================
// ERROR HANDLING - Must be placed AFTER all routes
// ============================================
// Handle routes that don't exist (404)
app.use(notFoundHandler)

// Handle any unhandled errors (500)
app.use(errorHandler)

// ============================================
// START SERVER - Make server listen on port 3000
// ============================================
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
