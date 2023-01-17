# im
![image](https://raw.githubusercontent.com/Tzdy/imgstorage/master/im/demo.png)

## Introduction
Vue2.7 + Express + WebSocket + Mysql

1. 登录/注册
2. 发送文本/图片/文件

## Usage

``` bash
git clone https://github.com/Tzdy/im.git
cd im
npm install
```

然后根据`.env`模版，在项目根目录创建一个`.env.local`填写自己的配置。

``` bash 例子
# .env.local

# front
# 前端部署根路径。/ or /blog/
VUE_ROOT=/
# axios请求的baseUrl
VUE_BASE=http://localhost:20001/
# websocket的url
VUE_WS_URL=ws://localhost:20001/ws
# 开发环境启动前端静态服务器的端口
VUE_PORT=8081

# back

# api的根路径。/api
SERVER_BASE=/
# 后端服务器端口
SERVER_PORT=20001
# 后端websocket的根路径。/ws
SERVER_WS_ROOT=/ws
# db
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USERNAME=root
MYSQL_PASSWORD=123456
MYSQL_DATABASE=im_server
# jwt
JWT_SECRET=sadadasdeqqwfqfw
# upload 文件传输存放路径
UPLOAD_PATH=/Users/mac/Documents/web/server/gogs/im-server/upload
```
填写完配置后。
``` bash
npm run start
```
