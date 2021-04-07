# Blobio
This is Blobio, a clone of the classic game [agar.io](agar.io) where players compete to become the largest blob in the game by eating food and, once their big enough, other players.

To run the server you will need [Node.js](https://nodejs.org/en/) and [TypeScript](https://www.typescriptlang.org/) installed.

## Install
To setup the environment you will first need to install the node dependencies
```
npm i
```

By default the project will run on port 5000, to change this you can create a file in the root directory named '.env.' and enter a custom port like this:
```
PORT=3000
```

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