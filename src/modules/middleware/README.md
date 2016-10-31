# LEDWax Web UI Backend (REST API)
A web-based controller for LEDWax IoT hardware.  This is the LEDWax REST API module.  This provides a REST API (backend) for controlling LEDWax Particle Photon devices.  This API interacts directly with the Particle Cloud (public or private).  Therefore it must be configured to connect with the Particle cloud server to send commands.

## Getting Started

This repository is not intended for standlone development.  You should check out LEDWax Web UI, which contains this project as a git-submodule.  Unlike the frontend, there is no way to run this application without the configuration dependencies that are contained in the parent repository.

## API Documentation
This is a WIP.  The documentation framework curently established is Doxygen but there is no build task defined to generate middleware API documentation yet.

## Architecture

### Motivation

The primary motivation for the REST API is to provide an abstraction layer for the LEDWax Web UI Frontend (web-ui).  This enables de-coupling of user-management from the Particle cloud.

### User Management
The user-management provided by the REST API is intended to be minimal.  Only OAuth tokens are stored from the Particle Cloud, there are no stored passwords.

To provide its own user management the REST API relies on a POSTGRES database.  This database stores OAuth tokens it receives from the cloud along with username, and records events such as last login.

### Particle Cloud Support
The REST API is designed to work with local (private) and public Particle Cloud infrastructure.  This is done by configuring the application to point at the appropriate Particle Cloud server IP address.

The application architecture is designed to support multiple Particle Clouds, however the configuration and Web UI only support a single cloud host, so this is not currently a usable feature.

### Particle Cloud Configuration
The particle cloud configuration values, such as the host IP, are obtained from this project's dependencies, contained in the parent repository.

### POSTGRES DB Configuration
The POSTGRES SQL DB configuration values, such as the host IP, database username, password, etc., are obtained from this project's dependencies, contained in the parent repository.

### REST API Application Architecture
The REST API is built upon HAPIJS using a MVC architecture.  However, since there is effectively no frontend, it serves responses from the controllers, effectively making the architecture MVVM.

Database access is abstracted through the excellent Sequelize ODM library for NodeJS.  This provides database schema generation and object modeling.

