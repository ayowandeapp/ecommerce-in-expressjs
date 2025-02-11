const { User } = require("../models");
const bcrypt = require('bcryptjs');
const sendMail = require('./../services/mailer')
const crypto = require('crypto');
const { where, Op } = require("sequelize");

exports.getLogin = async (req, res, next) => {

    let message = req.flash('error')
    message = message.length > 0 ? message.join('\n') : null;
   
    const oldInput = req.session.oldInput || {};
    req.session.oldInput = null;

    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMsg: message,
        oldInput: oldInput
    });
};

exports.postLogin = [ async (req, res, next) => {
    try {

        const { email, password } = req.body;

        let user = await User.findOne({ where: { email: email } })

        if (!user) {
            console.log('User not found');
            req.flash('error', 'Invalid credentials')
            return res.redirect('/login')
        }

        const matched = await bcrypt.compare(password, user.password)

        if (!matched) {
            console.log('Password incorrect');
            req.flash('error', 'Invalid credentials')
            return res.redirect('/login')
        }
        req.session.isAuthenticated = matched;
        req.session.user = user;

        await req.session.save();

        // console.log(req.session.isAuthenticated, matched, req.session.user, 'session')
        return res.redirect('/')
    } catch (error) {

        console.log(error, 'error')

        return res.redirect('/login');
    }
}];


exports.postLogout = async (req, res, next) => {
    req.session.destroy((err) => {
        res.redirect('/')
    })
};


exports.getSignup = async (req, res, next) => {

    let message = req.flash('error')
    message = message.length > 0 ? message.join('\n') : null;

    const oldInput = req.session.oldInput || {};
    req.session.oldInput = null;

    res.render('auth/signup', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: false,
        errorMsg: message,
        oldInput: oldInput
    });
};

exports.postSignup = async (req, res, next) => {

    try {

        const email = req.body.email
        const password = req.body.password
        const confirmPassword = req.body.confirmPassword

        if (!email || !password) {
            req.flash('error', 'Credentials required!')
            return res.redirect('/signup')
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.create({ email: email, name: ' ', password: hashedPassword })

        await sendMail(
            email,
            'Welcome to Our App!',
            'Thank you for signing up.',
            '<h1>Welcome to Our App!</h1><p>We are excited to have you. Kindly login with your email and password to continue.</p>'
        );
        return res.redirect('/login')
    } catch (error) {

    }
};

exports.getReset = (req, res, next) => {

    let message = req.flash('error')
    message = message.length > 0 ? message.join('\n') : null;

    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMsg: message
    })
}

exports.postReset = async (req, res, next) => {

    const { email } = req.body
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) return res.redirect('/reset')

        const token = buffer.toString('hex')

        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            req.flash('error', 'A user with the email does not exist!')
            return res.redirect('/reset')
        }

        await user.update(
            {
                resetToken: token,
                resetTokenExpiration: Date.now() + 3600000
            }
        )
        res.redirect("/")

        sendMail(
            user.email,
            'Reset Password',
            'Thank you for requesting to reset your pasword.',
            `
            <p>Kindly click the link to rest</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">Click to reset</a></p>
            `
        );
    })
}


exports.getNewPassword = async (req, res, next) => {

    const token = req.params.token
    const user = await User.findOne({
        where: {
            resetToken: token,
            resetTokenExpiration: { [Op.gt]: Date.now() }
        }
    })

    console.log(user, 'user')
    if (!user) {
        req.flash('error', 'Token Expired!')
        return res.redirect('/reset')
    }

    let message = req.flash('error')
    message = message.length > 0 ? message.join('\n') : null;

    res.render('auth/new-password', {
        path: '/new-password',
        pageTitle: 'New Password',
        errorMsg: message,
        userId: user.id,
        passwordToken: token
    })
}

exports.postNewPassword = async (req, res, next) => {

    try {

        const { password, userId, passwordToken } = req.body

        if (!userId || !password || !passwordToken) {
            req.flash('error', 'Credentials required!')
            return res.redirect('/reset')
        }

        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() },
                id: userId
            }
        })

        if (!user) {
            req.flash('error', 'Token expired!');
            return res.redirect('/reset')
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await user.update(
            { 
                password: hashedPassword, 
                resetToken: null, 
                resetTokenExpiration: null 
            }
        );

        req.flash('success', 'Password updated successfully! Please log in.');
        return res.redirect('/login');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Something went wrong. Please try again.');
        return res.redirect('/reset');

    }
};
