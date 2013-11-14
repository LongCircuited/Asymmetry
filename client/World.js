var Vector = require('./Vector');

module.exports = World;

function World(opts) {
    var self = this;

    this.forces = opts.forces || new Vector(0, 0)

    this.bounds = opts.bounds || new AABB(0, 0, 100, 100);

    this.terminalVel = 20;

    this.solids = []; // Solid objects for sand to bump into
    this.sands = []; // Vectors storing a position of sand
}

World.prototype.pushSolid = function(s) {
    this.solids.push(s);
}

World.prototype.pushSand = function(v) {
    v.resting = false;
    v.forces = this.forces;
    v.type = 'sand'
    this.sands.push(v);
}

World.prototype.addForce = function(f) {
    this.forces.add(f);
}

World.prototype.update = function(dt) {
    // Check for player collisions
    for (var i = 0; i < this.solids.length; i++) {
        var a = this.solids[i].aabb,
            intersect = a.intersects(window.player.aabb);

        if(intersect) {
            window.player.move(intersect);
        }
    };
}
