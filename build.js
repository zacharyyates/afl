// Copyright (c) 2014 Zachary Yates, No Rights Reserved.
// clears the output folder and builds the website

var path = require("path");
var fs = require("fs-extra");
var less = require("less");
var hbs = require("hbs");
var CleanCSS = require("clean-css");
var parseXml = require("xml2js").parseString;

var log = function () {
  console.log.apply(this, arguments);
};

var mkdir = function (path) {
  try {
    fs.mkdirsSync(path);
  } catch (ex) {
    //console.warn(ex);
  }
};
var rmdir = function (path) {
  try {
    fs.removeSync(path);
  } catch (ex) {
    //console.warn(ex);
  }
};

var sourcePath  = __dirname + "/src";
var objPath     = __dirname + "/obj";
var binPath     = __dirname + "/bin";
var dataPath    = __dirname + "/data";

var cssPath = "/assets/css";
var imgPath = "/assets/img";
var viewsPath = "/views";

// clean the build and output
rmdir(objPath);
mkdir(objPath);
mkdir(objPath + cssPath);

rmdir(binPath);
mkdir(binPath);
mkdir(binPath + cssPath);

// process styles
var sourceStyleFiles = fs.readdirSync(sourcePath + cssPath);

// compile less
sourceStyleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".less") {
    var inputPath = sourcePath + cssPath + "/" + fileName;
    var outputPath = objPath + cssPath + "/" + fileName.replace(".less", ".css");
    
    var input = fs.readFileSync(inputPath, "utf8");
    var output = less.render(input, function (e, css) {      
      log("compiling " + inputPath + "...");
      fs.writeFileSync(outputPath, css);
    });
  }
});

// concat and minify
var buildStyleFiles = fs.readdirSync(objPath + cssPath);
var outputCssFilePath = binPath + cssPath + "/public.css";
var sourceCss = "";

buildStyleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".css") {
    var inputPath = objPath + cssPath + "/" + fileName;
    log("concatenating " + inputPath + "...");
    sourceCss += "\n" + fs.readFileSync(inputPath, "utf8");
  }
});

var minifiedCss = new CleanCSS().minify(sourceCss);
fs.writeFileSync(outputCssFilePath, minifiedCss);

// import header and footer
var headSource = fs.readFileSync(sourcePath + viewsPath + "/head.html", "utf8");
var headerSource = fs.readFileSync(sourcePath + viewsPath + "/header.html", "utf8");
var footerSource = fs.readFileSync(sourcePath + viewsPath + "/footer.html", "utf8");

// compile article template
var articleSource = fs.readFileSync(sourcePath + viewsPath + "/article.html", "utf8");

// replace header/footer includes
articleSource = articleSource.replace("{{head}}", headSource);
articleSource = articleSource.replace("{{header}}", headerSource);
articleSource = articleSource.replace("{{footer}}", footerSource);

var articleTemplate = hbs.compile(articleSource);

var argumentPath = "/arguments";
mkdir(binPath + argumentPath);

// load article data
var articleFiles = fs.readdirSync(dataPath + argumentPath);
articleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".xml") {
    var inputPath = dataPath + argumentPath + "/" + fileName;
    var outputPath = binPath + argumentPath + "/" + fileName.replace(".xml", ".html");
    var input = fs.readFileSync(inputPath, "utf8");
    
    parseXml(input, function (err, result) {
      //console.dir(result.root);
      //console.dir(result.root.references[0].ref[0].$)
      
      var output = articleTemplate(result.root);
      fs.writeFileSync(outputPath, output);
    });
  }
});

