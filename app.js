var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');
var deasync = require('deasync');
var routes = require('./routes/index');
var users = require('./routes/users');
var app = express();
console.log('App running on http:/localhost:3000')
// view engine setup
app.use('/', routes);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'views')));
app.get('/myRoute', function(request, response) {
    response.sendFile( 'index.html'); //Since we have configured to use public folder for serving static files. We don't need to append public to the html file path.
});
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handlers

// development error handler
// will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     res.render('error', {
//       message: err.message,
//       error: err
//     });
//   });
// }

// production error handler
// no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   res.render('error', {
//     message: err.message,
//     error: {}
//   });
// });

var changeStringToArray = function(wordList) {
  //the final array is temp
  var intParamList = wordList;
  for (var i = 0; i < wordList.length; i++) {
    var str = wordList[i].boundingBox;
    var temp = str.split(",");
    for (a in temp) {
      temp[a] = parseInt(temp[a], 10);
    }
    intParamList[i].boundingBox = temp;
  }
  return intParamList;
}

var sortWords = function(wordList) {
  var heightSortedList = wordList.sort(function(firstWord, secondWord) {
    return (firstWord.boundingBox[1] - secondWord.boundingBox[1])
  });
  var sortedList = {lines: []};

  for (var i = 0; i < wordList.length; i++) {
     newLineHeight = wordList[i].boundingBox;
     //while the height is within a range
     var lineData = {}
     var line = [];
     var j = i;
     //ensure that words are read from left to right
     while (wordList[j] && Math.abs(newLineHeight[1] - wordList[j].boundingBox[1]) < 5) {
       line.push(wordList[j]);
       j++;
     }
     i = j;
     i--;
     var sortedSentence = line.sort(function(firstWord, secondWord){
        return (firstWord.boundingBox[0] - secondWord.boundingBox[0]);
     });
     var sentenceText = sortedSentence.map(function(word){return word.text});
     lineData.text = sentenceText.join(" ");
     lineData.boundingBox = newLineHeight;
     sortedList.lines.push(lineData);
  }
  return sortedList;
}

var getWords = function(object) {
  var wordList = [];
  for (var i = 0; i < object.regions.length; i++) {
    for (var j = 0; j < object.regions[i].lines.length; j++) {
      var sentence = object.regions[i].lines[j].words;
      if (sentence[sentence.length-1] === ':') {
        nextSentence = '  ';
      } else {
        nextSentence = '';
      }
      wordList.push(sentence);
  }
  //flatten array and change boundingBox param
  var newList = changeStringToArray([].concat.apply([], wordList));
  var finalList = sortWords(newList);
  return finalList;
  }
}

var getImageData = function(imageUrl, callback){

  var options = {                 
    method: 'POST',             
    url: 'https://api.projectoxford.ai/vision/v1.0/ocr',
    headers: {               
      'Content-Type': 'application/json',
      'Ocp-Apim-Subscription-Key': '3088d79d73b445eeb58b3313f30e6beb'       
    },
    body: JSON.stringify({                  
      url: imageUrl 
    })
  }
  request(options, function(error, response, body){
    if (!error && response.statusCode == 200) {
        var object = JSON.parse(body);
        var newObject = getWords(object);
        console.log(newObject);
        return newObject;
    } else {
      console.log('error');
      return;
    }
  });
}


app.post('/sendcode', function(req, res) {
  var url = req.body.url;
  
  var textList;
  var done = false;
  textList = getImageData(url);
  console.log(textList);

  var getData = function(callback) {
    setTimeout(function(){
      console.log('in callback')
      textList = getImageData(url);
      callback();
    }, 500);
     res.setHeader('Content-Type', 'application/json');
     res.send(JSON.stringify(getImageData(url)));
     console.log('complete');
  };
});

module.exports = app;
