var express = require('express');
var app = express();
var user = process.env.USER
var password = process.env.PASSWORD

app.set('views', './public');
app.use(express.static('./public'));

app.get("/", function(req, res){
    res.render("twig/index.twig");
});
app.listen(process.env.PORT || 8080)