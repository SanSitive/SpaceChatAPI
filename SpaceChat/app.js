let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let session = require('express-session');
let helmet = require('helmet');
let compression = require('compression');
let multer = require('multer');
let methodOverride = require('method-override');

let indexRouter = require('./routes/index');
let userRouter = require('./routes/user');
let searchRouter = require('./routes/search')
let postRouter = require('./routes/post');
let feedRouter = require('./routes/feed');
let connectionRouter = require('./routes/connection');
let commentRouter = require('./routes/comments');


let app = express();
let mongoose = require('mongoose');
const { join } = require('path');
let mongoDB = 'mongodb+srv://SanSitive:Overflow34*=@clusterspacechat.froq1.mongodb.net/SpaceChat?retryWrites=true&w=majority';
mongoose.connect(mongoDB,{useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(methodOverride('_method'));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static('uploads'));
app.use(session({
  secret: "larepubliquecestmoi",
  resave: true,
  saveUninitialized: true
}));

app.use(helmet());
app.use(compression());

app.use('/', indexRouter);
app.use('/home',userRouter);
app.use('/home',searchRouter);
app.use('/home',postRouter);
app.use('/home',feedRouter);
app.use('/home',connectionRouter);
app.use('/home',commentRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
