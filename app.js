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
// const { where } = require('sequelize');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//initialize session middleware
// app.set('trust proxy', 1) // trust first proxy

// 🔹 MySQL session store configuration
const sessionStore = new MySQLStore({
    host: 'localhost', // Change if needed
    port: 3306,
    user: 'root',
    password: '',
    database: 'node_app',
    clearExpired: true, // Automatically removes expired sessions
    checkExpirationInterval: 900000, // How often expired sessions are checked (15 minutes)
    expiration: 86400000, // Session valid for 1 day
});

// Initialize session middleware with MySQL store
app.use(session({
    secret: 'your_secret_key', // Change to a strong secret
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Use MySQL session store
    cookie: {
        maxAge: 86400000, // 1 day
        httpOnly: true,
    }
}));
// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
    // MySQL session store ready for use.
    console.log('MySQLStore ready');
}).catch(error => {
    // Something went wrong.
    console.error(error);
});
app.use(lusca.csrf());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use(flash());
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
        
    }
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

sequelize
    .sync({}) // Use `force: true` only in development to reset DB
    .then(() => {
        console.log('Database synced successfully')
    }).then(() => {
        // console.log(user, 'user');

        app.listen(3000);
    })
    .catch((err) => console.log('Database sync failed:', err));


