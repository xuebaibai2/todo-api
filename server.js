/**
 * Created by Cayden on 16/5/9.
 */
var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
    id: 1,
    description: "Learn Node.js",
    completed: false
}, {
    id: 2,
    description: "Learn JAVA",
    completed: false
}, {
    id: 3,
    description: "Learn C#",
    completed: true
}];

app.get('/', function (req, res) {
    res.send("Todo API Root");
});

//GET /todos
app.get('/todos', function (req, res) {
    res.json(todos);
});
//GET /todos/:id
app.get('/todos/:id', function (req, res) {
    var todoID = parseInt(req.params.id);
    var todoList = [];
    todos.forEach(function (task) {
        if (task.id === todoID) {
            todoList.push(task);
        }
    });
    if (todoList.length == 0) {
        res.status(404).send("Result not found!");
    } else {
        res.send(todoList);
    }
});

app.listen(PORT, function () {
    console.log("Express listing on port: " + PORT) + "!";
});