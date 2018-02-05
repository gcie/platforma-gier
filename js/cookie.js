/**
* 
* @param {http.IncomingMessage} req 
* @param {http.ServerResponse}  res 
* @param {*} next 
*/

const cookieParser = require('cookie-parser');
const pgp = require('pg-promise')({});
const cn = 'postgres://postgres:dawid@localhost:5432/postgres';
const db = pgp(cn);
const bcrypt = require('bcrypt');

function * gener() {
    var a = 1000; 
    while(true)
    {
        yield a++;
    }
}

let gen = gener;

module.exports = ({
    authorize : function (req,res,next) {
        if ( req.signedCookies.user ) {
            var usr = req.signedCookies.user.split('&');
            if(usr[0][0] != '@') {
                req.user = {
                    login : usr[0],
                    username : usr[1],
                    password : usr[2],
                    wins : usr[3],
                    losses : usr[4],
                    draws : usr[5]
                }
            } else {
                req.user = {
                    login : usr[0],
                    username : usr[1]
                }
            }
            next();
        } else {
            res.redirect( '/login'); 
        }
    },
    init : function(io, app) {
        var ID = function () {
            return '@' + Math.random().toString(36).substr(2, 9);
        };
        function allowedUsername(name) {
            var allowedSigns = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM1234567890'
            if(name.length > 20 || name.length < 6){
                return false;
            }
            var isallowed = true;
            for(var i = 0; i < name.length; i++)
            {
                if(allowedSigns.search(name[i]) == -1) {
                    isallowed = false;
                }
            }
            return isallowed;
        };
        app.use( cookieParser('9877dg9fb8sd79b87sdt9b87ds98b') );
        app.get('/login', (req,res) => {
            res.render('login', {message : ''});
        });
        
        app.get('/newaccount', (req,res) => {
            res.render('newaccount', {message : ''});
        });

        app.get('/anonymous', (req,res) => {
            res.render('anonymous', {message :''});
        });

        app.get('/logout', (req,res) => {
            res.cookie('user', '', {maxAge : -1});
            res.redirect('/');
        });

        app.post('/login', (req, res) => {
            var user = req.body.username;
            var pwd = req.body.pwd;
            db.task(t => {
                return t.one('SELECT * FROM users WHERE login = $1', user);
            }).then(result => {
                bcrypt.compare(pwd,result.password, (err,correct) =>
                {
                    if(!correct) 
                    {
                        res.render('login', { message : 'Incorrect username or password' });
                    } else {
                        res.cookie('user', result.login + '&' + result.username + '&' + pwd + '&' + result.wins + '&' + result.losses + '&' + result.draws, {signed : true});
                        res.redirect('/');
                    }
                });
            }).catch(err => {
                console.error('cos', err)
                res.render('login', { message : 'Incorrect username or password' })
            });
        });

        app.post('/newaccount', (req, res) => {
            var user = req.body.username;
            var pwd = req.body.pwd;
            var pwd2 = req.body.pwd2;
            db.one('SELECT * FROM users WHERE login = $1', user)
                .then(res => {
                    res.render('newaccount', {message : 'User with this login already exists.'});
                }).catch(err => {
                    if(allowedUsername(user) && pwd==pwd2 && pwd.length >= 8 && pwd.length <= 20)
                    {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(pwd, salt, (err, hash) => {
                                db.none('INSERT INTO users(login, username, password, wins, losses, draws) VALUES($1, $2, $3, 0, 0, 0)', [user, user, hash])
                                    .then(() => {
                                        res.redirect('/login');
                                    }).catch(err => {
                                        console.error(err);
                                        res.render('newaccount', {message : 'Creating account failed'});
                                    });
                            });
                        });          
                    } else {
                        if(pwd === pwd2){
                            res.render('newaccount', {message : 'Username has to have between 6 and 20 characters, only letters and numbers'});
                        }
                        else {
                            res.render('newaccount', {message : 'These passwords are different'});
                        }
                    }
                });
        });

        app.post('/anonymous', (req,res) => {
            if(allowedUsername(req.body.username))
            {
                var ident = ID();
                res.cookie('user', ident + '&' + req.body.username, {signed:true});
                res.redirect('/');
            } else {
                res.render('anonymous', {message :'Nickname should have from 6 to 20 symbols containing letters from english alphabet or numbers'})
            }
        });
    }
});