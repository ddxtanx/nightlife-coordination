var express = require('express'),
    bodyParser = require('body-parser'),
    bars = require('./app/bars.js'),
    session = require('client-sessions');
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
    res.render("twig/index.twig");
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
    var adding =  req.body.adding;
    console.log("Somebody is going to "+barName+" adding is "+adding);
    if(adding=="true"){
        bars.add(barName, req, res);
    } else{
        bars.addTo(barName, req, res);
    }
})
app.listen(process.env.PORT || 8080)