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
	checkurl(res)

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

		callback("test");
	});
}

function checkurl(res) {
	if (url.length > 0) {
		var singleUrl = url.shift();
		console.log("url: " + singleUrl);
		if (historyUrl.indexOf(singleUrl) < 0) {
			request({
				uri: singleUrl,
				encoding: null,
				headers: {
					'cache-control': 'no-cache',
					'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
				}
			}, function (error, response, html) {
				if (!error && response.statusCode === 200) {
					//console.log(html)
					//html= iconv.decode(new Buffer.from(html), "ISO-8859-1");
					//console.log(html)
					//console.log("Status code: " + response.statusCode);
					var $ = cheerio.load(html);
					var title = $('title').text().replace(/\s\s+/g, ' ').replace(/(\r\n|\n|\r)/gm, "").replace(/\u2013|\u2014/g, "-");;
					console.log(title)
					if (title !== "") {
						MongoClient.connect(mongourl, function (err, db) {
							if (err) {
								console.log(err)
							} else {
								insert(db, singleUrl, title, function () {
									db.close();
								})
							}

						})
					}
					historyUrl.push(singleUrl)
					collectInternalLinks($, singleUrl)
				} else {
					//console.log(response.statusCode, singleUrl, error) //res.status(response.statusCode).end(error);
				}
				console.log(url.length)
				checkurl(res)
				if (url.length <= 0) {
					//res.send('Check your console!')
				}
			});
		} else {
			console.log("repeat by history")
			checkurl(res)
			if (url.length <= 0) {
				//res.send('Check your console!')
			}
		}
	} else {
		res.send('ok')
	}
}

function collectInternalLinks($, singleUrl) {
	//var allRelativeLinks = [];
	//var allAbsoluteLinks = [];

	var relativeLinks = $("a[href^='/']");
	relativeLinks.each(function () {
		var urlObject = new URL(singleUrl)
		var fullUrl = urlObject.protocol + '//' + urlObject.hostname + $(this).attr('href')
		console.log(fullUrl)
		if (url.indexOf(fullUrl) < 0 && historyUrl.indexOf(fullUrl) < 0 && fullUrl !== singleUrl) {
			url /*allRelativeLinks*/ .push(fullUrl);
		}
	});

	var absoluteLinks = $("a[href^='http']");
	absoluteLinks.each(function () {
		console.log($(this).attr('href'))
		var fullUrl=$(this).attr('href')
		if (url.indexOf(fullUrl) < 0 && historyUrl.indexOf(fullUrl) < 0 && fullUrl !== singleUrl) {
			url.push($(this).attr('href'));
		}
	});

	//console.log("Found " + allRelativeLinks.length + " relative links");
	//console.log("Found " + allAbsoluteLinks.length + " absolute links");
}