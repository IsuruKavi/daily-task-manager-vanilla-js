# Error Handler Scenarios - When Will It Be Called?

This document explains when the error handler middleware will be triggered.

## Understanding Error Handler

The error handler middleware (`errorHandler` in `util.js`) is called when:
1. An error is passed to `next(error)` from any route handler or middleware
2. An unhandled exception occurs in async route handlers (in some cases)

## Current Setup

**Important Note:** Currently, all route handlers have `try-catch` blocks that handle errors themselves. This means they **don't** call `next(error)`, so the error handler won't be triggered for those routes.

## Scenarios Where Error Handler Will Be Called

### Scenario 1: Using `next(error)` in Route Handler

**Route:** `GET /test-error`

**What happens:**
```javascript
app.get('/test-error', (req, res, next) => {
    const error = new Error("This is a test error");
    next(error);  // This triggers the error handler
})
```

**How to test:**
- Open browser or Postman
- Send GET request to: `http://127.0.0.1:3000/test-error`
- You'll see error handler response:
  ```json
  {
    "error": "Internal server error",
    "message": "This is a test error to demonstrate error handler"
  }
  ```

### Scenario 2: Unhandled Exception in Route

**Route:** `GET /test-error-2`

**What happens:**
```javascript
app.get('/test-error-2', (req, res) => {
    const obj = null;
    const value = obj.someProperty;  // Throws error: Cannot read property of null
    res.json({ value });
})
```

**How to test:**
- Send GET request to: `http://127.0.0.1:3000/test-error-2`
- This will throw an error that might be caught by Express and passed to error handler

### Scenario 3: Error in Middleware

If any middleware calls `next(error)`, the error handler will be triggered.

**Example:**
```javascript
app.use((req, res, next) => {
    if (someCondition) {
        next(new Error("Something went wrong in middleware"));
    } else {
        next();
    }
});
```

### Scenario 4: Async Route Handler Error (if not caught)

If you have an async route handler and an error is thrown but not caught:

```javascript
app.get('/async-error', async (req, res, next) => {
    // If error is thrown here and not caught, Express will pass it to error handler
    const data = await someAsyncOperation();
    if (!data) {
        throw new Error("Data not found");  // This will trigger error handler
    }
    res.json(data);
})
```

## Scenarios Where Error Handler Will NOT Be Called

### Current Route Handlers

All current routes (GET /tasks, POST /tasks, PATCH /tasks, DELETE /tasks/:id) have try-catch blocks that handle errors themselves, so they **don't** trigger the error handler.

**Example:**
```javascript
app.get('/tasks', (req, res) => {
    try {
        // code here
    } catch (error) {
        // Error is handled here, not passed to error handler
        res.status(500).json({ error: "Failed to retrieve tasks" });
    }
})
```

## How to Make Current Routes Use Error Handler

If you want current routes to use the error handler, you can modify them like this:

**Before (current):**
```javascript
app.get('/tasks', (req, res) => {
    try {
        // code
    } catch (error) {
        res.status(500).json({ error: "Failed" });  // Handles error here
    }
})
```

**After (using error handler):**
```javascript
app.get('/tasks', (req, res, next) => {
    try {
        // code
    } catch (error) {
        next(error);  // Pass error to error handler
    }
})
```

## Testing the Error Handler

1. **Test Scenario 1:**
   ```bash
   curl http://127.0.0.1:3000/test-error
   ```

2. **Test Scenario 2:**
   ```bash
   curl http://127.0.0.1:3000/test-error-2
   ```
   

3. **Test 404 Handler (not error handler, but related):**
   ```bash
   curl http://127.0.0.1:3000/non-existent-route
   ```

you can use postman instead of curl command

## Summary

- **Error Handler** is called when `next(error)` is called or unhandled exceptions occur
- **404 Handler** is called when a route doesn't exist
- Current routes handle errors themselves, so they don't use the error handler
- Test routes (`/test-error` and `/test-error-2`) demonstrate how error handler works

