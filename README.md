## Установка окружения
1. Установка nodeenv
```
sudo pip install nodeenv
```
2. Установка локальной версии nodeJs и npm
```
nodeenv --node=14.19.0 --npm=6.14.16 env-14.19
```
3. Установка окружения 
```
. env-14.19/bin/activate
sudo npm install
```
4. Созбрать сервис
```
sudo npm run build
```

## Запуск
`env-14.19/bin/npm run start`


## Создание приложения как сервис (systemctrl)
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