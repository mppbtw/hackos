import * as PIXI from "pixi.js"
import {
    notificationWindowColor,
} from "./constants";

class SearchBar extends PIXI.Container {
    background: PIXI.Graphics;
    text: PIXI.Text;
    wwidth: number;
    hheight: number;

    constructor(wwidth: number, hheight: number) {
        super();
        this.wwidth = wwidth;
        this.hheight = hheight;
        this.background = new PIXI.Graphics();
        this.background.rect(0, 0, wwidth, hheight).fill(new PIXI.Color("blue"));
        this.addChild(this.background);
        this.text = new PIXI.Text({text: "🔍  happyfun.com"});
        this.addChild(this.text);
    }
}

export class Browser extends PIXI.Container {
    background: PIXI.Graphics;
    searchbar: PIXI.Container;
    wwidth: number;
    hheight: number;

    constructor() {
        super();
        this.wwidth = 800;
        this.hheight = 500;

        this.background = new PIXI.Graphics();

        this.addChild(this.background);

        this.background
        .rect(0, 0, this.wwidth, this.hheight)
        .fill(notificationWindowColor);

        this.searchbar = new SearchBar(this.wwidth, 30);
        this.addChild(this.searchbar);
    }
}
