require('dotenv').config();
const express = require('express');
const bootable = require('bootable');

const path = require('path');
const IoC = require('electrolyte');

// Creating app
const app = bootable(express());

const base = path.join(__dirname);
const modelsPath = path.join(base, 'app', 'models');
const controllersPath = path.join(base, 'app', 'controllers');
const libPath = path.join(base, 'app', 'lib');
const settingsPath = path.join(base, 'boot', 'settings');
const componentsPath = path.join(base, 'app', 'components');

// Dependencie Injection
IoC.use(IoC.dir(base));
IoC.use('models', IoC.dir(modelsPath));
IoC.use('controllers', IoC.dir(controllersPath));
IoC.use('lib', IoC.dir(libPath));
IoC.use('settings', IoC.dir(settingsPath));
IoC.use('components', IoC.dir(componentsPath));

// Phases
app.phase(bootable.di.initializers());
app.phase(bootable.di.routes());

app.boot((err) => {
  if (err) {
    const error = new Error(err.message);
    error.status = 500;
    throw error;
  }
});

exports = module.exports = app;
