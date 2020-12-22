import { Game } from './Game.js';
let gameDiv = document.getElementById('gameDiv');
let app;

window.onload = function() {
    // Check whether webgl is supported
    let type = "WebGL"
    if(!PIXI.utils.isWebGLSupported()){
      type = "canvas"
    }
    PIXI.utils.sayHello(type);

    // Initialize pixi app
    app = new PIXI.Application({
        width: 1000,
        height: 800,
        autoResize: true,
        backgroundColor: 0xFFFFFF
    });
    app.view.id = "canvas";
    app.view.style = 'position: relative';
    gameDiv.prepend(app.view);
    

    // Preload image assets
    app.loader.baseUrl = 'img';
    app.loader.add('player', 'player.png')
              .add('spike', 'spike.png')
              .add('food-green', 'food-green.png')
              .add('food-yellow', 'food-yellow.png')
              .add('food-red', 'food-red.png')
              .add('food-blue', 'food-blue.png')
              .add('food-purple', 'food-purple.png');
    app.loader.onProgress.add(showProgress);
    app.loader.onComplete.add(doneLoading);
    app.loader.onError.add(reportError);

    const bgTexture = new PIXI.Texture(PIXI.Texture.from('/img/map1.png'),
                      new PIXI.Rectangle(0, 0, 4008, 4008));
    const bg = new PIXI.Sprite(bgTexture);
    bg.anchor.x = 0;
    bg.anchor.y = 0;
    bg.position.x = 0;
    bg.position.y = 0;
    app.stage.addChild(bg);

    app.loader.load();

    
    function showProgress(e) {
        console.log(e.progress);
    }

    function reportError(e, l, r) {
        console.error('ERROR: ' + e.message);
        console.log("LOADER: ");
        console.log(l);
        console.log("RESOURCE: ");
        console.log(r);
    }

    function doneLoading(e) {
        console.log("Done loading!");

        new Game(app);
    }
}
