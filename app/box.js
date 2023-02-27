/*
File: box.js
Description: the box class, used to create a rectangle
Author: Renjie Yao
Date created: 02/26/2023
*/

class Box {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    show() {
        fill(200);
        rectMode(CENTER);
        rect(this.x, this.y, this.w, this.h);
    }
}