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
        function checkPwd(login, pwd, logging)
        {
            db.task(t => {
                return t.one('SELECT * FROM users WHERE login = $1', login);
            }).then(result => {
                console.log(result);
                if(result.password != pwd) 
                {
                    logging = {value : false, user : ''};
                } else {
                    console.log('noice');
                    logging = {value : true, user : result.login + '&' + result.username + '&' + result.password + '&' + result.wins + '&' + result.losses + '&' + result.draws};
                }
            }).catch(err => {
                console.error('', err)
                logging = {value : false, user : ''};
            });
        };
        function allowedUsername(name, pwd, pwd2) {
            if(pwd != pwd2){
                return false
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
                console.log(result);
                if(result.password != pwd) 
                {
                    res.render('login', { message : 'Incorrect username or password' });
                } else {
                    console.log('noice');
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
            if(allowedUsername(user, pwd, pwd2))
            {
                res.redirect('/login');
            } else {
                if(pwd === pwd2){
                    res.redirect('/newacc', {message : 'Username unallowed'});
                }
                else {
                    res.redirect('/newacc', {message : 'These passwords are different'});
                }
            }
        });
    }
});