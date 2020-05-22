let chatText = document.getElementById('chatText');
let chatInput = document.getElementById('chatInput');
let chatForm = document.getElementById('chatForm');

let signInDiv = document.getElementById('signDiv');
let gameDiv = document.getElementById('gameDiv');
let signInBtn = document.getElementById('signDiv-signIn');
let signInName = document.getElementById('signDiv-name');

let topScores = document.getElementById('topScores');

export class UI {
    static container = new PIXI.Container();
    constructor(socket) {
        // Score text
        let scoreText = new PIXI.Text("Mass: ");
        let scoreBg = new PIXI.Sprite(PIXI.Texture.WHITE);
        this.socket = socket;
        scoreBg.width = scoreText.width;
        scoreBg.height = scoreText.height;
        this.scoreCage = new PIXI.Container();
        this.scoreCage.addChild(scoreBg, scoreText);
        this.scoreCage.name = "PlayerScore";
        this.scoreCage.scoreText = scoreText;
        this.scoreCage.scoreBg = scoreBg;
        UI.container.addChild(this.scoreCage);

        this.enterGame();

        this.chatEvents();
    }

    moveScore(x, y) {
        this.scoreCage.x = x;
        this.scoreCage.y = y;
    }

    changeScore(text) {
        this.scoreCage.scoreText.text = text;
        this.scoreCage.scoreBg.width = this.scoreCage.scoreText.width;
    }

    enterGame() {
        signInBtn.onclick = () => {
            this.socket.emit('signIn', { name: signInName.value });
        }
        signInName.onkeydown = e => {
            if(e.keyCode === 13) {
                this.socket.emit('signIn', { name: signInName.value });
            }
        }

        this.socket.on('signInResponse', data => {
            if(data.success) {
                signInDiv.style.display = 'none';
                gameDiv.style.opacity = '1';
            } else {
                alert('That name is currently taken. Try another one!');
            }
        });
    }

    chatEvents() {
        this.socket.on('addToChat', data => {
            chatText.innerHTML += '<div>' + data + '</div>';
            chatText.scrollTop = chatText.scrollHeight;
        });

        chatForm.onsubmit = e => {
            e.preventDefault();
            this.socket.emit('sendMsgToServer', chatInput.value);
            chatInput.value = '';
        }
    }

    updateTopScores(scores) {
        topScores.innerHTML = '';
        scores.forEach(score => {
            topScores.innerHTML += '<div>' + score.name + ': ' + score.score + '</div>';
        })
    }
}