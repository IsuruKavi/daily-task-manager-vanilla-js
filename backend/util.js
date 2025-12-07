// ============================================
// UTILITY FUNCTIONS AND MIDDLEWARE
// ============================================
// This file contains reusable middleware functions and utilities
// Keeping them separate makes app.js cleaner and easier to understand

// ============================================
// MIDDLEWARE 1 - Logs a message for every request
// ============================================
// This middleware runs for every request and logs a message
const middleware1 = function (req, res, next) {
    console.log("this is middleware 1")
    next()  // Continue to next middleware or route
}

// ============================================
// MIDDLEWARE 2 - Adds a property to request body
// ============================================
// This middleware adds a property to the request body
// Demonstrates how middleware can modify request data
const middleware2 = function (req, res, next) {
    console.log("this is middleware 2")
    if (req.body) {
        // Add a new property to the request body
        req.body.newVal = "new val added in middleware"
    }
    next()  // Continue to next middleware or route
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================
// Placeholder middleware for authentication (for learning purposes)
// In a real app, this would check if user is logged in
const authMiddleware = (req, res, next) => {
    console.log("this is for auth purposes")
    next()  // Continue to next middleware or route
}


const loggerMiddleware = (req, res, next) => {
    const currentTime = new Date().toISOString();
    console.log("_____Request_Log______");
    console.log("Time: ",currentTime)
    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);
    console.log("Query:", req.query);
    console.log("Body:", req.body);
    console.log("------------------------");
    next()
}
// ============================================
// FORM VALIDATION MIDDLEWARE
// ============================================
// Validates request data before it reaches the route handler
// This demonstrates how middleware can intercept and validate requests
const formValidationMiddleware = (req, res, next) => {
    console.log("Form validation middleware running...")
    
    // Check if request has a body (POST and PATCH requests have bodies)
    if (!req.body) {
        return res.status(400).json({ error: "Request body is required" });
    }
    
    // For POST requests (creating new task) - validate task name and start time
    if (req.method === 'POST') {
        const { task, startTime } = req.body;
        
        // Check if task name is provided
        if (!task) {
            return res.status(400).json({ error: "Task name is required" });
        }
        
        // Check if task name is not empty after trimming whitespace
        if (typeof task === 'string' && task.trim() === '') {
            return res.status(400).json({ error: "Task name cannot be empty" });
        }
        
        // Check if start time is provided
        if (!startTime) {
            return res.status(400).json({ error: "Start time is required" });
        }
        
        console.log("✓ POST validation passed: task and startTime are valid");
    }
    
    // For PATCH requests (updating task) - validate id and isComplete
    if (req.method === 'PATCH') {
        const { id, isComplete } = req.body;
        
        // Check if id is provided
        if (id === undefined || id === null) {
            return res.status(400).json({ error: "Task ID is required" });
        }
        
        // Check if isComplete is provided and is a boolean
        if (isComplete === undefined || isComplete === null) {
            return res.status(400).json({ error: "isComplete status is required" });
        }
        
        if (typeof isComplete !== 'boolean') {
            return res.status(400).json({ error: "isComplete must be a boolean (true or false)" });
        }
        
        console.log("✓ PATCH validation passed: id and isComplete are valid");
    }
    
    // If validation passes, continue to the next middleware or route handler
    next();
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
// Catches any errors that weren't handled in route handlers
// Must be placed AFTER all routes in app.js
//
// WHEN IS THIS CALLED?
// 1. When a route handler calls next(error) - passes error to this handler
// 2. When an unhandled exception occurs in async routes (in some cases)
// 3. When middleware calls next(error)
//
// EXAMPLE: In a route handler, you can do:
//   try {
//       // some code
//   } catch (error) {
//       next(error);  // This will trigger errorHandler
//   }
//
// TEST IT: Visit http://127.0.0.1:3000/test-error to see it in action
const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    console.error("Unhandled error:", err);
    
    // Send a generic error response
    res.status(500).json({ 
        error: "Internal server error",
        message: err.message || "Something went wrong"
    });
}

// ============================================
// 404 HANDLER - Handle routes that don't exist
// ============================================
// Catches any requests to routes that don't exist
// Must be placed after all routes but before error handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.path}`
    });
}

// ============================================
// EXPORT ALL MIDDLEWARE FUNCTIONS
// ============================================
// Export functions so they can be imported in app.js
module.exports = {
    middleware1,
    middleware2,
    authMiddleware,
    formValidationMiddleware,
    errorHandler,
    notFoundHandler,
    loggerMiddleware
}

