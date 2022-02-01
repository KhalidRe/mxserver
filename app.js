var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");
var cors = require("cors");
var path = require("path");
var fs = require("fs");
const { get } = require("express/lib/response");
var PORT = process.env.PORT || 3000;
const url = "http:flexnet.se/#";
const app = express();

const http = require("http").Server(app);

const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "PUT", "POST"],
  },
});

app.use(
  cors({
    origin: "*",
    methods: "GET,PUT,POST",
  })
);

var db = mysql.createConnection({
  multipleStatements: true,
  host: "db-mysql-lon1-29438-do-user-9795775-0.b.db.ondigitalocean.com",
  user: "doadmin",
  password: "2LXlPKZHwxmUAekt",
  port: "25060",
  database: "marinex",
  charset: "utf8mb4",
  ssl: {
    ca: fs.readFileSync("ca-certificate.crt"),
  },
});
db.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected");
});
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(bodyParser.json());
app.get("/createtableprojects", (req, res) => {
  let sql =
    "CREATE TABLE messages(id int AUTO_INCREMENT, time VARCHAR(255), user VARCHAR(255), text VARCHAR(255), icon VARCHAR(255), PRIMARY KEY(id))";

  db.query(sql, (err, result) => {
    if (err) throw err;

    res.send("Post table created.....");
  });
});
app.get("/addpost1", (req, res) => {
  let post = {
    Username: "MXphilip",
    Password: "kr3fG3(@X95{_>5;",
    Name: "Philip",
    Active: 0,
    Created: 0,
    Completion: 0,
    Profile: "Philip.jpeg",
  };
  let sql = "INSERT INTO users SET ?";
  let query = db.query(sql, post, (err, result) => {
    if (err) throw err;
  });
});
app.post("/loggedin", (req, res) => {
  let maker = {
    user: req.body.user,
  };
  let sql = `SELECT Username,Status FROM users WHERE Username = '${maker.user}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.get("/viewprojects", (req, res) => {
  let sql = "SELECT * FROM projects";
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.post("/myprojects", (req, res) => {
  let maker = {
    user: req.body.user,
  };
  let sql = `SELECT * FROM projects WHERE Author = (SELECT Name FROM users WHERE Username = '${maker.user}') OR Workers = (SELECT Name FROM users WHERE Username = '${maker.user}') `;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.get("/getusers", (req, res) => {
  let sql =
    "SELECT id,Name,Active,Created,Completion,Profile,Status FROM users";
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.post("/workernav", (req, res) => {
  let maker = {
    user: req.body.user,
  };
  let sql = `SELECT id,Username,Name,Active,Created,Completion,Profile,Status FROM users  WHERE Username = '${maker.user}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.post("/mytime", (req, res) => {
  let maker = {
    user: req.body.user,
  };
  let sql = `SELECT * FROM time  WHERE Username = '${maker.user}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});
app.post("/alltime", (req, res) => {
  let sql = `SELECT * FROM time `;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.json(result);
  });
});
app.post("/addtime", (req, res) => {
  let tid = {
    title: req.body.title,
    name: req.body.name,
    username: req.body.username,
    description: req.body.description.replace(/'/g, `"`),
    hours: req.body.hours,
    minutes: req.body.minutes,
  };
  let sql = `INSERT INTO time SET ?; `;
  let query = db.query(sql, tid, (err, result) => {
    if (err) throw err;
    console.log(result);
  });
});
app.post("/createproject", (req, res) => {
  let maker = {
    userid: req.body.userid,
  };
  let project = {
    title: req.body.title,
    author: req.body.author,
    workers: req.body.workers,
    date: req.body.date,
    deadline: req.body.deadline,
    completed: req.body.completed,
    precentage: req.body.precentage,
  };
  let sql = `INSERT INTO projects SET ?;`;
  let sql2 = `UPDATE users SET Created = Created + 1, Active = Active + 1 WHERE id = '${maker.userid}'`;
  let sql3 = `UPDATE users SET Active = Active + 1 WHERE Name = '${project.workers}'`;
  let query = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
  let query2 = db.query(sql2, maker, (err, result) => {
    if (err) throw err;
  });
  let query3 = db.query(sql3, project, (err, result) => {
    if (err) throw err;
  });
});
app.post("/deleteproject", (req, res) => {
  let project = {
    id: req.body.id,
    username: req.body.username,
    author: req.body.author,
    workers: req.body.workers,
  };
  let sql = `DELETE from projects WHERE id = ${project.id}; SET @num := 0;UPDATE projects SET id = @num := (@num+1);ALTER TABLE projects AUTO_INCREMENT = 1`;
  let query = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
  let sql2 = `UPDATE users SET Created = Created - 1, Active = Active -1 WHERE Name = '${project.author}' `;
  let query2 = db.query(sql2, project, (err, result) => {
    if (err) throw err;
  });
  let sql3 = `UPDATE users SET Active = Active - 1 WHERE Name = '${project.workers}'`;
  let query3 = db.query(sql3, project, (err, result) => {
    if (err) throw err;
  });
});
app.post("/deletetime", (req, res) => {
  let project = {
    id: req.body.id,
    title: req.body.title,
    minuter: req.body.minutes,
    timmar: req.body.hours,
  };
  console.log(project);
  let minuter = parseInt(project.minuter / 60);
  let timmar = parseInt(project.timmar);
  var timeused = timmar + minuter;
  let sql = `DELETE from time WHERE id = ${project.id}; SET @num := 0;UPDATE time SET id = @num := (@num+1);ALTER TABLE time AUTO_INCREMENT = 1`;
  let sql2 = `UPDATE projects SET Timeused = Timeused - ${timeused} WHERE Title = '${project.title}'`;
  let query = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
  let query2 = db.query(sql2, project, (err, result) => {
    if (err) throw err;
  });
});
/*
app.post("/editproject", (req, res) => {
  let project = {
    id: req.body.id,
    title: req.body.title,
    author: req.body.author,
    workers: req.body.workers,
    date: req.body.date,
    deadline: req.body.deadline,
    completed: req.body.completed,
    precentage: req.body.precentage,
  };
  let sql = `UPDATE projects SET Title = '${project.title}', Deadline = '${project.deadline}', Completed = '${project.completed}', Precentage=${project.precentage} WHERE id = ${project.id}`;

  let query = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
});
*/
app.post("/completeproject", function (req, res) {
  var today = new Date();
  var date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  let project = {
    id: req.body.id,
    title: req.body.title,
    author: req.body.author,
    datum: date,
    workers: req.body.workers,
    completed: req.body.completed,
    budget: req.body.budget,
    belopp: req.body.belopp,
  };
  let sql = `INSERT INTO fakturerat(Title,Author,Workers,Datum,Budget,Belopp) VALUES('${project.title}','${project.author}','${project.workers}','${project.datum}','${project.budget}','${project.belopp}')`;
  let sqldelete = `DELETE from projects WHERE id = ${project.id}; SET @num := 0;UPDATE projects SET id = @num := (@num+1);ALTER TABLE projects AUTO_INCREMENT = 1`;
  let sql2 = `UPDATE users SET Created = Created - 1, Active = Active -1, Completion = Completion + 1 WHERE Name = '${project.author}' `;
  let sql3 = `UPDATE users SET Active = Active - 1, Completion = Completion + 1 WHERE Name = '${project.workers}'`;
  let query1 = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
  let query4 = db.query(sql3, project, (err, result) => {
    if (err) throw err;
  });
  let query3 = db.query(sql2, project, (err, result) => {
    if (err) throw err;
  });
  let query2 = db.query(sqldelete, project, (err, result) => {
    if (err) throw err;
  });
});
app.get("/getarkiv", (req, res) => {
  let sql = "SELECT * FROM fakturerat";
  let query = db.query(sql, (err, result) => {
    if (err) throw err;

    res.json(result);
  });
});
app.post("/authenticate", function (req, res) {
  var Username = req.body.Username;
  var Password = req.body.Password;
  if (Username && Password) {
    db.query(
      `SELECT * FROM users WHERE Username = ? AND Password = ?`,
      [Username, Password],
      function (error, results, fields) {
        if (results.length === 1) {
          req.session.loggedin = true;
          req.session.Username = Username;
          res.redirect(url + "/Home");
        } else {
          res.send("hej");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});
io.on("connection", (socket) => {
  db.query("SELECT * FROM messages", function (error, result) {
    io.emit("message:received", result);
  });
  db.query("SELECT * FROM projects", function (error, projectdata) {
    io.emit("data:received", projectdata);
  });

  socket.on("info", (user) => {
    db.query(
      `SELECT id,Username,Name,Active,Created,Completion,Profile,Status FROM users  WHERE Username = '${user.username}'`,
      function (error, userinfo) {
        io.emit("info:received", userinfo);
      }
    );
  });
  socket.on("message", (data) => {
    let sql = "INSERT INTO messages SET ?;";
    db.query(
      `INSERT INTO messages(time,user,text,icon) VALUES('${data.time}','${data.user}','${data.text}','${data.icon}')`
    );

    db.query("SELECT * FROM messages", function (error, result) {
      io.emit("message:received", result);
    });
  });
  socket.on("edit", (editdata) => {
    db.query(
      `UPDATE projects SET Title = '${editdata.title}', Deadline = '${editdata.deadline}', Completed = '${editdata.completed}', Precentage=${editdata.precentage} WHERE id = ${editdata.id}`
    );
    db.query("SELECT * FROM projects", function (error, projectdata) {
      io.emit("data:received", projectdata);
    });
  });
  socket.on("post", (postdata) => {
    db.query(
      `INSERT INTO projects(Title,Author,Workers,Date,Deadline,Precentage,Timebudget,Timeused) VALUES('${postdata.title}','${postdata.author}','${postdata.workers}','${postdata.date}','${postdata.deadline}','${postdata.precentage}',${postdata.timebudget},${postdata.timeused});`
    );
    db.query(
      `UPDATE users SET Created = Created + 1, Active = Active + 1 WHERE id = '${postdata.userid}';`
    );
    db.query(
      `UPDATE users SET Active = Active + 1 WHERE Name = '${postdata.workers}'`
    );
    db.query("SELECT * FROM projects", function (error, projectdata) {
      io.emit("data:received", projectdata);
    });
    db.query(
      `SELECT id,Username,Name,Active,Created,Completion,Profile,Status FROM users  WHERE id = '${postdata.userid}'`,
      function (error, userinfo) {
        io.emit("info:received", userinfo);
      }
    );
  });

  socket.on("delete", (deletedata) => {
    db.query(
      `DELETE from projects WHERE id = ${deletedata.id}; SET @num := 0;UPDATE projects SET id = @num := (@num+1);ALTER TABLE projects AUTO_INCREMENT = 1`
    );
    db.query(
      `UPDATE users SET Created = Created - 1, Active = Active -1 WHERE Name = '${deletedata.author}' `
    );
    db.query(
      `UPDATE users SET Active = Active - 1 WHERE Name = '${deletedata.workers}'`
    );
    db.query("SELECT * FROM projects", function (error, projectdata) {
      io.emit("data:received", projectdata);
    });
  });
  socket.on("arkiv", (arkivdata) => {
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    db.query(
      `INSERT INTO fakturerat(Title,Author,Workers,Datum,Budget,Belopp) VALUES('${arkivdata.title}','${arkivdata.author}','${arkivdata.workers}','${date}','${arkivdata.budget}','${arkivdata.belopp}')`
    );
    db.query(
      `DELETE from projects WHERE id = ${arkivdata.id}; SET @num := 0;UPDATE projects SET id = @num := (@num+1);ALTER TABLE projects AUTO_INCREMENT = 1`
    );
    db.query(
      `UPDATE users SET Created = Created - 1, Active = Active -1, Completion = Completion + 1 WHERE Name = '${arkivdata.author}' `
    );
    db.query(
      `UPDATE users SET Active = Active - 1, Completion = Completion + 1 WHERE Name = '${arkivdata.workers}'`
    );
    db.query("SELECT * FROM projects", function (error, projectdata) {
      io.emit("data:received", projectdata);
    });
  });
  socket.on("time", (timedata) => {
    var today = new Date().getTime();
    db.query(
      `INSERT INTO time(Title,Name,Username,Description,Hours,Minutes,Datum) VALUES('${timedata.title}','${timedata.name}','${timedata.user}','${timedata.description}','${timedata.timmar}','${timedata.minuter}','${today}');`
    );
    var minuter = parseInt(timedata.minuter / 60);
    var timmar = parseInt(timedata.timmar);
    var timeused = parseInt(timmar + minuter);
    db.query(
      `UPDATE projects SET Timeused = Timeused + ${timeused} WHERE Title = '${timedata.title}'`
    );
  });
  socket.on("delet:time", (dtimedata) => {
    var minuter = parseInt(dtimedata.minuter / 60);
    var timmar = parseInt(dtimedata.timmar);
    var timeused = parseInt(timmar + minuter);
    db.query(
      `DELETE from time WHERE id = ${dtimedata.id}; SET @num := 0;UPDATE time SET id = @num := (@num+1);ALTER TABLE time AUTO_INCREMENT = 1`
    );
    db.query(
      `UPDATE time SET Timeused = Timeused - ${timeused} WHERE Title = '${dtimedata.title}'`
    );
  });
});
http.listen(PORT, function () {
  console.log("listening on *:300");
});
