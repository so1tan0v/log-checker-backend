## О приложении
Данное приложение служит для того, чтобы возвращать доступные подключения, получать выбранный файл и отправлять изменения на сервер.\
**Разработан для**: [log-checker-frontend](https://github.com/so1tan0v/log-checker-frontend)

## Минимальная версия окружения
**NodeJs**: v14.18.1\
**npm** 6.14.15

## Установка окружения
Если вы хотите использовать виртуальное окружение для **NodeJs**, то
1. Установка nodeenv
```
pip install nodeenv
```
2. Установка локальной версии nodeJs и npm
```
nodeenv --node=14.19.0 --npm=6.14.16 env-14.19
```
3. Установка окружения 
```
. env-14.19/bin/activate
npm install
```

**ИНАЧЕ**

1. Установка окружения 
```
npm install
```

## Сборка приложения
```
npm run build
```


## Запуск приложения
Если вы хотите использовать виртуальное окружение для **NodeJs**, то
```
env-14.19/bin/npm run start
```
**ИНАЧЕ**
```
npm run start
```


## Создание конфигурации для сервиса systemd (systemctrl)
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