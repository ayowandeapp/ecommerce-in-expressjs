const path = require('path');

const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session);
const express = require('express');
const bodyParser = require('body-parser');
const lusca = require('lusca');
const flash = require('connect-flash');

const errorController = require('./controllers/error');

const { sequelize, User, Product } = require('./models')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const upload = require('./middleware/file-upload');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(upload.single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//initialize session middleware

// MySQL session store configuration
const sessionStore = new MySQLStore({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'node_app',
    clearExpired: true,
    checkExpirationInterval: 900000,
    expiration: 86400000, // Session valid for 1 day
});

// Initialize session middleware with MySQL store
app.use(session({
    secret: 'your_secret_key',
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Use MySQL session store
    cookie: {
        maxAge: 86400000, // 1 day
        httpOnly: true,
    }
}));

sessionStore.onReady().then(() => {

    console.log('MySQLStore ready');
}).catch(error => {
    console.error(error);
});

app.use(flash());
// app.use((req, res, next) => {
//     console.log('Session:', req.session, res.locals.csrfToken);
//     next();
// });
app.use(lusca.csrf());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated || ''
    res.locals.csrfToken = req.csrfToken();
    next();
});


// app.use((req, res, next) => {
//     console.log('after Session:', req.session, res);
//     next();
// });

app.use(async (req, res, next) => {
    try {
        if (!req.session.user) {
            req.user = null;
            return next();
        }
        const user = await User.findByPk(req.session.user.id);

        if (!user) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    } catch (error) {
        throw new Error(error);
    }
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next)=>{
    res.status(505).render('error/505', { pageTitle: 'Server Error', path: '/505'});
})

sequelize
    .sync({}) // Use `force: true` only in development to reset DB
    .then(() => {
        console.log('Database synced successfully')
    }).then(() => {
        app.listen(3000);
    })
    .catch((err) => console.log('Database sync failed:', err));


