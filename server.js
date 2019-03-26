const express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');
const app = express();
const port = process.env.PORT || 8080;
//var url = ["http://www.arstechnica.com"];
var url = ["http://yahoo.com.hk"]
var historyUrl = [];
var iconv = require('iconv-lite');

//database connection
var MongoClient = require('mongodb').MongoClient;
var mongodb = require('mongodb');
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
// Use your own mlab account!!!
var mongourl = 'mongodb://rockie2695:26762714Rockie@ds057816.mlab.com:57816/rockie2695_mongodb';

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get('/express_backend', (req, res) => {
	res.send({
		express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT'
	});
});

app.get('/scrape', function (req, res) {
	/*for outputfile	url = 'http://www.imdb.com/title/tt1229340/';*/
	//checkurl()
})

app.get('/', (req, res) => {
	res.send({
		express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT'
	});
});

app.get(/.*/, function (req, res) {
	res.status(404).end(req + ',' + res + ' Not Supported');
});

function insert(db, singleUrl, title, callback) {
	db.db().collection('testUrl').insertOne({
		"url": singleUrl,
		"title": title
	}, function (err, result) {
		callback(err);
	});
}

function checkurl() {
	if (url.length > 0) {
		var singleUrl = url.shift();
		if (historyUrl.indexOf(singleUrl) < 0) {
			console.log("ask: " + singleUrl);
			request({
				uri: singleUrl,
				encoding: null,
				headers: {
					'cache-control': 'no-cache',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
				}
			}, function (error, response, html) {
				if (!error && response.statusCode === 200) {
					var $ = cheerio.load(html);
					var title = $('title').text().replace(/\s\s+/g, ' ').replace(/(\r\n|\n|\r)/gm, "").replace(/\u2013|\u2014/g, "-");;
					console.log('title: ' + title)
					if (title !== "") {
						MongoClient.connect(mongourl, {
							useNewUrlParser: true
						}, function (err, db) {
							if (err) {
								console.log(err)
							} else {
								insert(db, singleUrl, title, function (err) {
									if (err) {
										console.log(err)
									}
									db.close();
								})
							}
						})
					}
					historyUrl.push(singleUrl)
					collectInternalLinks($, singleUrl)
				} else {
					console.log(response, singleUrl, error) //res.status(response.statusCode).end(error);
				}
			});
		} else {
			console.log("repeat by history")
		}
	} else {
		//res.send('ok')
	}
}

function collectInternalLinks($, singleUrl) {
	//var allRelativeLinks = [];
	//var allAbsoluteLinks = [];

	var relativeLinks = $("a[href^='/']");
	relativeLinks.each(function () {
		var urlObject = new URL(singleUrl)
		var fullUrl = urlObject.protocol + '//' + urlObject.hostname + encodeURIComponent($(this).attr('href'))
		if (url.indexOf(fullUrl) < 0 && historyUrl.indexOf(fullUrl) < 0 && fullUrl !== singleUrl) {
			url.push(fullUrl);
		}
	});

	var absoluteLinks = $("a[href^='http']");
	absoluteLinks.each(function () {
		var fullUrl = $(this).attr('href')
		if (url.indexOf(fullUrl) < 0 && historyUrl.indexOf(fullUrl) < 0 && fullUrl !== singleUrl) {
			url.push($(this).attr('href'));
		}
	});
}

var cronJob = require("cron").CronJob;
new cronJob('*/5 * * * * *', function () {
	checkurl()
}, null, true, 'Asia/Hong_Kong');