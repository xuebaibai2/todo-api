var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description : {
        type: Sequelize.STRING,
        allowNull: false,
        validate:{
            len: [1, 255]
        }
    },
    completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

sequelize.sync().then(function () {
    console.log('Everything is synced');

    Todo.findOne({
        where: {
            id: 1
        }
    }).then(function (todo) {
       if (todo){
           console.log(todo.toJSON());
       }else{
           console.log("Cannot find item");
       }
    });

    // Todo.create({
    //     description: "Take out trash"
    //
    // }).then(function (todo) {
    //     return Todo.create({
    //         description: 'clearn office'
    //     });
    // }).then(function () {
    //   // return Todo.findById(1);
    //     return Todo.findAll({
    //         where:{
    //             description: {
    //                 $like: '%trash%'
    //             }
    //         }
    //     });
    // }).then(function (todos) {
    //     if (todos){
    //         todos.forEach(function (todo) {
    //             console.log(todo.toJSON());
    //         });
    //
    //     }else{
    //         console.log('No todo found!');
    //     }
    // }).catch(function (e) {
    //     console.log(e);
    // })
});
