const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express()

const port = 3000
const taskList=[]
app.use(cors({ origin: 'http://127.0.0.1:5500', optionsSuccessStatus: 200 }))
app.use(bodyParser.json());
app.use(function (req, res, next) {
    console.log("this is middleware 1")
    next()
})
app.use(function (req, res, next) {
    console.log("this is middleware 2")
    if (req.body) {
        
        req.body.newVal="add in middleware"
    }
    next()
})

const authMiddleware = (req, res, next) => {
    console.log("this is for auth purposes")
    next()
}

const formValidationMiddleware = (req, res, next) => {
    console.log("this if for form validation purposes")
    next()
}
app.use(authMiddleware)

// GET method route
app.get('/tasks', (req, res) => {
    const filteredTaskList = taskList.sort((a, b) => a.isComplete - b.isComplete);
    console.log(JSON.stringify(filteredTaskList))
    console.log(taskList)
    res.status(201).json(filteredTaskList)
  })
  
  // POST method route
app.post('/tasks',formValidationMiddleware, (req, res) => {
    console.log(req.body)
    const { task ,startTime,newVal} = req.body;
    const newTask = { id: taskList.length + 1, task, startTime,isComplete:false }
    taskList.push(newTask)
    console.log("taskList",taskList)
    res.status(201).json(newTask);
    
})
app.patch('/tasks', formValidationMiddleware, (req, res) => {
    console.log(req.body)
    const { id, isComplete } = req.body;
    const indexToChangeValue = taskList.findIndex(task => task.id === Number(id));
    taskList[indexToChangeValue].isComplete = isComplete;
    res.status(201).json(taskList[indexToChangeValue]);


})
  
app.delete('/tasks/:id', (req, res) => {
    const taskId=req.params.id
    const indexToRemove = taskList.findIndex(task => task.id === Number(taskId));
    if (indexToRemove !== -1) {
        taskList.splice(indexToRemove,1)
    }
    res.json({id:req.params.id});
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
