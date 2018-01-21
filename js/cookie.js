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


module.exports = ({
    authorize : function (req,res,next) {
        if ( req.cookies.user ) {
            var usr = req.cookies.user.split('&');
            req.user = {
                login : usr[0],
                username : usr[1],
                password : usr[2],
                wins : usr[3],
                losses : usr[4],
                draws : usr[5]
            } 
            next();
        } else {
            res.redirect( '/login'); 
        }
    },
    init : function(io, app) {
        function allowedUsername(name, pwd, pwd2) {
            var allowedSigns = 'qwertyuiopasdfghjklzxcvbnm1234567890'
            if(pwd != pwd2 || name.length > 20 || name.length < 6){
                return false
            }
            var isallowed = true;
            for(var i = 0; i < name.length; i++)
            {
                //if()
            }
            return true 
        };
        app.get('/login', (req,res) => {
            res.render('login', {message : ''});
        });
        
        app.get('/newaccount', (req,res) => {
            res.render('newaccount', {message : ''});
        });

        app.post('/login', (req, res) => {
            var user = req.body.username;
            var pwd = req.body.pwd;
            db.task(t => {
                return t.one('SELECT * FROM users WHERE login = $1', user);
            }).then(result => {
                if(result.password != pwd) 
                {
                    res.render('login', { message : 'Incorrect username or password' });
                } else {
                    res.cookie('user', result.login + '&' + result.username + '&' + result.password + '&' + result.wins + '&' + result.losses + '&' + result.draws);
                    res.redirect('/');
                }
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
                    user = '#';
                }).catch(err => {
                    if(allowedUsername(user, pwd, pwd2))
                    {
                        db.none('INSERT INTO users(login, username, password, wins, losses, draws) VALUES($1, $2, $3, 0, 0, 0)', [user, user, pwd])
                            .then(() => {
                                res.redirect('/login');
                            }).catch(err => {
                                console.error(err);
                                res.render('newaccount', {message : 'Creating account failed'});
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
    }
});