/**
 * Created by Cayden on 16/5/11.
 */
var bcrypt = require('bcrypt');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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
                },
                generateToken: function (type) {
                    if (!_.isString(type)) {
                        return undefined;
                    }

                    try {
                        var stringData = JSON.stringify({
                            id: this.get('id'),
                            type: type
                        });
                        var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#$').toString();
                        var token = jwt.sign({
                            token: encryptedData
                        }, 'qwerty098');

                        return token;
                    } catch (e) {
                        return undefined;
                    }
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
                },
                findByToken: function (token) {
                    return new Promise(function (resolve, reject) {
                        try {
                            var decodedJWT = jwt.verify(token, 'qwerty098');
                            var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!@#$');
                            var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                            user.findById(tokenData.id)
                                .then(function (user) {
                                    if (user) {
                                        resolve(user);
                                    } else {
                                        reject();
                                    }
                                }, function (e) {
                                    reject();
                                })
                        } catch (e) {
                            reject();
                        }
                    });
                }
            }
        }
    );
    return user;
};