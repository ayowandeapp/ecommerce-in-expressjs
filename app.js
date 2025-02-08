const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');

const { sequelize, User, Product } = require('./models')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { where } = require('sequelize');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next)=> {
    User.findOne({where : {id:1}})
    .then(user =>{
        req.user = user;
        next()

    })
    .catch(err=> console.log(err))
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

sequelize
    .sync({ alter: true }) // Use `force: true` only in development to reset DB
    .then(() => {
        console.log('Database synced successfully')
        return User.findOne({ where: { id: 1 } })
    }).then((user) => {
        if (!user) {
            user = User.create({ name: 'admin', email: 'email@test.com' })
        }
        return user
    }).then(user => {
        // console.log(user, 'user');

        app.listen(3000);
    })
    .catch((err) => console.log('Database sync failed:', err));


