# Blobio
This is Blobio, a clone of the classic game [agar.io](agar.io) where players compete to become the largest blob in the game by eating food and, once their big enough, other players.

To run the server you will need [Node.js](https://nodejs.org/en/) installed and to edit the source files you will need [TypeScript](https://www.typescriptlang.org/) as well.

## Install
To setup the environment you will first need to install the node dependencies for the server
```
cd server/
npm i
```

Now everything should be ready to go. In the server folder type
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