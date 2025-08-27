import * as PIXI from "pixi.js"
import { taskBarHeight } from "./constants"
import { Window } from "./guiCore";

const taskBarColor = new PIXI.Color("blue");
const taskBarAccentColorLight = new PIXI.Color("1a8cff");
const taskBarAccentColorLighter = new PIXI.Color("99ccff");
const taskBarIconRadius = 0;

const taskBarIconPadding = 25;

var taskBarIconIdCounter = 0;

export function TaskBarIconFromWindow(win: Window) {
    let newIcon = new TaskBarIcon(win.icon.spriteResource);
    newIcon.onclick = function() {win.toggleMinimized()};
    return newIcon
}

class TaskBarClock extends PIXI.Container {
    text: PIXI.Text;
    background: PIXI.Graphics;
    border: PIXI.Graphics;

    updateTime() {
        this.text.text =
            new Date().toLocaleTimeString("en-GB")
            + "  " + new Date().toLocaleDateString("en-GB");
    }

    drawBorders() {
        this.border.clear();
        this.border.moveTo(-10, -5);
        this.border.lineTo(this.width-10, -5);
        this.border.lineTo(this.width-10, this.height-5);
        this.border.lineTo(-10, this.height-5);
        this.border.lineTo(-10, -5);
        this.border.stroke({
            color: 0,
            width: 3,
        });
        this.removeChild(this.border);
        this.addChild(this.border);
    }

    constructor() {
        super();
        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.text = new PIXI.Text({
            text: "",
        })
        this.updateTime();
        let t = this;
        setInterval(function() {
            t.updateTime();
        }, 1000);
        this.text.style.fill = new PIXI.Color("white");
        this.text.style.fontFamily = "sans-serif";
        this.addChild(this.text);

        this.background
            .roundRect(-10, -5, this.width+20, this.height+10, taskBarIconRadius)
            .fill(taskBarAccentColorLight);

        this.border = new PIXI.Graphics();
        this.addChild(this.border);
        this.drawBorders();
    }
}

export class TaskBarIcon extends PIXI.Container {
    sprite: PIXI.Sprite;
    background: PIXI.Graphics;
    id: number | undefined;
    minimized: boolean = false;

    regularRender() {
        this.background.clear();

        let rect = this.background
            .roundRect(0, 0, this.width, this.height, taskBarIconRadius)

        if (this.minimized) {
            rect.fill(taskBarColor);
        } else {
            rect.fill(taskBarAccentColorLight);
        }
    }

    hoverOverRender() {
        this.background.clear();
        let rect = this.background.roundRect(0, 0, this.width, this.height, taskBarIconRadius);
        if (this.minimized) {
            rect.fill(taskBarAccentColorLight);
        } else {
            rect.fill(taskBarAccentColorLighter);
        }
    }

    constructor(spriteResource: string) {
        super();

        this.background = new PIXI.Graphics();
        this.addChild(this.background);
        this.regularRender();
        this.interactive = true;

        this.onmouseover = function() {
            this.hoverOverRender();
        }

        this.onmouseleave = function() {
            this.regularRender();
        }

        this.sprite = new PIXI.Sprite(PIXI.textureFrom(spriteResource));
        this.sprite.height = taskBarHeight;
        this.sprite.width = taskBarHeight;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.addChild(this.sprite);
    }
}

export class TaskBar extends PIXI.Container {
    background: PIXI.Graphics;
    hackOsIcon: TaskBarIcon;
    icons: TaskBarIcon[] = [];
    clock: TaskBarClock;
    border: PIXI.Graphics;

    innerHeight: number;

    drawBorders() {
        this.border.clear()
        this.border.moveTo(0,0);
        this.border.lineTo(0, this.height);
        this.border.lineTo(this.width, this.height);
        this.border.lineTo(this.width, 0);
        this.border.lineTo(0,0);

        this.border.moveTo(this.hackOsIcon.width, 0);
        this.border.lineTo(this.hackOsIcon.width, this.hackOsIcon.height);

        for (let i=0; i<this.icons.length; i++) {
            this.border.moveTo(this.icons[i].x, 0);
            this.border.lineTo(this.icons[i].x, this.icons[i].height);

            this.border.moveTo(this.icons[i].x+this.icons[i].width, 0);
            this.border.lineTo(this.icons[i].x+this.icons[i].width, this.icons[i].height);
        }

        this.border.stroke({
            color: 0,
            width: 4,
        })
        this.removeChild(this.border);
        this.addChild(this.border);
    }

    toggleMinimizeIcon(id: number) {
        for (let i=0; i<this.icons.length; i++) {
            if (this.icons[i].id == id) {
                this.icons[i].minimized = !this.icons[i].minimized;
            }
        }
    }

    reorganize() {
        let newIcons = new Array();
        for (let i=0; i<this.icons.length; i++) {
            if (this.icons[i] != undefined) {
                newIcons.push(this.icons[i])
            }
        }
        this.icons = newIcons;
        for (let i=0; i<this.icons.length; i++) {
            this.icons[i].x = taskBarHeight * (1+i)
            + (2 + i)*taskBarIconPadding;
        }
        this.drawBorders();
    }

    addIcon(icon: TaskBarIcon) {
        icon.x = taskBarHeight * (1+this.icons.length)
            + (2 + this.icons.length)*taskBarIconPadding;
        this.icons.push(icon);
        this.addChild(icon);
        icon.regularRender();
        this.reorganize();

        taskBarIconIdCounter += 1;
        icon.id = taskBarIconIdCounter;
        return icon.id;
    }

    removeIcon(iconId: number) {
        for (let i=0; i<this.icons.length; i++) {
            if (this.icons[i].id == iconId) {
                this.removeChild(this.icons[i]);
                delete this.icons[i];
            }
        }
        this.reorganize();
    }

    constructor() {
        super();
        this.background = new PIXI.Graphics();
        this.background
            .rect(0, 0, window.innerWidth, taskBarHeight)
            .fill(taskBarColor);
        this.addChild(this.background);

        this.hackOsIcon = new TaskBarIcon("start.png");
        this.hackOsIcon.sprite.width =taskBarHeight*1.4;
        this.hackOsIcon.regularRender();
        this.addChild(this.hackOsIcon);

        this.clock = new TaskBarClock();
        this.clock.x = window.innerWidth-this.clock.width - 15;
        this.clock.y = (0.5*taskBarHeight) - (0.5*this.clock.height) + 5;
        this.addChild(this.clock);

        this.innerHeight = this.height;
        console.log(this.height);
        
        this.border = new PIXI.Graphics();
        this.drawBorders();
    }
}
