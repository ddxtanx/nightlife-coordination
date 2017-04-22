var express = require('express'),
    bodyParser = require('body-parser'),
    bars = require('./app/bars.js'),
    session = require('client-sessions'),
    acc = require('./app/account.js');
var app = express();
var user = process.env.USER
var password = process.env.PASSWORD

app.set('views', './public');
app.use(express.static('./public'), bodyParser(), session({
  cookieName: 'session',
  secret: process.env.SESSION_SECRET,
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.get("/", function(req, res){
    res.render("twig/index.twig", {loggedin: req.session.active, name: req.session.name});
});
app.post("/api/bars", function(req, res){
    var city = req.body.city;
    bars.getBars(city, req, res);
});
app.post("/api/people", function(req, res){
    var barName = req.body.name;
    console.log("handling people request for "+barName);
    bars.getPeople(barName, req, res);
});
app.post("/api/go", function(req, res){
    var barName = req.body.name;
    var increment = req.body.increment;
    increment = parseInt(increment);
    console.log("Somebody is going to "+barName);
    bars.handleRequest(barName, increment, req, res);
});
app.get("/register", function(req, res){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    res.render("twig/register.twig", {loggedin: false, name:false});
});
app.post("/register", function(req, res){
    acc.reg(req,res);
});
app.get("/login", function(req, res){
    if(req.session.active == undefined){
        req.session.reset();
        req.session.active = false;
    }
    if(req.session.active){
        console.log(req.session.active);
        res.render("twig/login.twig", {'loggedin': true, 'name':req.session.name});
    } else{
        res.render("twig/login.twig", {'loggedin': false});
    }
});
app.post("/login", function(req,res){
    acc.login(req,res);
});
app.get("/logout", function(req, res){
   req.session.reset();
   req.session.active = false;
   res.redirect("/");
   res.end();
});
app.listen(process.env.PORT || 8080)