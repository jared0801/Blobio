# Blobio
This is Blobio, a clone of the classic game [agar.io](agar.io) where players compete to become the largest blob in the game by eating food and, once their big enough, other players.

To run the server you will need [Node.js](https://nodejs.org/en/) and [TypeScript](https://www.typescriptlang.org/) installed.

## Install
To setup the environment you will first need to install the node dependencies
```
npm i
```

Then create a file in the root project directory named '.env' and enter the following:
```
DB_PATH=mongodb+srv://user:pass@host.azure.mongodb.net/dbName
PORT=5000
```

You will need to create your own [MongoDB](https://www.mongodb.com/) instance, as the one above is just an example.

Now everything should be ready to go. Type:
```
npm run build
```
to compile the typescript and
```
npm run start
```
to start the server.


Alternatively, you can start the server in dev mode with nodemon.
This allows the server to watch and recompile live when changes are made to the typescript source code
```
npm run dev
```