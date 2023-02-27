/*
File: projectile.js
Description: the projectile class, used to create a projectile and mimic its behavior when flying
Author: Renjie Yao
Date created: 02/26/2023
*/

class Projectile {
    constructor(x, y, r, player) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.player = player;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0;
        this.firing = false;
    }

    startFire(v, angle) {
        this.vx = v * Math.cos(angle);
        this.vy = -(v * Math.sin(angle));
        this.angle = angle;
        this.firing = true;
    }

    update(t) {
        if (this.firing) {
            t = t / 1000;
            
            // TODO: Need to take wind into consideration
            // Fw = (1/2) * Cw * A * ρ * (v - vw)^2

            this.vy += 10 * t;
            if (this.player == "Player1") {
                this.x += this.vx * t;
                this.y += this.vy * t + 0.5 * 10 * t * t;
            } else {
                this.x -= this.vx * t;
                this.y += this.vy * t + 0.5 * 10 * t * t;
            }
            
        }
    }

    show() {
        fill(255, 0, 0);
        circle(this.x, this.y, 2 * this.r);
    }
}