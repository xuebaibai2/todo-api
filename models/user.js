/**
 * Created by Cayden on 16/5/11.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define('uesr', {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true
                }
            },
            salt: {
                type: DataTypes.STRING
            },
            password_hash: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.VIRTUAL,
                allowNull: false,
                validate: {
                    len: [7, 100]
                },
                set: function (value) {
                    var salt = bcrypt.genSaltSync(10);
                    var hashedPassword = bcrypt.hashSync(value, salt);

                    this.setDataValue('password', value);
                    this.setDataValue('salt', salt);
                    this.setDataValue('password_hash', hashedPassword);
                }
            }

        }, {
            hooks: {
                beforeValidate: function (user, options) {
                    //user.email => lowercase
                    if (typeof user.email === 'string') {
                        user.email = user.email.toLowerCase();
                    }
                }
            },
            instanceMethods: {
                toPublicJSON: function () {
                    var json = this.toJSON();
                    return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
                }
            },
            classMethods: {
                authenticate: function (body) {
                    return new Promise(function (resolve, reject) {
                        if (!_.isString(body.email) || body.email.trim().length === 0) {
                            return reject({
                                "error": "Email cannot be empty!"
                            });
                        }
                        if (!_.isString(body.password) || body.password.trim().length === 0) {
                            return reject({
                                "error": "Password cannot be empty!"
                            });
                        }
                        user.findOne({
                            where: {
                                email: body.email
                            }
                        }).then(function (user) {
                            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
                                return reject({
                                    "error": "Email or password is incorrect!"
                                });
                            }
                            resolve(user);

                        }, function (e) {
                            reject(e);
                        });
                    });
                }
            }
        }
    );
    return user;
};