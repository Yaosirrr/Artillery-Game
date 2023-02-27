/*
File: cannon.js
Description: the cannon class, inherits the box class and is used to create a tank
Author: Renjie Yao
Date created: 02/26/2023
*/

class Cannon extends Box {
    constructor(x, y, w, h, mirror) {
        super(x, y, w, h);
        this.mirror = mirror;
    }

    show() {
        imageMode(CENTER);
        if (this.mirror) {
            scale(-1, 1);
            image(cannonImg, -this.x, this.y, this.w, this.h);
            scale(-1, 1);
        } else {
            image(cannonImg, this.x, this.y, this.w, this.h);
        }
    }
}