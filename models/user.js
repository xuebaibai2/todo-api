/**
 * Created by Cayden on 16/5/11.
 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('uesr', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [7, 100]
            }
        }

    }, {
        hooks: {
            beforeValidate: function (user, options) {
                //user.email => lowercase
                if (typeof user.email === 'string'){
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });
};