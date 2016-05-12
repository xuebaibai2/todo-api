/**
 * Created by Cayden on 16/5/9.
 */
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];

app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send("Todo API Root");
});

//GET /todos
app.get('/todos', middleware.requireAuthentication, function (req, res) {
    var queryParams = req.query;
    var where = {};

    if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        where.completed = true;
    } else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        where.completed = false;
    }

    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        where.description = {
            $like: '%' + queryParams.q + '%'
        };
    }

    db.todo.findAll({where: where}).then(function (todos) {
        res.json(todos);
    }, function (e) {
        res.status(500).send();
    });
});
//GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoID = parseInt(req.params.id);
    db.todo.findOne({
        where: {
            id: todoID
        }
    }).then(function (todo) {
        if (!todo) {
            return res.status(404).send("Result not found!");
        }
        res.json(todo.toJSON());
    });
});

//POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    if (!_.isString(body.description) || body.description.trim().length === 0) {
        return res.status(400).send();
    }
    if (body.completed && !_.isBoolean(body.completed)) {
        return res.status(400).send();
    }
    db.todo.create({
        description: body.description,
        completed: body.completed
    }).then(function (todo) {
        if (todo) {
            res.json(todo.toJSON());
        } else {
            res.status(400).send("Failed to post");
        }
    }).catch(function (e) {
        console.log(e);
    });
});

//DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoID = parseInt(req.params.id);
    db.todo.destroy({
        where: {
            id: todoID
        }
    }).then(function (rows) {
        if (rows == 0) {
            return res.status(404).json({
                error: "No todo with current id"
            });
        } else {
            res.status(204).send();
        }
    }, function (e) {
        return res.status(500).send(e);
    });
});

//PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoID = parseInt(req.params.id);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if (body.hasOwnProperty('description') && !_.isBoolean(body.description)) {
        attributes.description = body.description.trim();
    }

    db.todo.findById(todoID).then(function (todo) {
        if (!todo) {
            res.status(404).send();
        } else {
            todo.update(attributes)
                .then(function (todo) {
                    res.json(todo.toJSON());
                }, function (e) {
                    res.status(400).json(e);
                })
        }
    }, function () {
        res.status(500).send();
    });

});


//POST /users
app.post('/users', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    if (!_.isString(body.email) || body.email.trim().length === 0) {
        return res.status(400).send();
    }
    if (!_.isString(body.password) || body.password.trim().length === 0) {
        return res.status(400).send();
    }

    db.user.create(body).then(function (user) {
        // res.json(user.toJSON());
        res.json(user.toPublicJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

//POST /users/login
app.post('/users/login', function (req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body)
        .then(function (user) {
            var token = user.generateToken('authentication');
            if (token){
                res.header('Auth', token).json(user.toPublicJSON());
            }else{
                res.status(401).send();
            }

        }, function (e) {
            res.status(401).json(e);
        });
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log("Express listing on port: " + PORT) + "!";
    });
});

