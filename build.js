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
var buildPath = "./obj";
var outputPath = "./bin";

var cssPath = "/assets/css";
var imgPath = "/assets/img";

// clean the build and output
try {
  fs.removeSync(buildPath);
} 
finally {
  fs.mkdirsSync(buildPath);
  fs.mkdirsSync(buildPath + cssPath);
}

try {
  fs.removeSync(outputPath);
} finally {
  fs.mkdirsSync(outputPath);
  fs.mkdirsSync(outputPath + cssPath);
}

// process styles
var sourceStyleFiles = fs.readdirSync(sourcePath + cssPath);

// compile less
sourceStyleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".less") {
    var inputPath = sourcePath + cssPath + "/" + fileName;
    var outputPath = buildPath + cssPath + "/" + fileName.replace(".less", ".css");
    
    var input = fs.readFileSync(inputPath, "utf8");
    var output = less.render(input, function (e, css) {      
      log("compiling " + inputPath + "...");
      fs.writeFileSync(outputPath, css);
    });
  }
});

// concat and minify
var buildStyleFiles = fs.readdirSync(buildPath + cssPath);
var outputCssFilePath = outputPath + cssPath + "/public.css";
var sourceCss = "";

buildStyleFiles.forEach(function (fileName) {
  if (path.extname(fileName) === ".css") {
    var inputPath = buildPath + cssPath + "/" + fileName;
    log("concatenating " + inputPath + "...");
    sourceCss += "\n" + fs.readFileSync(inputPath, "utf8");
  }
});

var minifiedCss = new CleanCSS().minify(sourceCss);
fs.writeFileSync(outputCssFilePath, minifiedCss);