var https = require("https"),
    yelp = require('yelp-fusion'),
    mongo = require('mongodb').MongoClient;
var user = process.env.USER;
var password = process.env.PASSWORD;
var mongoUri = "mongodb://"+user+":"+password+"@ds049496.mlab.com:49496/bars";
console.log(mongoUri);
var clientId = process.env.ID;
var clientSecret = process.env.SECRET;
function getBars(location, req, res){
    var barsData = {
        term: 'bar',
        location: location,
        limit: 20,
        open_now: true,
        categories: "bars"
    };
    yelp.accessToken(clientId, clientSecret).then(response => {
       var client = yelp.client(response.jsonBody.access_token);
       
       client.search(barsData).then(response =>{
           var results = response.jsonBody.businesses;
           var prettyResults = JSON.stringify(results).toString();
           res.writeHead(200, {'Content-Type': 'text/json'});
           res.end(prettyResults);
       })
    }).catch(e =>{
        console.log(e);
    })
}
function getPeople(name, req, res){
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var bars = db.collection('bars');
        bars.find({
            name: name
        }).toArray(function(err, data){
            if(err) throw err;
            if(data.length==0){
                res.writeHead(200, {'Content-Type':'text/json'});
                var object = {
                    name: name,
                    numPeopleGoing: 0,
                    peopleGoing: []
                }
                res.end(JSON.stringify(object));
            }else{
                data = data[0];
                res.writeHead(200, {'Content-Type': 'text/json'})
                db.close();
                res.end(JSON.stringify(data));
            }
        })
    })
}
function handleRequest(name, increment, req, res){
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var bars = db.collection('bars');
        bars.find({
            name: name
        }).toArray(function(err, data){
            if(err) throw err;
            if(data.length==0){
                add(name, req, res);
            } else{
                addTo(name, increment, req, res);
            }
        });
    });
}
function add(name, req, res){
    var userName = req.session.name;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var bars = db.collection('bars');
        var data = {
            name: name,
            numPeopleGoing: 1,
            peopleGoing: [userName]
        };
        bars.insert(data, function(err, data){
            if(err) throw err;
            console.log("insert success"+ JSON.stringify(data));
            res.writeHead(200, {'Content-Type': 'text/json'});
            db.close();
            res.end(JSON.stringify(data));
        });
    });
}
function addTo(name, increment, req, res){
    var userName = req.session.name;
    mongo.connect(mongoUri, function(err, db){
        if(err) throw err;
        var bars = db.collection('bars');
        var updateObject;
        if(increment==1){
            updateObject= {
                $inc: {
                    numPeopleGoing: increment
                },
                $push: {
                    peopleGoing: userName
                }
            };
        }else{
            updateObject= {
                $inc: {
                    numPeopleGoing: increment
                },
                $pull: {
                    peopleGoing: userName
                }
            };
        }
        bars.update({
            name:name
        },updateObject, function(err, data){
            if(err) throw err;
            console.log(JSON.stringify(data));
            res.writeHead(200, {'Content-Type': 'text/json'});
            db.close();
            res.end(JSON.stringify(data));
        });
    });
}

module.exports.getBars = getBars;
module.exports.getPeople = getPeople;
module.exports.add = add;
module.exports.addTo = addTo;
module.exports.handleRequest = handleRequest;