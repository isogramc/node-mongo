var fs = require('fs');
var express = require('express');
var cors = require('cors');
var mime = require('mime');

var path = require('path');

var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.use(bodyParser.json({limit: '50mb', extended: true}));
//app.use(express.json());

var port = process.env.PORT || 8090;
var router = express.Router();

var mongo = require('mongodb')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/productso";

var upload = require('./photos');

router.use(function (req, res, next) {
    // do logging
    // do authentication
    console.log('Logging of request url -> '+req.url);
    next(); // make sure we go to the next routes and don't stop here
})

router.route('/greet').get(function(req, res){
    res.send('Hello World');
})

router.route('/addImage').post(upload.single("photo"),
    function(req, res) {
        let imageUrl = {
            imageUrl: req.file.filename,
        };
        res.send(imageUrl);
})


/*router.route('/images').get(function (req, res) {
    filePath = __dirname + "/public/1592689643772-partytime1_001.jpg";
    file = "1592689643772-partytime1_001.jpg";
    console.log(filePath, file);
    fs.exists(filePath, function(exists){
        if (exists) {
            res.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition" : "attachment; filename=" + file});
            fs.createReadStream(filePath + file).pipe(res);
        } else {
            res.writeHead(400, {"Content-Type": "text/plain"});
            res.end("ERROR File does NOT Exists.ipa");
        }
    });
})*/

router.route('/list').get(function(req,res) {
    try{
        MongoClient.connect(url,
            function(err, db) {
                if (err) throw err;
                console.log("Database connected!");
                var dbo = db.db("productso");
                var results = dbo.collection("products").find({}).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    res.send(result);
                    db.close();
                });
                var count = dbo.collection("products").find({}).count(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    db.close();
                });
            });
    }catch(err){
        console.log(err);
    }

})

router.route('/create').post(function(req,res) {
    console.log(req.body);
    MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var dbo = db.db("productso");
            var title = req.body[0].title;
            var price = req.body[0].price;
            var stockamount = req.body[0].stockamount;
            var instock = "false";
            if(parseInt(stockamount)>0){
                instock = "true";
            }
            var photo = req.body[0].photo;
            var photoUrl = req.body[0].imageUrl;
            //var code = req.body[0].productCode;
            var guid = (title.substr(0,3).toUpperCase()) + (Math.random()*100000).toString().substr(0,3);
            var rating = req.body[0].rating;
            var description = req.body[0].description;
            console.log(instock);
            dbo.collection("products").insertOne({productCode: guid, rating: rating, description: description, title:title, price:price, stockamount: stockamount, instock: instock, photo:photo, photoUrl: photoUrl}, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                db.close();
            });
        });
})

router.route('/findbyprice').post(function(req, res){
    console.log(req.body);
    try {
        MongoClient.connect(url,
        function(err, db) {
            if (err) throw err;
            console.log("Database connected!");
            var price = req.body[0].price;
            var dbo = db.db("productso");
            var results = dbo.collection("products").find({ price: new RegExp(price, 'i')}).toArray(function(err, result) {
                if (err) throw err;
                res.send(result);
                db.close();
            })

        });
    }catch(err){
        console.log(err);
    }
})

router.route('/findbyid').post(function(req, res){
    try{
        console.log(req.body[0].id);
        MongoClient.connect(url,
            function(err, db) {
                if (err) throw err;
                console.log("Database connected!");
                var id = req.body[0].id;
                var dbo = db.db("productso");
                var results = dbo.collection("products").find({ productCode: id}).toArray(function(err, result) {
                    if (err) throw err;
                    console.log(result);
                    res.send(result);
                    db.close();
                })
            });

    }catch(err){
        console.log(err);
    }
})

router.route('/edit').post(function(req, res) {
    console.log(req.body);
    try{
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("productso");
        var id = req.body[0]._id;
        console.log(id);
        var title = req.body[0].title;
        var price= req.body[0].price;
        var stockamount = req.body[0].stockamount;
        var instock= req.body[0].instock;
        var photo= req.body[0].photo;
        var rating = req.body[0].rating;
        var description = req.body[0].description;
        var photoUrl = req.body[0].photoUrl;
        var myquery = {_id: new mongo.ObjectID(id)};
        var newvalues = { $set : {rating: rating, description: description, title:title, price:price, stockamount: stockamount, instock: instock, photo:photo, photoUrl: photoUrl}};
        dbo.collection("products").findOneAndUpdate(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
        });
    });
    }catch(err){
        console.log(err);
    }

})

router.route('/delete/:id').delete(function(req, res){
    try {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            var dbo = db.db("productso");
            var id = req.url.split('/');
            var myobj = id[2].toString();
            dbo.collection("products").deleteOne({_id: new mongo.ObjectID(myobj)}, function(err, results) {
                if (err){console.log("failed");throw err;}
                console.log("1 document deleted");
                res.send("1 document(s) deleted");
                db.close();
            });
        });
    }catch(e){
        console.log(e);
    }
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
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'x-www-form-urlencoded, Origin, X-Requested-With, Content-Type, Accept, Authorization, *');
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Credentials', true);
        return res.status(200).json({});
    }
    req.setTimeout(3600000);
    if (req.method === 'OPTIONS') {
        res.write(':)');
        res.end();
    } else next();
});
app.use('/api', router);
app.listen(port);
console.log('REST API is runnning at ' + port);

/*[{"productCode": "ABC123", "title": "No onion", "rating": "4.5", "description": "A great product", "price": "555", instock: "true", "photo": "null"}]*/
