//express framework
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

var bodyParser = require('body-parser');

//database connection
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
// Use your own mlab account!!!
var mongourl = "mongodb+srv://rockie2695:26762714Rockie@cluster-test-cw81o.gcp.mongodb.net/test?retryWrites=true";
const mongoConectClient = new MongoClient(mongourl, {
    useNewUrlParser: true
});

var cors = require('cors')

app.use(cors()) // Use this after the variable declaration
app.use(bodyParser.json());
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
    if (port == 8080) {
        /*(async () => {
            // Specify app arguments
            await open('http://localhost:' + port, {
                app: "chrome"
            });
        })();*/
    }
});

app.post("/insert/:collection", function (req, res) {
    if (!req.body) {
        res.send({ "error": "No input!" });
        return;
    } else {
        req.body.blood = 0
        req.body.lv = 0
        req.body.mana = 0
        req.body.phy = 0
        req.body.soul = 0
        req.body.magic = 0
        req.body.time = Date.now()
        console.log(req.body)
        mongoConectClient.connect(err => {
            if (err) {
                console.log(err)
                res.send({ "error": err });
                return;
            } else {
                let collection = mongoConectClient.db("rockie2695_mongodb").collection("fun_" + req.params.collection);
                insert(collection,
                    req.body
                    , function (err, result) {
                        if (err) {
                            res.send({ "error": err });
                            return;
                        } else {
                            let sendValue = result.ops[0]
                            sendValue._id = ObjectId(sendValue._id).toString()
                            res.send({ "ok": sendValue });
                            return;
                        }
                    }
                )
            }
        })
    }
});
app.post("/delete/:collection", function (req, res) {
    if (!req.body) {
        res.send({ "error": "No input!" });
        return;
    } else {
        mongoConectClient.connect(err => {
            if (err) {
                console.log(err)
                res.send({ "error": err });
            } else {
                let collection = mongoConectClient.db("rockie2695_mongodb").collection("fun_" + req.params.collection);
                let sendValue=req.body
                sendValue._id = ObjectId(sendValue._id)
                deleteRecord(collection,
                    sendValue
                    , function (err, result) {
                        if (err) {
                            res.send({ "error": err });
                            return;
                        } else {
                            let sendValue = result.deletedCount
                            res.send({ "ok": sendValue });
                            return;
                        }
                    }
                )
            }


        })
    }
});
function insert(collection, query, callback) {
    collection.insertOne(query, function (err, result) {
        callback(err, result);
    });
}
function deleteRecord(collection, query, callback) {
    collection.deleteOne(query, function (err, result) {
        callback(err, result);
    });
}