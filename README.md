# LEDWax Web UI
A web-based controller for LEDWax IoT hardware.  Controls LED lighting strips connected to Particle Photon IoT hardware.

![LED control screenshot from Particle Forums](https://community.particle.io/uploads/default/original/2X/4/4d7149100814355296f19e0d60b6b966cdba18d4.png)](https://community.particle.io/uploads/default/original/2X/4/4d7149100814355296f19e0d60b6b966cdba18d4.png)

LEDWax-Web-UI is software that provides two websites (modules):  the Web UI (web-ui) and REST API (middleware).  The Web UI module is a website served on port 8000.  The REST API module is a REST API (website) served on port 3000.

This project runs on NodeJS and comes with a built-in webserver.  This makes it easier to run the application from a RaspberryPi (RPi) that hosts a private particle cloud because it already has NodeJS installed.  LEDWax-Web-UI does NOT need to be run on a RPi.  It can run on any machine (that meets system requirements), including VMs, and be configured to point at a private (local) cloud server, or the Particle public cloud.

## System Requirements

This project is known to work on systems which meet the requirements for Raspbian Wheezy, Debian 8+, Ubuntu 14+, Windows 7+, and Mac OSX 10.10+ (it may work on earlier versions).  It probably runs fine on CentOS 6.5+ but this is untested.


## Getting Started
### Prerequisites
This is a NodeJS project.  To run the Web-UI you need the following:
- git
- npm
- NodeJS
- A Particle cloud with attached LEDWax hardware and LED strips you can control (or the LEDWax emulator)
- A LEDWax-Web-UI (this) server configured for your Paticle Cloud (above).

You need git to clone this repository. You can get git from
[http://git-scm.com/](http://git-scm.com/).

You can also download this repository from github.  In this case you will need a file decompressor such as ZIP to unzip it.

LEDWax-Web-UI uses a number of node.js tools to initialize and test ledwax-web-ui. You must have node.js version 5 (v5) or higher and its package manager (npm) installed.  You can get them from [http://nodejs.org/](http://nodejs.org/).

This project is tested to work with NodeJS version 5 or higher.  Fortunately, Particle offers support for NodeJS v5, which means you can run this project and host a private particle cloud on a single RPi.

## Overview of Initial Setup

0. Setup a Particle Cloud or setup your account on the public Particle cloud.
1. Setup your LEDWax lights on your particle cloud.
2. Download or clone this repository and install the dependencies listed in prerequisites.
3. Configure the REST API for your Particle Cloud by running [TBD].  This will configure the settings in src/middleware/particle-config/
4. Run the application (npm start).  This will install the necessary dependencies.
5. Login to the Web-UI using your existing Particle Cloud login.
6. Setup and discover LEDWax devices on the Particle Cloud.
7. Control your LEDWax lights!

### Clone LEDWax Web UI
Clone this repository without commit history using [git][git]:

```bash
git clone --depth=1 https://github.com/tenaciouRas/ledwax-web-ui.git
cd ledwax-web-ui
```

The `depth=1` tells git to only pull down one commit worth of historical data.

If you want to start a new project based on ledwax-web-ui with the complete commit history then you can do:

```
git clone https://github.com/tenaciouRas/ledwax-web-ui.git
```

### LEDWax Particle Cloud Configuration
Configuration details for the particle cloud are stored in particle-config/index.js.  You need to set the HOST IP.  If you have a custom port you can set it in baseUrl.

``` javascript
{
	baseUrl : '[host-IP]',
	clientSecret : '[particle-cloud-client-secret]',
	clientId : '[particle-cloud-client-id]',
	tokenDuration : 7776000 // 90 days
}
```

NOTE:  I think the 'particle-api' is the default value for the public Particle Cloud clientSecret and clientId.  These values are set on the particle cloud when it is configured.

## Start/Run LEDWax-Web-UI REST API and Web-UI Servers
We have pre-configured LEDWax Web-UI with its own web server.  The simplest way to start this server is:

```bash
cd web-ui
npm start
```

Upon successful start you will see a message like:
```bash
LEDWax running in dev mode; using [hapi] server v15.2.0 running at: http://lsoft-linux-mint-17-3:8000, http://lsoft-linux-mint-17-3:3000
```

Now browse to the Web UI at `http://localhost:8000/app/index.html`.  You can verify the REST API is running by browsing to its heartbeat page at `http://localhost:3000/`.

### Start/Run in Development/Testing Modes
When using the LEDWax-Photon Vagrant VM, then the above command should be executed from within the VM, i.e. a vagrant ssh session.  Also, if using a Vagrant VM please see the section (below) installing dependencies.

### Execution Environment
The `LEDWAX_ENVIRO` variable is used by the application to infer the application configuration.  It can take the values `dev`, `test`, and `production`.  

## Contributing

This application is built upon the HapiJS framework.  The Web-UI is an AngularJS application.  The middleware is a pure REST backend with no UI.

### Directory Layout

```
src/
config/                   --> HapiJS app-configuration files
mongoose-config/          --> configuration for mongoose (unused)
particle-config/          --> configuration for Particle IoT Cloud (private/public server)
postgresql-config/        --> configuration for POSTGRES DB (active)
modules/                  --> middleware and web-ui sources
  middleware/             --> source files for REST API
    index.js              --> entry point for middleware app
  web-ui/                 --> source files for Web UI
    index.js              --> entry point for web-ui app
test/                     --> jasmine middleware tests
test-e2e/                 --> end-to-end web-ui tests
  protractor-conf.js      --> Protractor config file
  scenarios.js            --> end-to-end scenarios to be run by Protractor
karma.web.conf.js         --> config file for running Web UIunit tests with Karma
```

### Installing Dependencies

There are two kinds of dependencies in this project: tools and angular framework code.  The tools help
manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code and other HTML dependencies via `bower`, a [client-side code package manager][bower].

```bash
vagrant ssh
./scripts/install_deps.sh
```
Behind the scenes this will call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `app/bower_components` - contains the angular framework files

*The `bower_components` folder would normally be installed in the root folder but
LEDWax-Web-UI changes this location through the `.bowerrc` file.

**NOTE:  Unfortunately, due to issue https://github.com/bower/bower/issues/1492, you may ave problems trying to install all of the project dependencies from within a VM (if you're using that for development).  The above script is intended to take care of this for you, but if you have problems you may want to execute the following from the _VM host_ *before executing npm start*.  If you're not using a VM then npm start should do the trick for you.**

```bash
vagrant ssh
cd vagrant-host/web-ui
npm install
./node_modules/.bin/bower install
```

## Testing

Each module in this application has its own testing regimen.  All tests are to be executed from the project-root directory, so they can be run from an NPM and/or bash script.

There are two kinds of tests in the Web UI module: unit and end-to-end (E2E) tests.  Unit tests are run via karma.  E2E tests are run via protractor.  For the protractor e2e tests you will need a running REST API (middleware) module, and a particle cloud or an emulator.

The middleware has E2E tests which require a LEDWax Particle Photon Emulator or a access to a Particle Cloud.  The emulator simulates most/all aspects of the Particle IoT cloud server.

### Running Unit Tests

LEDWax Web UI comes with unit tests.  The unit tests are pure JavaScript unit tests against the Angular-JS Web-UI frontend.  These are written in [Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. A Karma
configuration file is provided to run them.

* the configuration is found at `karma.conf.js`
* the unit tests are found next to the code they are testing and are named as `..._test.js`.

The easiest way to run the Karma Web-UI unit tests is to use the supplied npm script:

```
npm run karma-test
```

This script will start the Karma test runner to execute the unit tests. Karma will monitor the source and test files for changes and then re-run the tests whenever any of them change. This is the recommended strategy; if your unit tests are being run every time you save a file then you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to check that a particular version of the code is operating as expected.  The project contains a predefined script to do this:

```
npm run karma-test-single-run
```


### End to end testing
LEDWax Web-UI comes with two kinds of end-to-end tests, again written in [Jasmine][jasmine] leveraging a [Protractor][protractor] End-to-End test runner.  Protractor uses native events and has special features for Angular applications.


* the configuration is found at `e2e-tests/protractor-conf.js`
* the end-to-end tests are found in `e2e-tests/*/scenarios.js`

#### First Time Setup - Protractor
Since Protractor is built upon Selenium WebDriver we need to install this.  LEDWax-WebUI comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone Selenium WebDriver tool.


#### Run protractor tests.
Protractor will launch a Firefox browser and load the LEDWax Web UI in a test configuration (eg. using emulator), then simulate actual user interaction such as typing and clicks.  Therefore the web server and emulator must be running so Protractor can run tests.  Again there are scripts to facilitate this.

```
vagrant ssh
cd vagrant-host/web-ui
npm run start-emulator
npm run start-protractor-web
```

The above commands can be run from a vagrant ssh session.  These commands will run the emulator and middleware+webui applications in the background.

NOTE:  You may need to wait 10-15 seconds or more for the emulator and web-ui applicaions to start.  Console output is (over)written to `vagrant-host/emulator/emulator.out` and `vagrant-host/web-u/web-ui.out`.  Monitor them by running the "tail" command.

You can point the tests at a Particle cloud server by editing `particle-config/index.js`.

Once you have ensured that the development web server hosting the app is up and running,
the web server serving the emulator is running, and WebDriver is updated, you can run 
the end-to-end tests using the supplied npm script.

- Login to the VM if you haven't done so already.
- Open a terminal (command line) from *within the VM
- Type the following command:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.

#### REST API E2E Tests
The REST API comes with a set of jasmine middleware test coverage.  The easiest way to run the jasmine middleware tests is to use the supplied npm script:

```
npm test
```

This can be run from a vagrant ssh session.

## Serving the Application Files

We recommend serving the project files using a local
webserver during development to avoid issues with security restrictions (sandbox) in browsers. The
sandbox implementation varies between browsers, but quite often prevents things like cookies, xhr,
etc to function properly when an html page is opened via `file://` scheme instead of `http://`.


### Running the App during Development

LEDWax Web UI comes preconfigured with a local development webserver.  It is a node.js
tool called [http-server][http-server].  You can start this webserver with `npm start` but you may choose to
install the tool globally (unnecessary):

```
sudo npm install -g http-server
```

Then you can start your own development web server to serve static files from a folder by
running:

```
http-server -a localhost -p 8000
```

Alternatively, you can choose to configure your own webserver, such as apache or nginx. Just
configure your server to serve the files under this `/` (project-root) directory.


### Running the App in Production

If you host the app with your own web server, you may need to figure
out what is the best way to host the static files to comply with the same origin policy if
applicable. Usually this is done by hosting the files by the backend server or through
reverse-proxying the backend server(s) and webserver(s).


## Continuous Integration

### Travis CI

Integration between Travis and GitHub is TBD.

## Contact

For more information on LEDWax Web UI and its tools please check out the following:

[git]: http://git-scm.com/
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[bower]: https://bower.io/
[protractor]: https://github.com/angular/protractor
[jasmine]: http://jasmine.github.io
[karma]: http://karma-runner.github.io
[http-server]: https://github.com/nodeapps/http-server
[travis]: https://travis-ci.org/
[hapijs]: http://hapijs.com/
[angularjs]: https://angularjs.org/
