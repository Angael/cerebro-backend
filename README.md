## Description

Nest backend for cerebro project.

## Installation

```js
yarn install
```

## Development

Pull and run docker sql image with command
```js
docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=cerebro -d mysql:latest
```

then

```js
yarn start:dev
```