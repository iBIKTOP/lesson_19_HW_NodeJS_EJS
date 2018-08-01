var fs = require('fs');
var express = require('express');
var app = express();
var db = require('./db.json');
var bodyParser = require('body-parser');
var striptags = require('striptags');
var nodemailer = require('nodemailer');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));//через express.static мы подключаем стили, точнее даем возможность клиенту подкючить и использовать стили в этой папке
// app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));//так же само даем клиенту возможность подключить стили бутстрапа.

function getDate() {
    var d = new Date();
    var options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    };
    return d.toLocaleString("ua", options);
};

app.get('/', function (req, res) {
    res.render('index', {objData: db});
});

app.post('/add', function (req, res) {
    var obj = {
        id: getDate(),
        name: striptags(req.body.message)
    };
    db.push(obj);
    fs.writeFile('db.json', JSON.stringify(db), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.redirect('/');
});

app.get('/delete/:id', function (req, res) {
    db = db.filter(function (d) {
        // return d.id !== parseInt(req.params.id);
        return d.id !== req.params.id;
    });
    console.log(db);
    fs.writeFile('db.json', JSON.stringify(db), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    res.redirect('/');
});

app.get('/about', function (req, res) {
    res.render('about');
});

app.get('/contact', function (req, res) {
    res.render('contact');
});

app.post('/contact', function (req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'my@gmail.com',
            pass: 'mypass'
            //https://myaccount.google.com/lesssecureapps
            //тут необходимо разрешить доступ непроверенным приложениям
            //иначе Гугл блокирует отправку писем
        }
    });

    var mailOptions = {
        from: 'my@gmail.com',
        to: 'friend@gmail.com',
        subject: 'Sending Email using Node.js',
        text: req.body.text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.render('contact');
});

app.listen(3000, function () {
    console.log('Server started at localhost:3000');
});