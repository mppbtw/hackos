import * as PIXI from "pixi.js"
import {
    notificationWindowColor,
} from "./constants";


export class ImageViewer extends PIXI.Container {
  background: PIXI.Graphics;
  image: PIXI.Sprite;

  constructor(imgResource: string) {
    super();
    this.image = new PIXI.Sprite(PIXI.textureFrom(imgResource));
    this.image.width = 500;
    this.image.height = 500;

    this.background = new PIXI.Graphics();

    this.addChild(this.background);
    this.addChild(this.image);


    this.background
      .rect(0, 0, this.width, this.height)
      .fill(notificationWindowColor);
  }
}

const playerBarCircleRadius = 10;

class PlayerBar extends PIXI.Container {
    bar: PIXI.Graphics;
    circle: PIXI.Graphics;
    scrollPosition: number = 0;
    dragged: boolean = false;
    pause: Function;
    play: Function;

    renderCircle() {
        this.circle.clear();

        this.circle
            .circle(
                10 + (this.scrollPosition*(this.bar.width-playerBarCircleRadius*2)),
                6,
                playerBarCircleRadius+4
            )
            .fill(new PIXI.Color("black"));

        this.circle
            .circle(
                10 + (this.scrollPosition*(this.bar.width-playerBarCircleRadius*2)),
                6,
                playerBarCircleRadius
            )
            .fill(new PIXI.Color("gray"));
    }

    renderHoverCircle() {
        this.circle.clear();

        this.circle
            .circle(
                10 + (this.scrollPosition*(this.bar.width-playerBarCircleRadius*2)),
                6,
                playerBarCircleRadius+4
            )
            .fill(new PIXI.Color("black"));

        this.circle
            .circle(
                10 + (this.scrollPosition*(this.bar.width-playerBarCircleRadius*2)),
                6,
                playerBarCircleRadius
            )
            .fill(new PIXI.Color("lightgray"));

        let t = this;
        this.circle.interactive = true;
        this.circle.onmousedown = function() {
            t.dragged = true;
            t.pause();
        }
        document.addEventListener("mouseup", function(event) {
            t.handleMouseUp(event);
        });
        document.addEventListener("mousemove", function(event) {
            if (t.dragged)
                t.handleMouseMove(event);
        });
    }

    handleMouseMove(event: MouseEvent) {
        let d_x = event.x - this.bar.getGlobalPosition().x;
        let scrollPosition = d_x / this.bar.width;
        scrollPosition = Math.min(1, scrollPosition);
        scrollPosition = Math.max(0, scrollPosition);
        this.scrollPosition = scrollPosition;
        if (this.circle.containsPoint(new PIXI.Point(event.x, event.y))) {
            this.renderHoverCircle();
        } else {
            this.renderCircle();
        }
    }

    handleMouseUp(_event: MouseEvent) {
        if (this.dragged) {
            this.play()
        }
        this.dragged = false;

    }

    onDestroyed() {
        document.removeEventListener("mouseup", this.handleMouseUp);
        document.removeEventListener("mousemove", this.handleMouseMove);
    }

    constructor(play: Function, pause: Function) {
        super();
        this.play = play;
        this.pause = pause;
        this.bar = new PIXI.Graphics();
        this.bar.roundRect(-2,-2,504, 14, 12).fill(new PIXI.Color("black"));
        this.bar.roundRect(0,0,500, 10, 10).fill(new PIXI.Color("lightgray"));
        this.addChild(this.bar);

        this.circle = new PIXI.Graphics();
        this.addChild(this.circle);
        this.renderCircle();

        let t = this;
        this.circle.interactive = true;
        this.circle.onmouseover = function() {
            t.renderHoverCircle();
        }
        this.circle.onmouseleave = function() {
            t.renderCircle();
        }
    }
}

class MediaButtons extends PIXI.Container {
    playbutton: Playbutton;
    togglePause: Function

    constructor(togglePause: Function) {
        super();
        this.togglePause = togglePause;
        this.playbutton = new Playbutton();
        this.addChild(this.playbutton);
        this.playbutton.interactive = true;
        let t = this;
        this.playbutton.onclick = function() {
            t.togglePause();
        }
    }
}

class Playbutton extends PIXI.Container {
    symbol: PIXI.Graphics;
    background: PIXI.Graphics;
    buttonWidth: number = 50;
    borderThickness: number = 2;
    playing: boolean = false;
    hovering: boolean = false;

    pause() {
        this.playing = false;
        if (this.hovering) {
            this.hoverOverRender();
        } else {
            this.regularRender();
        }
    }

    play() {
        this.playing = true;
        if (this.hovering) {
            this.hoverOverRender();
        } else {
            this.regularRender();
        }
    }

    createPlayButton(): PIXI.Graphics {
        if (this.playing) {
            let padding = 10;
            return this.symbol
                .rect(padding, padding, padding, this.height-(2*padding))
                .rect(this.width-(padding*2), padding, 10, this.height-(2*padding));
        } else {
            return this.symbol
                .regularPoly(this.width/2, this.height/2, 20, 3, Math.PI/2);
        }
    }

    regularRender() {
        this.hovering = false;
        this.background.clear();
        this.background
            .rect(0, 0, this.buttonWidth, this.buttonWidth)
            .fill(new PIXI.Color("black"));
        this.background
            .rect(
                this.borderThickness,
                this.borderThickness,
                this.buttonWidth - 2*this.borderThickness,
                this.buttonWidth - 2*this.borderThickness,
            )
            .fill(new PIXI.Color("lightgray"));
        this.symbol.clear();
        this.createPlayButton().fill(new PIXI.Color("black"));
    }

    hoverOverRender() {
        this.hovering = true;
        this.background.clear();
        this.background
            .rect(0, 0, this.buttonWidth, this.buttonWidth)
            .fill(new PIXI.Color("black"));
        this.background
            .rect(
                this.borderThickness,
                this.borderThickness,
                this.buttonWidth - 2*this.borderThickness,
                this.buttonWidth - 2*this.borderThickness,
            )
            .fill(new PIXI.Color("gray"));
        this.symbol.clear();
        this.createPlayButton().fill(new PIXI.Color("lightgray"));
    }

    constructor() {
        super();
        this.symbol = new PIXI.Graphics();
        this.background = new PIXI.Graphics();
        this.interactive = true;
        this.addChild(this.background);
        this.addChild(this.symbol);
        this.regularRender();
        this.onmouseover = this.hoverOverRender;
        this.onmouseleave = this.regularRender;
    }
}

export class MusicPlayer extends PIXI.Container {
  background: PIXI.Graphics;
  audioResource: string;
  playerBar: PlayerBar;
  playing: boolean = false;
  mediaButtons: MediaButtons;

  onDestroyed() {
      this.playerBar.onDestroyed();
  }

  play() {
      this.playing = true;
      this.mediaButtons.playbutton.play();
      console.log("playing video!");
  }

  pause() {
      this.playing = false;
      console.log("media:", this.mediaButtons);
      console.log("this:", this);
      console.log("button:", this.mediaButtons.playbutton);
      console.log("pausing video!");
      this.mediaButtons.playbutton.pause();
  }

  constructor(audioResource: string) {
    super();
    this.background = new PIXI.Graphics();
    this.addChild(this.background);

    let t = this;
    this.playerBar = new PlayerBar(function () {
        t.play();
    }, function() {
        t.pause();
    });
    this.playerBar.x = 50;
    this.playerBar.y = 50;
    this.addChild(this.playerBar);

    this.mediaButtons = new MediaButtons(function() {
        if (t.playing) {
            t.pause();
        } else {
            t.play();
        }
    });
    this.mediaButtons.x = 0.5*(this.width-this.mediaButtons.width);
    this.mediaButtons.y = this.height + 50;
    this.addChild(this.mediaButtons);

    this.audioResource = audioResource;

    this.background
      .rect(0, 0, this.width+100, this.height+100)
      .fill(notificationWindowColor);
  }
}

