var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 255]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

var User = sequelize.define('user', {
    email: {
        type: Sequelize.STRING
    }
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    // force: true
}).then(function () {
    console.log('Everything is synced');

    // var where = [];
    User.findById(1).then(function (user) {
        user.getTodos({
            where:{
                completed:false
            }
        }).then(function (todos) {
            todos.forEach(function (todo) {
                console.log(todo.toJSON());
                // if (todo.completed === false) {
                //     where.push(todo);
                // };
            });
        });
    });
    // User.create({
    //     email: 'xuebaibai2@hotmail.com'
    // }).then(function (user) {
    //     return Todo.create({
    //         description: "Clean yard",
    //         completed: true
    //     });
    // }).then(function (todo) {
    //     User.findById(1).then(function (user) {
    //         user.addTodo(todo);
    //     })
    // })

});
