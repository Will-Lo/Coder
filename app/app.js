var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require('request');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
console.log('App running on http:/localhost:3000')
// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
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
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


function getImageData(imageUrl){
  //test url: http://postimg.org/image/kzxy42env/
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
        console.dir(object, {depth: null, colors: true})
    }
  })
}; 

getImageData('http://s33.postimg.org/pnpqkzjnj/13393506_1105268579516200_1088892518_n.jpg');


module.exports = app;
