import * as PIXI from "pixi.js"

const desktopShortcutWidth = 100;
const desktopShortcutRadius = 15;

export class Shortcut extends PIXI.Container {
    sprite: PIXI.Sprite;
    background: PIXI.Graphics;

    regularRender() {
        this.background.clear();
    }

    hoverOverRender() {
        this.background.clear();
        this.background
            .roundRect(0, 0, desktopShortcutWidth, desktopShortcutWidth, desktopShortcutRadius)
            .fill(new PIXI.Color("blue"));
    }

    constructor(spriteResource: string) {
        super();
        this.background = new PIXI.Graphics();
        this.regularRender();
        this.addChild(this.background);

        this.sprite = new PIXI.Sprite(PIXI.textureFrom(spriteResource));
        this.sprite.width = desktopShortcutWidth;
        this.sprite.height = desktopShortcutWidth;
        this.addChild(this.sprite);

        this.interactive = true;
        this.onmouseover = function() {
            this.hoverOverRender();
        };
        this.onmouseout = function() {
            this.regularRender();
        };
    }
}
