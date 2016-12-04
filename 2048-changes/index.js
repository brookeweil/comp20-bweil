//
// NOTE: this file was borrowed and adapted from Prof. Ming Chow's example
// at https://github.com/tuftsdev/WebProgramming/blob/gh-pages/examples/nodejs/nodemongoapp/server.js
//

// Initialization
var express = require('express');

var bodyParser = require('body-parser'); // Required if we need to use HTTP query or post parameters
var validator = require('validator'); // See documentation at https://github.com/chriso/validator.js
var app = express();
// See https://stackoverflow.com/questions/5710358/how-to-get-post-query-in-express-node-js
app.use(bodyParser.json());
// See https://stackoverflow.com/questions/25471856/express-throws-error-as-body-parser-deprecated-undefined-extended
app.use(bodyParser.urlencoded({ extended: true })); // Required if we need to use HTTP query or post parameters

// Mongo initialization and connect to database
// process.env.MONGOLAB_URI is the environment variable on Heroku for the MongoLab add-on
// process.env.MONGOHQ_URL is the environment variable on Heroku for the MongoHQ add-on
// If environment variables not found, fall back to mongodb://localhost/nodemongoexample
// nodemongoexample is the name of the database
var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodemongoexample';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

// Serve static content
app.use(express.static(__dirname + '/public'));

app.get('/submit.json', function(rq, rs) {
	rs.send('hi! this is where you can POST scores');
});

app.post('/submit.json', function(request, response) {

	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");

	var usr = request.body.username;
	var scr = request.body.score;
	var grd = request.body.grid;
	var stp = new Date();
	stp = stp.toUTCString();

	if (usr == undefined || scr == undefined || grd == undefined) {
		response.send(200);
	}

	var toInsert = {
		"username": usr,
		"score": scr,
		"grid": grd,
		"created_at": stp
	};

	db.collection('scores', function(error, coll) {
		coll.insert(toInsert, function(error, saved) {
			if (error) {
				console.log("Error: " + error);
				response.send(500);
			}
			else {
				response.send(200);
			}
	    });
	});
});

app.get('/scores.json', function(request, response) {
	response.set('Content-Type', 'application/json');

	var toReturn = [];
	var sortedScores = [];
	var id = request.query.username;

	if (request.query.username != undefined ){

		db.collection('scores', function(er, collection) {
			collection.find().toArray(function(err, cursor) {
				if (!err) {

					// Collect scores for user
					for (var count = 0; count < cursor.length; count++) {
						if(cursor[count].username == id){
							toReturn.push(cursor[count]);
						} 
					}

					// Sort scores for user from toReturn into sortedScores
					for (var j = 0; j < toReturn.length; j++) {
						var inserted = false;
						for (var i = 0; i < sortedScores.length; i++) {
							if (toReturn[j].score > sortedScores[i].score) {
								sortedScores.splice(i, 0, toReturn[j]);
								inserted = true;
								break;
							}
						}
						if (inserted == false) {
								sortedScores.push(toReturn[j]);
						}
					}
					response.send(JSON.stringify(sortedScores));
				} else {
					response.send('<!DOCTYPE HTML><html><head><title>2048 Scores?</title></head><body><h1>Whoops, something went terribly wrong!</h1></body></html>');
				}
			});
		});
	}
	else {
		response.send("Oops! Enter 'username' as your query string");
	}

});

app.get('/', function(request, response) {
	response.set('Content-Type', 'text/html');
	var indexPage = '';
	var sortedScores = [];


	db.collection('scores', function(er, collection) {
		collection.find().toArray(function(err, cursor) {
			if (!err) {
				indexPage += "<!DOCTYPE HTML><html><head><title>2048 Scores</title></head><body><h1>2048 Leaderboards!</h1>";
				
				// Sort scores into new array
				for (var count = 0; count < cursor.length; count++) {
					
					var inserted = false;
					for (var i = 0; i < sortedScores.length; i++) {
						if (cursor[count].score > sortedScores[i].score) {
							sortedScores.splice(i, 0, cursor[count]);
							inserted = true;
							break;
						}
					}
					if (inserted == false) {
							sortedScores.push(cursor[count]);
					}
				}


				// Build scores page
				indexPage += "<table style='width:50%'> <tr> <th>User</th> <th>Score</th> <th>On</th> </tr> ";

				// Create scores table row by row		  
				for (var j = 0; j < sortedScores.length; j++) {

				  indexPage += "<tr>";
				  indexPage +=  "<td>" + sortedScores[j].username + "</td>";
				  indexPage +=  "<td>" + sortedScores[j].score + "</td>";
				  indexPage +=  "<td>" + sortedScores[j].created_at + "</td>";
				  indexPage += "</tr>";
				}
				indexPage += "</table></body></html>"
				response.send(indexPage);

			} else {
				response.send('<!DOCTYPE HTML><html><head><title>2048 Scores?</title></head><body><h1>Whoops, something went terribly wrong!</h1></body></html>');
			}
		});
	});
});

// Oh joy! http://stackoverflow.com/questions/15693192/heroku-node-js-error-web-process-failed-to-bind-to-port-within-60-seconds-of
app.listen(process.env.PORT || 3000);