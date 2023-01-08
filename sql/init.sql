-- CREATE DATABASE im_server;

use im_server;

CREATE TABLE user(
    id INTEGER AUTO_INCREMENT,
    username VARCHAR(32) NOT NULL,
    nickname VARCHAR(32) NOT NULL,
    password VARCHAR(32) NOT NULL,
    PRIMARY KEY ( `id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_friend(
    id INTEGER AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    PRIMARY KEY ( `id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_friend_chat(
    id INTEGER AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    friend_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ( `id` )
)ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
