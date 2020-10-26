const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
var cors = require("cors");
const app = express();
app.use(cors());
const fs = require("fs");
const morgan = require("morgan");
const paths = [];
app.use(morgan("tiny"));
app.use(fileUpload());
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));

// pre hand
for (var i = 1; i <= process.env.NOSTORAGE; i++) {
  paths.push(process.env["STORAGE" + i]);
}
console.log(paths);
//ROUTES WILL GO HERE
app.get("/", function (req, res) {
  res.json({ message: "WELCOME" });
});

app.post("/upload", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }
  console.log(req.files);
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv(process.env.STORAGE1 + "/" + sampleFile.name, function (err) {
    if (err) return res.status(500).send(err);
    res.send("File uploaded!");
  });
});
// app.get("/getFiles", (req, res) => {
//   var fs = require("fs");
//   var files = [];
//   for (var i = 1; i <= process.env.NOSTORAGE; i++) {
//     console.log(process.env["STORAGE" + i]);
//     var filess = fs.readdirSync(process.env["STORAGE" + i]);
//     console.log(filess);
//     files = files.concat(filess);
//   }

//   console.log(files);

//   files = files.map((item) => {
//     if (!item.startsWith(".")) {
//       return item;
//     }
//   });
//   var filtered = files.filter(function (el) {
//     return el != null;
//   });
//   res.send(filtered);
// });

app.get("/getFiles", (req, res) => {
  var response = [];
  paths.forEach((path) => {
    fs.readdir(path, function (err, files) {
      if (err) {
        return console.log("Unable to scan directory: " + err);
      }
      //console.log(files);
      files = files.map((item) => {
        if (!item.startsWith(".")) {
          return item;
        }
      });
      var filtered = files.filter(function (el) {
        return el != null;
      });
      filtered.forEach((file) => {
        var stats = fs.statSync(path + "/" + file);
        response.push({ filename: file, filesize: stats["size"] / 1000000.0 });
      });
      res.send(response);
    });
  });
});

app.get("/download/:filename", (req, res) => {
  var filename = req.params.filename;
  res.sendFile(process.env.STORAGE1 + "/" + filename);
});
app.listen(3001, () => console.log("Server started on port 3001"));
