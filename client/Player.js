var Vector = require('./Vector'),
    AABB = require('./AABB');

module.exports = Player;

function Player(x, y, speed) {
    this.w = 20;
    this.h = 20;

    this.vel = new Vector(0, 0);
    this.speed = speed || 50;
    
    this.pos = new Vector(x, y);

    this.aabb = new AABB(x, y, (x + this.w - 1), (y + this.h));
}

Player.prototype.update = function(dt) {
    var dVec = new Vector(this.vel.x * dt, this.vel.y * dt);

    dVec.round();
    this.pos.add(dVec);
    this.aabb.translate(dVec);
}

Player.prototype.move = function(vec) {
    this.pos.add(vec);
    this.aabb.translate(vec);
}

Player.prototype.setXVel = function(vel) {
    this.vel.x = vel;
}

Player.prototype.setYVel = function(vel) {
    this.vel.y = vel;
}

Player.prototype.beStill = function() {
    this.vel = new Vector(0, 0);
}
