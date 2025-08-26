import * as PIXI from "pixi.js"
import { Button } from "./guiCore";
import {
    verticalTextBoxPadding,
    notificationWindowColor,
    notification_message_padding
} from "./constants";

export class Notification extends PIXI.Container {
  background: PIXI.Graphics;
  text: PIXI.Text;
  button: Button;

  constructor(text: string) {
    super();

    this.text = new PIXI.Text({
      text: text,
    });
    this.text.x = notification_message_padding;
    this.text.y = verticalTextBoxPadding;

    this.background = new PIXI.Graphics();

    this.addChild(this.background);
    this.addChild(this.text);

    this.button = new Button("Ok");
    this.button.x =
      (0.5*(this.width+2*notification_message_padding)) - (0.5*this.button.width);

    this.button.y = this.height+(2*verticalTextBoxPadding);
    this.addChild(this.button);

    this.background
      .rect(0, 0, this.width+(2*notification_message_padding), this.height+this.button.height)
      .fill(notificationWindowColor);
  }
}

