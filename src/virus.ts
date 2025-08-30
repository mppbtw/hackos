import * as PIXI from "pixi.js"
import { TaskBar } from "./taskBar";
import { Window } from "./guiCore";

class VirusWindow extends PIXI.Container {
    background: PIXI.Graphics;
    image: PIXI.Sprite;
    
    constructor(image: string) {
        super();
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.image = new PIXI.Sprite(PIXI.textureFrom(image));
        this.image.width = 500;
        this.image.height = 500;
        this.addChild(this.image);
    }
}

function createVirusWindow(app: PIXI.Application, taskBar: TaskBar, x: number, y: number, image: string) {
    new Howl({src: "oops.mp3", autoplay: true});
    let virusContent =
        new VirusWindow(image);

    let virusWindow = new Window(
        virusContent,
        "You've been MELON'd",
        taskBar,
        "melonman.png",
        x,
        y
    );
    app.stage.addChild(virusWindow);
}

async function spawnCascade(
    app: PIXI.Application,
    taskBar: TaskBar,
    x: number,
    y: number,
    duration_ms: number,
    num_melons: number,
) {
    let windowGap = 40;
    for (let i=0; i<num_melons; i++) {
        createVirusWindow(app, taskBar, x + windowGap*i, y + windowGap*i, "melonman.jpeg");
        await new Promise(r => setTimeout(r, duration_ms/num_melons));
    }
}

async function spawnSpinny(app: PIXI.Application, taskBar: TaskBar) {
    let numMelons = 30;
    let r = 500;
    let o_x = window.innerWidth/2;
    let duration = 1000;
    let o_y = 0;
    let shift = 20;
    for (let i=0; i<numMelons*3; i++) {
        let angle = (2*Math.PI/numMelons) * i;
        let d_x = r * Math.sin(angle);
        let d_y = r * Math.cos(angle);
        createVirusWindow(app, taskBar, o_x + d_x - (i*shift), o_y + d_y, "melonman.jpeg");
        await new Promise(r => setTimeout(r, duration/numMelons));
    }
}

export async function runVirus(app: PIXI.Application, taskBar: TaskBar) {
    await spawnCascade(app, taskBar, 200, 200, 2000, 10);
    await new Promise(r => setTimeout(r, 1000));
    await spawnCascade(app, taskBar, 600, 600, 500, 10);
    await spawnCascade(app, taskBar, 600, 200, 500, 20);
    await spawnCascade(app, taskBar, 100, 0, 500, 25);
    await spawnCascade(app, taskBar, 800, 0, 500, 25);


    spawnSpinny(app, taskBar);
    await new Promise(r => setTimeout(r, 600));
    spawnSpinny(app, taskBar);
    await new Promise(r => setTimeout(r, 600));
    spawnSpinny(app, taskBar);
    await new Promise(r => setTimeout(r, 600));
    spawnSpinny(app, taskBar);
    await new Promise(r => setTimeout(r, 600));
    spawnSpinny(app, taskBar);

    await new Promise(r => setTimeout(r, 4000));
    createVirusWindow(app, taskBar, window.innerWidth*0.2, window.innerHeight*0.2, "meloncar.jpeg");
    new Howl({src: "oops.mp3", autoplay: true});

    await new Promise(r => setTimeout(r, 1000));
    window.location.href = "https://www.google.com/search?q=melon&sca_esv=2fdb4996cfdf24b0&hl=en-GB&source=hp&biw=1920&bih=959&ei=8DSuaO6ONcyckdUP5-nquAU&iflsig=AOw8s4IAAAAAaK5DAC8QZO0NAH9Hs7Fbg5vJ9uwHc7Fp&ved=0ahUKEwjuxsH6wqmPAxVMTqQEHee0GlcQ4dUDCA0&uact=5&oq=melon&gs_lp=EgNpbWciBW1lbG9uMggQABiABBixAzIIEAAYgAQYsQMyCxAAGIAEGLEDGIMBMggQABiABBixAzIIEAAYgAQYsQMyBRAAGIAEMgsQABiABBixAxiKBTIIEAAYgAQYsQMyBxAAGIAEGAoyCBAAGIAEGLEDSOMKUOYCWL0GcAB4AJABAJgBNKAB5AGqAQE1uAEDyAEA-AEBigILZ3dzLXdpei1pbWeYAgWgAqUCqAIAwgIOEAAYgAQYsQMYgwEYigWYAwiSBwE1oAfgF7IHATW4B6UCwgcHMi0yLjIuMcgHOg&sclient=img&udm=2";
}
