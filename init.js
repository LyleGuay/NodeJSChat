// Call this script from node to setup the DB.
var mysql = require("mysql");

connection = mysql.createConnection({
    user: "admin",
    password: "admin"
});

connection.connect(function(error) {
    if(error) {
        console.log(error);
        throw error;
    }
    console.log("Connected to DB");

    createDB();
});

function createDB() {
    connection.query("CREATE DATABASE db", function(error, result) {
        if(error) {
            throw error;
        }
        console.log("DB created");

        createTableUsers();
        createTableChat();
    });
}

function createTableUsers() {
    var createSQL = "CREATE TABLE db.users (id INT AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), PRIMARY KEY(id))";

    connection.query(createSQL, function(error, result) {
        if(error) {
            throw error;
        }
        console.log("Table created.");
    });
}

function createTableChat() {
    var createSQL = "CREATE TABLE db.chat (username VARCHAR(255), message VARCHAR(255))";

    connection.query(createSQL, function(error, result) {
        if(error) {
            throw error;
        }
        console.log("Table created.");
    });
}