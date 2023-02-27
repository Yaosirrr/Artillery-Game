/*
File: button.js
Description: inherits the box class, used to create a button
Author: Renjie Yao
Date created: 02/26/2023
*/

class Button extends Box {
    constructor(x, y, w, h, text) {
        super(x, y, w, h);
        this.text = text;
    }

    show() {
        if (this.text == "Fire!") {
            fill(255, 255, 0);
        } else {
            fill(130, 110, 0);
        }
        
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.h);

        textSize(50);
        textAlign(CENTER);
        fill(255, 0, 0);
        text(this.text, this.x, this.y + this.h / 4);
    }
}