import * as PIXI from "pixi.js"

const desktopShortcutWidth = 50;

export class Shortcut extends PIXI.Container {
    sprite: PIXI.Sprite;
    background: PIXI.Graphics;

    constructor(spriteResource: string) {
        super();
        this.background = new PIXI.Graphics();
        this.addChild(this.background);

        this.sprite = new PIXI.Sprite(PIXI.textureFrom(spriteResource));
        this.sprite.width = desktopShortcutWidth;
        this.sprite.height = desktopShortcutWidth;
        this.addChild(this.sprite);

        this.interactive = true;
    }
}
