import * as PIXI from "pixi.js"

export async function showLoadingScreen(app: PIXI.Application) {
    let bg = new PIXI.Graphics()
    .rect(0, 0, window.innerWidth, window.innerHeight)
    .fill(0);
    let logo = new PIXI.Sprite(PIXI.textureFrom("hacker.png"))
    logo.x = (0.5*window.innerWidth) - (0.5*logo.width);
    logo.y = (0.5*window.innerHeight) - (0.5*logo.height);

    let barWidth = 200;
    let barHeight = 20;
    let barProgress = 0.0;


    let bar = new PIXI.Graphics();

    bar.x = window.innerWidth*0.5 - barWidth*0.5;
    bar.y = window.innerHeight*0.7;

    function updateBar() {
        bar.rect(
            0,
            0,
            barWidth*barProgress,
            barHeight,
        ).fill(new PIXI.Color("green"));
        bar.moveTo(0,0);
        bar.lineTo(barWidth, 0);
        bar.lineTo(barWidth, barHeight);
        bar.lineTo(0, barHeight);
        bar.lineTo(0, 0);
        bar.stroke({
            color: new PIXI.Color("white"),
            width: 4,
        });
    }
    updateBar();

    app.stage.addChild(bg);
    app.stage.addChild(logo);
    app.stage.addChild(bar);

    let sound = new Howl({src: "startup.mp3", autoplay: true});
    sound.play();
    
    let numBarTicks = 50;
    for (let i=0; i<numBarTicks; i++) {
        await new Promise(r => setTimeout(r, (sound.duration()*1000)/numBarTicks));
        barProgress += 1/numBarTicks;
        updateBar();
    }
    await new Promise(r => setTimeout(r, 500));
    app.stage.removeChild(bar);
    app.stage.removeChild(bg);
    app.stage.removeChild(logo);
}
