/**
* 
* @param {http.IncomingMessage} req 
* @param {http.ServerResponse}  res 
* @param {*} next 
*/

const cookieParser = require('cookie-parser');

module.exports = ({
    authorize : function (req,res,next) {
        if ( req.cookies.user ) {
            req.user = req.cookies.user; 
            next();
        } else {
            res.redirect( '/login'); 
        }
    },
    init : function(io, app) {
        function checkPwd(name,pwd) {
            return true;
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
            if(checkPwd(user,pwd)) {
                res.cookie('user', user);
                res.redirect('/');
            } else {
                res.render('login', { message : 'Incorrect username or password' });
            }
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