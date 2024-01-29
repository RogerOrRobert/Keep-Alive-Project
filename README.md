
# Container Management Web Interface

## Introduction

This project provides a web interface for managing containers and miners using [pm2](https://pm2.keymetrics.io/). The web interface allows users to view and control the status of containers, including starting, stopping, and restarting. Additionally, it provides functionality to save and enable/disable configurations for enhanced control and monitoring.

## Features

- **Real-time Status Display**: View the real-time status of containers and miners, including whether they are stopped or online.
- **Action Buttons**: Execute actions like starting, stopping, and restarting containers. Tail logs to monitor container activities.
- **Configuration Saving**: Save the current configuration of containers and miners.
- **Enable/Disable Containers**: Enable or disable containers individually for better control.

## Prerequisites

Before running this application, ensure that the following dependencies are installed:

- [Node.js](https://nodejs.org/)
- [pm2](https://pm2.keymetrics.io/)

## Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/RogerOrRobert/Keep-Alive-Project.git
    cd Keep-Alive-Project
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Start the application using pm2:

    ```bash
    pm2 start ecosystem.config.js
    ```

## Usage

Access the web interface by navigating to `http://localhost:<PORT>` in your web browser, where `<PORT>` is the specified port in the pm2 ecosystem configuration.

The interface displays a table with information about each container and miner. You can perform various actions, such as starting, stopping, and restarting containers. Additionally, you can save the current configuration and enable/disable individual containers.

## Configuration

### pm2 Ecosystem Configuration

Ensure that you have configured your pm2 ecosystem file (typically `ecosystem.config.js`) to correctly manage your application. The provided scripts assume the usage of pm2 for process management.

### Web Interface Configuration

- The interface relies on [Socket.IO](https://socket.io/) for real-time updates. Ensure that the Socket.IO server is correctly configured and connected.

## Troubleshooting

If you encounter any issues or errors during the installation or usage of this web interface, please refer to the following steps:

1. Check the console output for any error messages.
2. Review the pm2 logs for detailed information.

## License

This project is licensed under the [MIT License](LICENSE).

Feel free to contribute, report issues, or suggest improvements. Happy container management!

