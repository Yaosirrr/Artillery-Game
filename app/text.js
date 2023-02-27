/*
File: text.js
Description: to quickly create a text on the screen
Author: Renjie Yao
Date created: 02/26/2023
*/

class Text {
    constructor(x, y, size, text) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.text = text;
    }

    show() {
        textSize(this.size);
        textAlign(CENTER);
        text(this.text, this.x, this.y);
    }
}