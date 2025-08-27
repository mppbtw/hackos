import * as PIXI from "pixi.js"
import {
  UIButtonWidth,
  top_bar_height,
  windowBarColor,
  buttonWidth,
  buttonHeight,
  buttonBorderThickness,
}
  from "./constants.ts"
import { TaskBar, TaskBarIconFromWindow } from "./taskBar.ts";

const baselineWindowPosX = 250;
const baselineWindowPosY = 250;

var defaultWindowPosX = baselineWindowPosX;
var defaultWindowPosY = baselineWindowPosY;

class CloseButton extends PIXI.Container {
  symbol: PIXI.Graphics;
  backdrop: PIXI.Graphics;

  regularRender() {
    this.backdrop.clear();
    this.backdrop
      .rect(0, 0, UIButtonWidth, UIButtonWidth)
      .fill(windowBarColor);
  }

  hoverOverRender() {
    this.backdrop.clear();
    this.backdrop
      .rect(0, 0, UIButtonWidth, UIButtonWidth)
      .fill(new PIXI.Color("white"));
  }

  constructor() {
    super();

    this.backdrop = new PIXI.Graphics();
    this.regularRender();
    this.addChild(this.backdrop);

    this.interactive = true;
    this.onmouseover = function() {
      this.hoverOverRender();
    };
    this.onmouseleave = function() {
      this.regularRender();
    };
    
    this.symbol = new PIXI.Graphics();

    this.symbol.moveTo(UIButtonWidth*0.2, UIButtonWidth*0.2);
    this.symbol.lineTo(UIButtonWidth*0.8, UIButtonWidth*0.8);

    this.symbol.moveTo(UIButtonWidth*0.2, UIButtonWidth*0.8);
    this.symbol.lineTo(UIButtonWidth*0.8, UIButtonWidth*0.2);

    this.symbol.stroke({
      width: 3,
      color: 0,
    });

    this.addChild(this.symbol);
  }
}

class MinimizeButton extends PIXI.Container {
  backdrop: PIXI.Graphics;
  symbol: PIXI.Graphics;

  regularRender() {
    this.backdrop.clear()
    this.backdrop
      .rect(0, 0, UIButtonWidth, UIButtonWidth)
      .fill(windowBarColor);
  }

  hoverOverRender() {
    this.backdrop.clear()
    this.backdrop
      .rect(0, 0, UIButtonWidth, UIButtonWidth)
      .fill(new PIXI.Color("white"));
  }

  constructor() {
    super();
    
    this.interactive = true;

    this.onmouseover = function() {
      this.hoverOverRender();
    };
    this.onmouseleave = function() {
      this.regularRender();
    }
    this.backdrop = new PIXI.Graphics();
    this.regularRender();
    this.addChild(this.backdrop);

    this.symbol = new PIXI.Graphics();
    this.symbol.moveTo(UIButtonWidth*0.2, (UIButtonWidth*0.5)-1);
    this.symbol.lineTo(UIButtonWidth*0.8, (UIButtonWidth*0.5)-1);
    this.symbol.stroke({
      width: 3,
      color: 0,
    });
    this.addChild(this.symbol);
  }
}

class UIButtons extends PIXI.Container {
  minimize: MinimizeButton;
  close: CloseButton;
  border: PIXI.Graphics;

  constructor() {
    super();
    this.minimize = new MinimizeButton();
    this.close = new CloseButton();
    this.close.x += this.minimize.width;
    this.addChild(this.minimize);
    this.addChild(this.close);

    this.border = new PIXI.Graphics();
    this.border.moveTo(0,0);
    this.border.lineTo(0, UIButtonWidth);
    this.border.moveTo(UIButtonWidth, UIButtonWidth);
    this.border.lineTo(UIButtonWidth, 0);
    this.border.stroke({
      width: 3,
      color: 0,
    });
    this.addChild(this.border);
  }
}

export class WindowIcon extends PIXI.Container {
  sprite: PIXI.Sprite;
  spriteResource: string;

  constructor(spriteResource: string) {
    super();
    this.spriteResource = spriteResource;
    this.sprite = new PIXI.Sprite(PIXI.textureFrom(this.spriteResource))
    this.addChild(this.sprite);
    this.sprite.width = top_bar_height;
    this.sprite.height = top_bar_height;
  }
}

export class Window extends PIXI.Container {
  dragged: boolean;
  relative_drag_origin_x: number | undefined;
  relative_drag_origin_y: number | undefined;
  title: PIXI.Text;
  uiButtons: UIButtons;
  top_bar: PIXI.Graphics;
  content: PIXI.Container;
  border: PIXI.Graphics;
  icon: WindowIcon;

  isMinimized: boolean = false;

  taskBarIconId: number | undefined = undefined;
  taskBar: TaskBar;

  toggleMinimized() {
    if (this.isMinimized) {
      new Howl({src: "minimize.mp3", autoplay: true});
      this.onMaximize();
    }
    if (!this.isMinimized) {
      new Howl({src: "minimize.mp3", autoplay: true});
      this.onMinimize();
    }
    this.isMinimized = !this.isMinimized;
    this.visible = !this.visible;
    this.interactive = !this.interactive;
    if (this.taskBarIconId != undefined) {
      this.taskBar.toggleMinimizeIcon(this.taskBarIconId as number);
    }
  }

  onMinimize() {}
  onMaximize() {}

  closeWindow() {
    if (this.taskBarIconId != undefined) {
      this.taskBar.removeIcon(this.taskBarIconId as number);
    }
    new Howl({src: "chimes.mp3", autoplay: true});
    document.removeEventListener("mousedown", this.handleMouseDown);
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("mousemove", this.handleMouseMove);
    this.onWindowClose();
    this.content.destroy();
    this.destroy();
  }

  onWindowClose() {}

  constructor(
    content: PIXI.Container,
    title: string,
    taskBar: TaskBar,
    x: number = defaultWindowPosX,
    y: number = defaultWindowPosY,
  ) {
    super();
    this.x = x;
    this.y = y;
    if (this.x == defaultWindowPosX && this.y == defaultWindowPosY) {
      defaultWindowPosX += 50;
      defaultWindowPosY += 50;
    }

    this.content = content;
    this.addChild(this.content);
    this.content.y = top_bar_height;

    this.uiButtons = new UIButtons();
    this.addChild(this.uiButtons);
    this.uiButtons.x = this.width - this.uiButtons.width;

    let t = this;
    this.uiButtons.close.onclick = function() {
      t.closeWindow();
    }
    this.uiButtons.minimize.onclick = function() {
      t.toggleMinimized();
    }

    this.top_bar = new PIXI.Graphics();
    this.top_bar.rect(0, 0, this.width-this.uiButtons.width, top_bar_height)
      .fill(windowBarColor);
    this.addChild(this.top_bar);

    this.icon = new WindowIcon("stop.webp");
    this.addChild(this.icon);

    this.title = new PIXI.Text({
      text: " " + title,
      scale: 1,
    });
    this.title.x = this.icon.width;
    this.addChild(this.title);

    this.border = new PIXI.Graphics();
    // Around the whole window
    this.border.moveTo(0,0);
    this.border.lineTo(this.width, 0);
    this.border.lineTo(this.width, this.height);
    this.border.lineTo(0, this.height);
    this.border.lineTo(0, 0);
    
    // Around the top bar
    this.border.moveTo(0, top_bar_height);
    this.border.lineTo(this.width, top_bar_height);
    this.border.stroke({
      width: 3,
      color: 0,
    });
    this.addChild(this.border);

    this.dragged = false;
    this.relative_drag_origin_x = undefined;
    this.relative_drag_origin_y = undefined;

    this.top_bar.interactive = true;
    this.interactive = true;

    this.handleMouseDown = function(event) {
      if (t.top_bar.containsPoint(new PIXI.Point(event.x-t.x, event.y-t.y))) {
        t.dragged = true;
        t.relative_drag_origin_x = event.x - t.x;
        t.relative_drag_origin_y = event.y - t.y;
      }
    }
    document.addEventListener("mousedown", this.handleMouseDown);

    this.handleMouseMove = function(event) {
      if (t.dragged) {
        defaultWindowPosX = baselineWindowPosX;
        defaultWindowPosY = baselineWindowPosY;
        t.x = event.x - (t.relative_drag_origin_x as number);
        t.y = event.y - (t.relative_drag_origin_y as number);
      }
    }
    document.addEventListener("mousemove", this.handleMouseMove);

    this.handleMouseUp = function() {
      if (t.dragged) {
        t.dragged = false;
      }
    };
    document.addEventListener("mouseup", this.handleMouseUp);

    let icon = TaskBarIconFromWindow(this);
    this.taskBar = taskBar;
    this.taskBarIconId = taskBar.addIcon(icon);
  }

  handleMouseUp() {}
  handleMouseDown(_event: MouseEvent) {}
  handleMouseMove(_event: MouseEvent) {}
}

export class Button extends PIXI.Container {
  graphics: PIXI.Graphics;
  text: PIXI.Text;

  regularRender() {
    this.graphics
      .rect(0, 0, buttonWidth, buttonHeight)
      .fill(new PIXI.Color("black"));

    this.graphics
      .rect(
        buttonBorderThickness,
        buttonBorderThickness,
        buttonWidth-buttonBorderThickness*2,
        buttonHeight-buttonBorderThickness*2)
      .fill(new PIXI.Color("white"));
  }

  hoverOverRender() {
    this.graphics
      .rect(0, 0, buttonWidth, buttonHeight)
      .fill(new PIXI.Color("black"));

    this.graphics
      .rect(
        buttonBorderThickness,
        buttonBorderThickness,
        buttonWidth-buttonBorderThickness*2,
        buttonHeight-buttonBorderThickness*2)
      .fill(new PIXI.Color("lightblue"));
  }

  constructor(label: string) {
    super()
    this.interactive = true;
    this.graphics = new PIXI.Graphics();
    this.addChild(this.graphics);

    this.regularRender();
    this.text = new PIXI.Text({
      text: label
    });
    this.text.x = (0.5*this.width) - (0.5*this.text.width);
    this.text.y = (0.5*this.height) - (0.5*this.text.height);
    this.addChild(this.text);

    this.onmouseleave = function() {
      this.regularRender();
    };
    this.onmouseover = function() {
      this.hoverOverRender();
    };
  }
}

