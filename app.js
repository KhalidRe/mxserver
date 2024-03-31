var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var session = require("express-session");
var cors = require("cors");
var path = require("path");
var fs = require("fs");
const { get } = require("express/lib/response");
var PORT = process.env.PORT || 3000;
const url = "https:flexnet.se/#";
var ss = require("socket.io-stream");
const http = require("http");
const https = require("https");
const { post } = require("request");
const { rename } = require("fs");
const siofu = require("socketio-file-upload");
const app = express();
const morgan = require("morgan");
const _ = require("lodash");
const fileUpload = require("express-fileupload");
const { text } = require("express");
var options = {
  key: fs.readFileSync("Key-SSH.key"),
  cert: fs.readFileSync("SLL-Cert.crt"),
  ca: fs.readFileSync("CA-Certificates.crt"),
};
app.use(morgan("dev"));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(
  cors({
    origin: "*",
    methods: "GET,PUT,POST,OPTIONS",
  })
);

var db = mysql.createConnection({
  multipleStatements: true,
  host: "localhost",
  user: "******",
  password: "******",
  port: 3306,
  database: "******",
  charset: "utf8mb4",
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
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use(bodyParser.json());
const server = https.createServer(options, app);
server.listen(3000, () => {
  console.log("server started ok");
});
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "PUT", "POST"],
  },
  secure: true,
});
app.get("/createtableprojects", (req, res) => {
  let sql =
    "CREATE TABLE planner(id int AUTO_INCREMENT, Title VARCHAR(255), PRIMARY KEY(id))";

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
/*
SELECT p.*, u.* from projects p 
LEFT JOIN project_workers pw ON(pw.projectid = p.id)
LEFT JOIN users u ON(u.id = pw.workerid)


SELECT u.* from projects p 
LEFT JOIN project_workers pw ON(pw.projectid = p.id)
LEFT JOIN users u ON(u.id = pw.workerid)
WHERE p.id = 12;
*/
app.post("/upload-avatar", async (req, res) => {
  try {
    if (!req.files) {
      res.send({
        status: false,
        message: "No file uploaded",
      });
    } else {
      //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
      let avatar = req.files.avatar;

      //Use the mv() method to place the file in upload directory (i.e. "uploads")
      avatar.mv("./uploads/" + avatar.name);

      //send response
      res.send({
        status: true,
        message: "File is uploaded",
        data: {
          name: avatar.name,
          mimetype: avatar.mimetype,
          size: avatar.size,
        },
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
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
app.post("/getusers", (req, res) => {
  let searcher = {
    nanoid: req.body,
  };

  let sql = `SELECT id,Name,Active,Created,Completion,Profile,Status FROM users WHERE nanoid = '${searcher.nanoid.nanoid}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});
app.post("/workernav", (req, res) => {
  let maker = {
    user: req.body.user,
  };
  let sql = `SELECT id,Username,Name,Active,Created,Completion,Profile,Status,nanoid FROM users  WHERE Username = '${maker.user}'`;
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

    res.json(result);
  });
});
app.post("/alltime", (req, res) => {
  let searcher = {
    nanoid: req.body,
  };
  let sql = `SELECT * FROM time WHERE nanoid = '${searcher.nanoid.nanoid}' `;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;

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
  let sql = `DELETE from projects WHERE id = ${project.id}; `;
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

  let minuter = parseInt(project.minuter / 60);
  let timmar = parseInt(project.timmar);
  var timeused = timmar + minuter;
  let sql = `DELETE from time WHERE id = ${project.id}; `;
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
  let sql = `INSERT INTO fakturerat(Title,Author,Workers,Datum,Budget,Belopp,authornanoid) VALUES('${project.title}','${project.author}','${project.workers}','${project.datum}','${project.budget}','${project.belopp}','${project.authornanoid}')`;
  let sqldelete = `DELETE from projects WHERE id = ${project.id}; `;
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
app.post("/getarkiv", (req, res) => {
  let searcher = {
    nanoid: req.body,
  };
  let sql = `SELECT * FROM fakturerat WHERE nanoid = '${searcher.nanoid.nanoid}'`;
  let query = db.query(sql, (err, result) => {
    if (err) throw err;

    res.json(result);
  });
});
app.post("/authenticate", function (req, res) {
  var Username = req.body.Username;
  var Password = req.body.Password;
  var wrongif = {
    itswrong: true,
    text: "Fel användarnamn eller lösenord",
  };
  var emptyif = {
    itswrong: true,
    text: "Ange användarnamn och lösenord!",
  };

  if (Username && Password) {
    db.query(
      `SELECT * FROM users WHERE Username = ? AND Password = ?`,
      [Username, Password],
      function (error, results, fields) {
        if (results.length === 1) {
          req.session.loggedin = true;
          req.session.Username = Username;
          var suclog = {
            itswrong: false,
            Username: Username,
          };
          res.json(suclog);
        } else {
          res.json(wrongif);
        }
      }
    );
  } else {
    res.json(emptyif);
  }
});
//WHERE nanoid = '${loggedin}'
io.on("connection", (socket) => {
  const uploader = new siofu(socket);

  socket.on("imageupload", (filer) => {
    db.query(`INSERT INTO images VALUES(${filer})`);

    db.query("SELECT * FROM images", function (error, result) {
      io.to(userID).emit("image:received", result);
    });
  });
  socket.on("loggedinfo", (loggedin) => {
    const userID = loggedin.nanoid;
    socket.join(userID);
    db.query("SELECT * FROM messages", function (error, result) {
      io.emit("message:received", result);
    });
    uploader.listen(socket);
    var streams = {};
    uploader.on("start", function (event) {
      streams[event.file.id] = fs.createWriteStream(
        `./mxprofile/` +
          loggedin.nanoid +
          loggedin.Username +
          loggedin.id +
          ".jpg"
      );
      console.log(event);
    });
    uploader.on("progress", function (event) {
      streams[event.file.id].write(event.buffer);
    });
    uploader.on("complete", function (event) {
      streams[event.file.id].end();
      delete streams[event.file.id];
      db.query(
        `UPDATE task_worker SET profile ='${
          loggedin.nanoid + loggedin.Username + loggedin.id
        }' WHERE workerid = ${loggedin.id}`
      );
      db.query(
        `UPDATE project_workers SET Profile ='${
          loggedin.nanoid + loggedin.Username + loggedin.id
        }' WHERE workerid = ${loggedin.id}`
      );

      db.query(
        `UPDATE projects SET Authorprofile ='${
          loggedin.nanoid + loggedin.Username + loggedin.id
        }' WHERE Authorid = ${loggedin.id}`
      );
      db.query(
        `UPDATE users SET Profile ='${
          loggedin.nanoid + loggedin.Username + loggedin.id
        }' WHERE id = ${loggedin.id}`,
        function (error, tags) {
          socket.emit("updateprofile", tags);
          console.log(tags);
        }
      );
    });

    uploader.on("error", function (event) {
      console.log("Error from uploader", event);
    });
    db.query(
      `SELECT * FROM projects WHERE nanoid = '${loggedin.nanoid}' ORDER BY Statu`,
      function (error, projectdata) {
        io.to(userID).emit("data:received", projectdata);
      }
    );
    db.query(
      `SELECT * FROM User_tags WHERE nanoid = '${loggedin.nanoid}'`,
      function (error, tags) {
        io.to(userID).emit("tags", tags);
      }
    );
    db.query("SELECT * From minitrello", function (error, trellodata) {
      io.to(userID).emit("trello:received", trellodata);
    });
    db.query(
      "Select a.*, b.Name From project_workers a JOIN users b on a.workerid = b.id ORDER BY a.projectid",
      function (error, workerdeltag) {
        io.to(userID).emit("workerdeltag:received", workerdeltag);
      }
    );
    db.query(
      `SELECT * FROM planner WHERE nanoid = '${loggedin.nanoid}'`,
      function (error, plannerarr) {
        io.to(userID).emit("planner:received", plannerarr);
      }
    );
    db.query("SELECT * FROM bucket", function (error, bucketarr) {
      io.to(userID).emit("bucket:received", bucketarr);
    });
    db.query("SELECT * FROM task ORDER BY id DESC", function (error, taskarr) {
      io.to(userID).emit("task:received", taskarr);
    });
    db.query(
      "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
      function (error, workerarr) {
        io.to(userID).emit("worker:received", workerarr);
      }
    );
    socket.on("mytime", (mytime) => {
      db.query(
        `SELECT * FROM time  WHERE Username = '${mytime}'`,
        function (error, mytimedata) {
          console.log(mytimedata);
          socket.emit("mytimedata", mytimedata);
        }
      );
      db.query(
        `SELECT * FROM projects WHERE nanoid = '${loggedin.nanoid}' ORDER BY Statu`,
        function (error, projectdata) {
          io.to(userID).emit("data:received", projectdata);
        }
      );
    });
    socket.on("info", (user) => {
      db.query(
        `SELECT id,Username,Name,Active,Created,Completion,Profile,Status FROM users  WHERE Username = '${user.username}'`,
        function (error, userinfo) {
          io.to(userID).emit("info:received", userinfo);
        }
      );
    });

    socket.on("message", (data) => {
      let sql = "INSERT INTO messages SET ?;";
      db.query(
        `INSERT INTO messages(time,user,text,icon) VALUES('${data.time}','${data.user}','${data.text}','${data.icon}')`
      );

      db.query("SELECT * FROM messages", function (error, result) {
        io.to(userID).emit("message:received", result);
      });
    });
    socket.on("edit", (editdata) => {
      db.query(
        `UPDATE projects SET Deadline = '${editdata.deadline}', Statu = '${editdata.status}' WHERE id = ${editdata.id}`
      );
      db.query("SELECT * FROM projects", function (error, projectdata) {
        io.to(userID).emit("data:received", projectdata);
      });
    });
    /*
//SELECT REMAINING NOT IN USERS NOT IN PROJECT

  SELECT * FROM users u
WHERE u.id not in(select u2.id from users u2 JOIN project_workers pw2 ON(u2.id = pw2.workerid) WHERE pw2.projectid = ${editdata.id})
*/
    socket.on("planner", (plandata) => {
      db.query(
        `INSERT INTO planner(Title,color,nanoid) VALUES('${plandata.plantitle}','${plandata.plancolor}','${plandata.nanoid}')`
      );
      db.query(
        `SELECT * FROM planner WHERE nanoid = '${loggedin.nanoid}'`,
        function (error, plannerarr) {
          io.to(userID).emit("planner:received", plannerarr);
        }
      );
      db.query("SELECT * FROM bucket", function (error, bucketarr) {
        io.to(userID).emit("bucket:received", bucketarr);
      });
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("deleteplanner", (deleteplandata) => {
      db.query(`DELETE FROM planner WHERE id = ${deleteplandata.id};`);
      db.query("SELECT * FROM planner", function (error, plannerarr) {
        io.to(userID).emit("planner:received", plannerarr);
      });
      db.query("SELECT * FROM bucket", function (error, bucketarr) {
        io.to(userID).emit("bucket:received", bucketarr);
      });
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("bucket", (bucketdata) => {
      db.query(
        `INSERT INTO bucket(fatherid,title) VALUES(${bucketdata.bucketfatherid},'${bucketdata.buckettitle}')`
      );
      db.query("SELECT * FROM bucket", function (error, bucketarr) {
        io.to(userID).emit("bucket:received", bucketarr);
      });
    });
    socket.on("deletebucket", (deletebucketdata) => {
      db.query(`DELETE FROM bucket WHERE id = ${deletebucketdata.id};`);
      db.query("SELECT * FROM bucket", function (error, bucketarr) {
        io.to(userID).emit("bucket:received", bucketarr);
      });
    });
    socket.on("task", (taskdata) => {
      db.query(
        `INSERT INTO task(fatherid,enddate,authorid,title) VALUES(${taskdata.taskfatherid},'${taskdata.enddate}','${taskdata.authorid}','${taskdata.tasktitle}');SELECT last_insert_id() as lastid;`,
        function (error, testid) {
          let pw_id = testid[1][0].lastid;

          for (i = 0; taskdata.deltag.length > i; i++) {
            db.query(
              `INSERT INTO task_worker(taskid,workerid,name,profile) VALUES(` +
                pw_id +
                `,${taskdata.deltag[i].id},'${taskdata.deltag[i].Name}','${taskdata.deltag[i].Profile}');`
            );
          }
        }
      );

      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
          db.query(
            "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
            function (error, workerarr) {
              io.to(userID).emit("worker:received", workerarr);
            }
          );
        }
      );
    });
    socket.on("modtask", (modtaskdata) => {
      db.query(
        `UPDATE task SET title = '${modtaskdata.tasktitle}', startdate = '${modtaskdata.startdate}', enddate = '${modtaskdata.enddate}', progress = ${modtaskdata.progress}, priority = ${modtaskdata.priority}, notes = '${modtaskdata.note}', authorid = ${modtaskdata.authorid} WHERE id = ${modtaskdata.id}`
      );
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
          db.query(
            "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
            function (error, workerarr) {
              io.to(userID).emit("worker:received", workerarr);
            }
          );
        }
      );
    });
    socket.on("deletetask", (deletetaskdata) => {
      db.query(`DELETE FROM task WHERE id = ${deletetaskdata.id};`);
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("removeuser", (removeworkerkdata) => {
      db.query(
        `DELETE FROM task_worker WHERE workerid = ${removeworkerkdata.id} AND taskid = ${removeworkerkdata.taskid};`
      );
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("adduser", (addworkerdata) => {
      db.query(
        `INSERT INTO task_worker(taskid,workerid,name,profile) VALUES(${addworkerdata.taskid},${addworkerdata.user.id},'${addworkerdata.user.Name}','${addworkerdata.user.Profile}')`
      );
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("addtag", (taginfo) => {
      db.query(
        `INSERT INTO User_tags(Usertags,color,Nanoid) VALUES('${taginfo.tagname}','${taginfo.color}','${taginfo.nanoid}')`
      );
      console.log(taginfo);
      db.query(
        `SELECT * FROM User_tags WHERE Nanoid = '${taginfo.nanoid}'`,
        function (error, tags) {
          io.to(userID).emit("tags", tags);
        }
      );
    });
    socket.on("deletetag", (deletetaginfo) => {
      db.query(`DELETE FROM User_tags WHERE Id = ${deletetaginfo.tagid};`);
      console.log(deletetaginfo);
      db.query(
        `SELECT * FROM User_tags WHERE Nanoid = '${deletetaginfo.nanoid}'`,
        function (error, tags) {
          console.log(tags);
          io.to(userID).emit("tags", tags);
        }
      );
    });
    socket.on("addworker", (addworkerdata) => {
      db.query(
        `INSERT INTO task_worker(taskid,workerid) VALUES(${addworkerdata.taskid},${addworkerdata.workerid})`
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("deleteworker", (deleteworkerdata) => {
      db.query(
        `DELETE FROM task_worker WHERE taskid = ${deleteworkerdata.taskid};`
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("completetask", (completetaskdata) => {
      db.query(
        `UPDATE task SET progress = 2 WHERE id = ${completetaskdata.id}`
      );
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });
    socket.on("notcompletetask", (notcompletetaskdata) => {
      db.query(
        `UPDATE task SET progress = 0 WHERE id = ${notcompletetaskdata.id}`
      );
      db.query(
        "SELECT * FROM task ORDER BY id DESC",
        function (error, taskarr) {
          io.to(userID).emit("task:received", taskarr);
        }
      );
      db.query(
        "Select a.*, b.Name From task_worker a JOIN users b on a.workerid = b.id ORDER BY a.taskid",
        function (error, workerarr) {
          io.to(userID).emit("worker:received", workerarr);
        }
      );
    });

    socket.on("trello:created", (trello) => {
      db.query(
        `INSERT INTO minitrello(title,description,fatherid) VALUES('${trello.title}','${trello.description}',${trello.fatherid})`
      );
      db.query("SELECT * From minitrello", function (error, trellodata) {
        io.to(userID).emit("trello:received", trellodata);
      });
    });

    socket.on("trello:status", (trellostatus) => {
      db.query(
        `UPDATE minitrello SET completed = not completed where id = ${trellostatus.id} `
      );

      db.query("SELECT * From minitrello", function (error, trellodata) {
        io.to(userID).emit("trello:received", trellodata);
      });
    });
    socket.on("trello:delete", (deletetrello) => {
      db.query(`DELETE from minitrello where id = ${deletetrello.id}; `);
      db.query("SELECT * From minitrello", function (error, trellodata) {
        io.to(userID).emit("trello:received", trellodata);
      });
    });
    socket.on("delete", (deletedata) => {
      db.query(
        `UPDATE users SET Active = Active - 1 WHERE id IN (SELECT workerid from project_workers WHERE projectid = ${deletedata.id})`
      );
      db.query(`DELETE from projects WHERE id = ${deletedata.id}; `);

      db.query(
        `UPDATE users SET Created = Created - 1, Active = Active -1 WHERE Name = '${deletedata.author}' `
      );

      db.query(`DELETE from minitrello where fatherid = ${deletedata.id}; `); //delete when foreign key.
      db.query(
        `SELECT * FROM projects WHERE nanoid = '${loggedin.nanoid}' ORDER BY Statu`,
        function (error, projectdata) {
          io.to(userID).emit("data:received", projectdata);
        }
      );
      db.query("SELECT * From minitrello", function (error, trellodata) {
        io.to(userID).emit("trello:received", trellodata);
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
        `UPDATE users SET Active = Active - 1, Completion = Completion + 1 WHERE id IN (SELECT workerid from project_workers WHERE projectid = ${arkivdata.id})`
      );

      db.query(
        `INSERT INTO fakturerat(Title,Author,Datum,Budget,Belopp,nanoid) VALUES('${arkivdata.title}','${arkivdata.author}','${date}','${arkivdata.budget}','${arkivdata.belopp}','${arkivdata.authornanoid}')`
      );
      db.query(`DELETE from projects WHERE id = ${arkivdata.id}; `);
      db.query(`DELETE from minitrello where fatherid = ${arkivdata.id}; `);
      db.query(
        `UPDATE users SET Created = Created - 1, Active = Active -1, Completion = Completion + 1 WHERE Name = '${arkivdata.author}' `
      );

      db.query(
        `SELECT * FROM projects WHERE nanoid = '${loggedin.nanoid}' ORDER BY Statu`,
        function (error, projectdata) {
          io.to(userID).emit("data:received", projectdata);
        }
      );
      db.query("SELECT * From minitrello", function (error, trellodata) {
        io.to(userID).emit("trello:received", trellodata);
      });
    });
    socket.on("time", (addtimedata) => {
      var today = new Date().getTime();
      console.log(addtimedata);
      db.query(
        `INSERT INTO time(Title,Name,Username,Description,Hours,Minutes,Datum,fatherid,debit,nanoid) VALUES('${
          addtimedata.title
        }','${addtimedata.name}','${addtimedata.user}','${
          addtimedata.description
        }','${addtimedata.timmar}','${addtimedata.minuter}','${
          addtimedata.datepicked
        }',${addtimedata.fatherid},${parseInt(addtimedata.debit)},'${
          addtimedata.nanoid
        }');`
      );

      var minuter = parseFloat(addtimedata.minuter / 60);
      var timmar = parseInt(addtimedata.timmar);
      var timeused = timmar + minuter;

      db.query(
        `UPDATE projects SET Timeused = Timeused + ${timeused} WHERE id = ${addtimedata.projectid}`
      );
      db.query(
        `SELECT * FROM time  WHERE Username = '${addtimedata.user}'`,
        function (error, mytimedata) {
          socket.emit("mytimedata", mytimedata);
        }
      );
    });
    socket.on("delet:time", (dtimedata) => {
      var minuter = parseFloat(dtimedata.minuter / 60);
      var timmar = parseInt(dtimedata.hours);
      var timeused = timmar + minuter;
      db.query(`DELETE from time WHERE id = ${dtimedata.id}; `);

      db.query(
        `UPDATE projects SET Timeused = Timeused - ${timeused} WHERE id = ${dtimedata.fatherid}`
      );
      db.query(
        `SELECT * FROM time  WHERE Username = '${dtimedata.user}'`,
        function (error, mytimedata) {
          socket.emit("mytimedata", mytimedata);
        }
      );
    });

    socket.on("post", (postdata) => {
      console.log(postdata);
      db.query(
        `INSERT INTO projects(Title,Author,Date,Deadline,Precentage,Timebudget,Timeused,Statu,Authorstatus,Authorid,nanoid,Authorprofile) VALUES('${postdata.title}','${postdata.author}','${postdata.date}','${postdata.deadline}','${postdata.precentage}',${postdata.timebudget},${postdata.timeused},'${postdata.status}','${postdata.Authorstatus}',${postdata.Authorid},'${postdata.authornanoid}','${postdata.authorprofile}');SELECT last_insert_id() as lastid;`,
        function (error, testid) {
          let pw_id = testid[1][0].lastid;

          for (i = 0; postdata.deltag.length > i; i++) {
            db.query(
              `INSERT INTO project_workers(projectid,workerid,name,Profile,nanoid) VALUES(` +
                pw_id +
                `,${postdata.deltag[i].id},'${postdata.deltag[i].Name}','${postdata.deltag[i].Profile}','${postdata.authornanoid}');`
            );
          }
        }
      );
      for (i = 0; postdata.deltag.length > i; i++) {
        db.query(
          `UPDATE users SET Active = Active + 1 WHERE id = ${postdata.deltag[i].id} `
        );
      }
      db.query(
        `UPDATE users SET Created = Created + 1, Active = Active + 1 WHERE id = '${postdata.userid}';`
      );

      db.query(
        `SELECT * FROM projects WHERE nanoid = (select nanoid from users where id = ${postdata.authorid} ORDER BY Statu`,
        function (error, projectdata) {
          io.emit("data:received", projectdata);
        }
      );
      db.query(
        `SELECT id,Username,Name,Active,Created,Completion,Profile,Status FROM users  WHERE id = '${postdata.userid}'`,
        function (error, userinfo) {
          io.emit("info:received", userinfo);
        }
      );
      db.query(
        "Select a.*, b.Name From project_workers a JOIN users b on a.workerid = b.id ORDER BY a.projectid",
        function (error, workerdeltag) {
          io.emit("workerdeltag:received", workerdeltag);
        }
      );
    });
  });
  socket.on("accountinfo", (accountinfo) => {
    console.log(accountinfo);
    var confirmationemail = "";
    var confirmationuser = "";
    var success = false;
    db.query(
      `SELECT * FROM users WHERE Username = '${accountinfo.username}'`,
      function (error, userres) {
        if (userres.length === 0) {
          db.query(
            `SELECT * FROM users WHERE email = '${accountinfo.email}'`,
            function (error, emailres) {
              if (emailres.length === 0) {
                db.query(
                  `INSERT into users(Username,Password,Name,Status,nanoid,email) VALUES('${accountinfo.username}','${accountinfo.password}','${accountinfo.name}','${accountinfo.type}','${accountinfo.nanoid}','${accountinfo.email}');`
                );
                db.query(
                  `SELECT Name, Active, Created, Completion, Profile, Status, email, FROM users Where nanoid = ${accountinfo.nanoid}`,
                  function (error, updateusers) {
                    io.emit("updateusers", updateusers);
                  }
                );
                confirmationemail = "";
                confirmationuser = "";
                io.emit("confirmationE", confirmationemail);
                io.emit("confirmationU", confirmationuser);
              } else {
                confirmationemail = "Email already exists";
                io.emit("confirmationE", confirmationemail);
              }
            }
          );
        }
        if (userres.length > 0) {
          confirmationuser = "Usernamne already exists";
          io.emit("confirmationU", confirmationuser);
        }
      }
    );
  });
});
