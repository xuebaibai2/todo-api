/**
 * Created by Cayden on 16/5/9.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
    var matchedTodo = _.findWhere(todos,{id: todoID});

    // var todoList = [];
    // todos.forEach(function (task) {
    //     if (task.id === todoID) {
    //         todoList.push(task);
    //     }
    // });
    if (!matchedTodo) {
        res.status(404).send("Result not found!");
    } else {
        res.send(matchedTodo);
    }
});

//POST /todos
app.post('/todos',function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');
    if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0 ){
        return res.status(400).send();
    }

    body.description = body.description.trim();
    body.id = todoNextId++;
    todos.push(body);
    res.json(todos);
});

app.listen(PORT, function () {
    console.log("Express listing on port: " + PORT) + "!";
});