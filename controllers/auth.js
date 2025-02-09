const { User } = require("../models");

exports.getLogin = async (req, res, next) => {

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postLogin = async (req, res, next) => {
    let user = await User.findOne({ where: { id: 1 } })

    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save(function (err) {
        if (err) return next(err)
        console.log(req.session.isLoggedin, 'session')
        res.redirect('/')
    })
};


exports.postLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/')
    })
};


exports.getSignup = async (req, res, next) => {

    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false
    });
};

exports.postSignup = async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword

    const user = await User.findOne({where: {email: email}})

    if(!!user){
        // throw new Error("A user with the email already exist!");
        res.redirect('/signup')        
    }
    await User.create({email: email,name:' '})
    res.redirect('/login')  
};