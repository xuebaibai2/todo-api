/**
 * Created by Cayden on 16/5/9.
 */
var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

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

//POST /todos
app.post('/todos',function (req, res) {
    var body = req.body;
    body.id = todoNextId++;
    todos.push(body);
    res.json(todos);
});

app.listen(PORT, function () {
    console.log("Express listing on port: " + PORT) + "!";
});