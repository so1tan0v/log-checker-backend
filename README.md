## About the application
This application is used to return available connections, retrieve the selected file, and send changes to the server.\
**Created for**: [log-checker-frontend](https://github.com/so1tan0v/log-checker-frontend)

## Minimum version of environment
**NodeJs**: v14.18.1\
**npm** 6.14.15

## Installation environment
If you want to use a virtual environment for **NodeJs**, then
1. Installation nodeenv
```
sudo pip install nodeenv
```
2. Installing a local version of NodeJs and npm
```
nodeenv --node=14.19.0 --npm=6.14.16 env-14.19
```
3. Installation environment
```
. env-14.19/bin/activate
sudo npm install
```

**ELSE**

1. Installation environment 
```
sudo npm install
```

## Build the application
```
sudo npm run build
```

## Start the application
If you want to use a virtual environment for **NodeJs**, then
```
env-14.19/bin/npm run start
```
**ELSE**
```
npm run start
```


## Creating a service configuration for systemd (systemctrl)
```
[Unit]
Description="Log Checked Service"

[Service]
Restart=always
Type=simple
WorkingDirectory=/var/www/html/log-checker/backend
ExecStart=/var/www/html/log-checker/backend/env-14.19/bin/node build/index.js

[Install]
WantedBy=multi-user.target
```