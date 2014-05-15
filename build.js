// Copyright (c) 2014 Zachary Yates, No Rights Reserved.
// clears the output folder and builds the website

var path = require("path");

var fs = require("fs-extra");
var less = require("less");
var hbs = require("hbs");
var CleanCSS = require("clean-css");

var log = function () {
  console.log.apply(this, arguments);
};
var sourcePath = "./src";
var objPath = "./obj";
var binPath = "./bin";

var cssPath = "/assets/css";
var imgPath = "/assets/img";
var viewsPath = "/views";
var dataPath = "/data";

// clean the build and output
try {
  fs.removeSync(objPath);
} 
finally {
  fs.mkdirsSync(objPath);
  fs.mkdirsSync(objPath + cssPath);
}

try {
  fs.removeSync(binPath);
} finally {
  fs.mkdirsSync(binPath);
  fs.mkdirsSync(binPath + cssPath);
}

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
var headSource = fs.readFileSync(sourcePath + views + "/head.html", "utf8");
var headerSource = fs.readFileSync(sourcePath + views + "/header.html", "utf8");
var footerSource = fs.readFileSync(sourcePath + views + "/footer.html", "utf8");

// compile article template
var articleSource = fs.readFileSync(sourcePath + views + "/article.html", "utf8");

// replace header/footer includes
articleSource = articleSource.replace("{{head}}", headSource);
articleSource = articleSource.replace("{{header}}", headerSource);
articleSource = articleSource.replace("{{footer}}", footerSource);

var articleTemplate = hbs.compile(articleSource);

// load article data
var articleFiles = fs.readdirSync(dataPath + "/articles");
articleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".json") {
    var inputPath = dataPath + "/articles/" + fileName;
    var outputPath = binPath + "/arguments/" + fileName.replace(".json", ".html");
    var input = fs.readFileSync(inputPath, "utf8");
    var json = JSON.parse(input);
    
    var output = articleTemplate(json);
    fs.writeFileSync(outputPath, output);
  }
});