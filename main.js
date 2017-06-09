var express = require("express");
var fs = require("fs");
var bodyParser = require('body-parser');
var mysql = require("mysql");
var session = require("express-session");

var app = express();

var connection = mysql.createConnection({
    user: "admin",
    password: "admin",
    database: "db"
});

connection.connect(function(error) {
    if(error) {
        console.log(error);
        throw error;
    }
    console.log("Connected!");

});

app.use(session({
    secret: 'secret'
}));

app.listen(5000);
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

function createHTMLHeader(headerText) {
    return "<!DOCTYPE html> <html> <head> " + headerText + "</head>";
}

function createHTMLBody(bodyText) {
    return " <body> " + bodyText + "</body> </html>";
}

function createHTMLDoc(title, bodyText) {
    header = "<meta charset=\"UTF-8\"> <title>" + title + "</title>";
    header = createHTMLHeader(header);

    return header + createHTMLBody(bodyText);
}

// Index is the root page, users login from here.
app.route("/index")
.get(function(request, response) {
    // Serve up the static index page with login form.
    fs.readFile("index.html", function(error, data) {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(data);
        response.end();
    });
});

// Login page attempts to login/create the user based on provided username/password.
// Success redirects to chat, failure redirects back to index.
app.route("/login")
.post(function(request, response) {
    var username = request.body.username;
    var password = request.body.password;

    if(request.body.login) {
        connection.query("SELECT * FROM users WHERE username = '" + username + "'", function(error, result) {
            if(result.length == 0) {
                response.redirect("/index");
            } else {
                request.session.userid = result[0].id;

                response.redirect("/chat");
            }
        });
    } else if(request.body.create) {
        insertSQL = "INSERT INTO users (username, password) VALUES ('" + username + "', '" + password + "')";

        connection.query(insertSQL, function(error, result) {
            if(result.affectedRows == 0) {
                response.redirect("/index");
            } else {
                request.session.userid = result.insertId;

                response.redirect("/chat");
            }
        });
    }
});

// Chat lists all chat messages and allows the user to enter new ones.
app.route("/chat")
.get(function(request, response) {
    putChatMessages(response);
})
.post(function(request, response) {
    var message = request.body.message;

    connection.query("SELECT username FROM users WHERE id = " + request.session.userid, function(error, result) {
        if(error) {
            throw error;
        }

        if(result.length == 1) {
            var username = result[0].username;
            var insertQuery = "INSERT INTO chat (username, message) VALUES ('" + username + "', '" + message + "')";
                
            connection.query(insertQuery, function(error, result) {
                putChatMessages(response);
            });
        }
    });
});

// Puts all chat messages to the response object.
function putChatMessages(response) {
    connection.query("SELECT * FROM chat", function(error, result) {
        var htmlBody = "Chat<br>";

        // Form for inputing new messages.
        htmlBody += "<form action = \"/chat\" method = \"post\">";
        htmlBody += "Message:<br>";
        htmlBody += "<input type = \"text\" name = \"message\"><br>";
        htmlBody += "<input type = \"submit\" value = \"Submit\">";
        htmlBody += "</form>"

        htmlBody += "Messages<br>"

        for(var i = 0; i < result.length; i++) {
            htmlBody += "" + result[i].username + ": " + result[i].message + "<br>";
        }

        var htmlText = createHTMLDoc("NodeJS", htmlBody);

        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(htmlText);
        response.end();
    });
}