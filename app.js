var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");
var cors = require("cors");
var path = require("path");
var fs = require("fs");
var PORT = process.env.PORT || 3000;
const url = "http://192.168.1.129:8080/#";
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
  user: "doadmin",
  username: "doadmin",
  password: "2LXlPKZHwxmUAekt",
  host: "db-mysql-lon1-29438-do-user-9795775-0.b.db.ondigitalocean.com",
  port: 25060,
  database: "marinex",
  ssl: {
    ca: fs.readFileSync("./ca-certificate.crt"),
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
io.on("connection", (socket) => {
  console.log(`user connected`);
  socket.on("message", (data) => {
    socket.broadcast.emit("messege recived", data);
  });
});

app.get("/createtableprojects", (req, res) => {
  let sql =
    "CREATE TABLE fakturerat(id int AUTO_INCREMENT, Title VARCHAR(255), Author VARCHAR(255), Workers VARCHAR(255), Datum VARCHAR(255), Budget VARCHAR(255), Belopp VARCHAR(255), PRIMARY KEY(id))";

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
  let sql = `SELECT Username FROM users WHERE Username = '${maker.user}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

app.get("/viewprojects", (req, res) => {
  let sql = "SELECT * FROM projects";
  let query = db.query(sql, (err, result) => {
    if (err) throw err;

    io.sockets.emit("viewprojects", res.json(result));
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

app.post("/addtime", (req, res) => {
  let tid = {
    title: req.body.title,
    name: req.body.name,
    username: req.body.username,
    description: req.body.description,
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
  let sql = `INSERT INTO projects SET ?; `;
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
  };

  let sql = `DELETE from time WHERE id = ${project.id}; SET @num := 0;UPDATE time SET id = @num := (@num+1);ALTER TABLE time AUTO_INCREMENT = 1`;
  let query = db.query(sql, project, (err, result) => {
    if (err) throw err;
  });
});

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
        if (results[0].Username === Username) {
          req.session.loggedin = true;
          req.session.Username = Username;
          res.redirect(url + "/Home");
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});
io.on("connection", function (socket) {
  console.log("A user connected");

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function () {
    console.log("A user disconnected");
  });
});

http.listen(PORT, function () {
  console.log("listening on *:3000");
});
