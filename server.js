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

var url = "mongodb://localhost:27017/productsdb";

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
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("productsdb");
            var results = dbo.collection("products").find({}).toArray(function(err, result) {
                if (err) throw err;
                console.log('result', result);
                res.send(result);
                db.close();
            });
        });
})


router.route('/create').post(function(req,res) {
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("productsdb");
            var title = req.body[0].title;
            var price = req.body[0].price;
            var instock= req.body[0].instock;
            var photo = req.body[0].photo;
            var code = req.body[0].productCode;
            var rating = req.body[0].rating;
            var description = req.body[0].description;
            dbo.collection("products").insertOne({productCode: code, rating: rating, description: description, title:title, price:price, instock:instock, photo:photo}, function(err, res) {
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
            var dbo = db.db("productsdb");
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
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("productsdb");
        var title = req.body[0].title;
        var price= req.body[0].price;
        var instock= req.body[0].instock;
        var photo= req.body[0].photo;
        var code = req.body[0].productCode;
        var rating = req.body[0].rating;
        var description = req.body[0].description;
        var myquery = { productCode: code };
        var newvalues = { $set: {title: title, rating: rating, description: description, price: price, instock: instock, photo: photo} };
        dbo.collection("products").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
})

router.route('/delete').delete(function(req, res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("productsdb");
        var code = req.body[0].productCode;
        //var title = req.body[0].title;
        //var myquery = { title: title };
        var myquery = { productCode: productCode };
        dbo.collection("products").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log(obj.result.n + " document(s) deleted");
            db.close();
        });
    });
})

router.route('/abcd').get(function(req,res) {
    let product = {
      title: 'pen',
      price: 10
    };
    res.send(product);
})

router.route('/abc').post(function(req,res) {
    console.log(JSON.stringify(req.body));
    var title = req.body[0].title;
    console.log(title);
})

app.use(cors());
app.use('/api', router);
app.listen(port);
console.log('REST API is runnning at ' + port);

/*[{"productCode": "ABC123", "title": "No onion", "rating": "4.5", "description": "A great product", "price": "555", instock: "true", "photo": "null"}]*/
