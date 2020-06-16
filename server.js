var express = require('express');
var cors = require('cors');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
//app.use(express.json());

var port = process.env.PORT || 8090;
var router = express.Router();

var mongo = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/newdb';

router.use(function (req, res, next) {
  // do logging
  // do authentication
  console.log('Logging of request url -> '+req.url);
  next(); // make sure we go to the next routes and don't stop here
})

router.route('/greet').get(function(req, res){
    res.send('Hello World');
})

router.route('/list').get(function(req,res) {
    var myArr = [];
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("newdb");
            var results = dbo.collection("products").find({}).toArray(function(err, result) {
                if (err) throw err;
                console.log('result', result);
                res.send(result);
                db.close();
            });

    });
})


router.route('/create').post(function(req,res) {
     console.log(req.body);
    //console.log(req.body);
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("newdb");
            var title = req.body[0].title;
            var price = req.body[0].price;
            var instock= req.body[0].instock;
            var photo= req.body[0].photo;
            dbo.collection("products").insertOne({title:title,price:price, instock:instock, photo:photo}, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
    });
})

router.route('/findbyprice').post(function(req, res){
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("newdb");
            var price = req.body[0].price;
            var results = dbo.collection("products").find({price:price}).toArray(function(err, result) {
                if (err) throw err;
                console.log('result', result);
                res.send(result);
                db.close();
            });
        });

})

router.route('/edit').put(function(req,res) {
    //console.log(req.body);

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("newdb");
        var title = req.body[0].title;
        var price= req.body[0].price;
        var instock= req.body[0].instock;
        var photo= req.body[0].photo;
        var myquery = { title: title };
        var newvalues = { $set: {price: price, instock: instock, photo: photo} };
        dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
})

router.route('/delete').delete(function(req, res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("newdb");
        var myquery = { title: req.body[0].title };
        dbo.collection("products").remove(myquery, function(err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            db.close();
        });
    });
})

/*router.route('/abc').get(function(req,res) {
    let product = {
      title: 'pen',
      price: 10
    };
    res.send(product);
})*/

router.route('/abc').post(function(req,res) {
    console.log(JSON.stringify(req.body));
    var title = req.body[0].title;
    console.log(title);
})

app.use(cors());
app.use('/api', router);
app.listen(port);
console.log('REST API is runnning at ' + port);


