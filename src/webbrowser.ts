import * as PIXI from "pixi.js"
import {
    notificationWindowColor,
} from "./constants";

class SearchBar extends PIXI.Container {
    background: PIXI.Graphics;
    public text: PIXI.Text;
    wwidth: number;
    hheight: number;

    changePage(txt: string) {
        this.text.text = "🔍  |" + txt;
    }

    constructor(wwidth: number, hheight: number) {
        super();
        this.wwidth = wwidth;
        this.hheight = hheight;
        this.background = new PIXI.Graphics();
        this.background.rect(0, 0, wwidth, hheight).fill(new PIXI.Color("blue"));
        this.addChild(this.background);
        this.text = new PIXI.Text({text: "🔍  |"});
        this.text.interactive = true;
        this.addChild(this.text);
    }
}

export class Browser extends PIXI.Container {
    background: PIXI.Graphics;
    searchbar: SearchBar;
    wwidth: number;
    hheight: number;
    current_source: string = "";

    onChangePage() {}
    changePage(newPage: string) {
        this.searchbar.changePage(newPage);
        this.current_source = newPage;
    }

    constructor() {
        super();
        this.wwidth = 800;
        this.hheight = 500;

        this.background = new PIXI.Graphics();

        this.addChild(this.background);

        this.background
        .rect(0, 0, this.wwidth, this.hheight)
        .fill(notificationWindowColor);

        this.searchbar = new SearchBar(this.wwidth, 50);
        this.addChild(this.searchbar);
        this.searchbar.interactive = true;
        this.searchbar.text.onclick = (_) => {
            let url = prompt("URL:") ?? "";
            if (!url.startsWith("http")) {
                url = "https://" + url;
            }
            this.changePage(url);
            this.onChangePage();
        };
    }
}
