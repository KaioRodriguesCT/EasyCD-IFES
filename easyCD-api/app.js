require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bootable = require('bootable');
const path = require('path');
const IoC = require('electrolyte');
const cookieParser = require('cookie-parser');

// Creating app
const app = bootable(express());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const base = path.join(__dirname);
const modelsPath = path.join(base, 'app', 'models');
const controllersPath = path.join(base, 'app', 'controllers');
const libPath = path.join(base, 'app', 'lib');

// Dependencie Injection
IoC.use(IoC.dir(base));
IoC.use('models', IoC.dir(modelsPath));
IoC.use('controllers', IoC.dir(controllersPath));
IoC.use('lib', IoC.dir(libPath));

// Phases
app.phase(bootable.di.initializers());
app.phase(bootable.di.routes());

app.boot((err) => {
  if (err) {
    const error = new Error(err.message);
    error.status = 500;
    throw error;
  }
  console.log('Starting application, listening port 3000');
  app.listen(3000);
});

exports = module.exports = app;
