var $ = require('jquery-browserify'),
    Vector = require('./Vector'),
    AABB = require('./AABB'),
    World = require('./World'),
    Solid = require('./Solid'),
    Player = require('./Player');

module.exports = Asymmetry;

function Asymmetry() {
    var self = this;

    this.socket = io.connect('http://172.16.0.25:9966');
    this.width  = $('#canvainer').width(),
    this.height = $('#canvainer').height(),
    this.renderer = this.createRenderer();
    this.world = this.initWorld();

    this.player = new Player(100, 100);
    this.player2 = new Player(100, 100);
    window.player = this.player;
};

Asymmetry.prototype.createRenderer = function() {
    htmlCanvas = "<canvas width=" + "\"" + this.width + "\"" + "height=" + "\"" + this.height + "\"" + "></canvas>";

    $('#canvainer').append(htmlCanvas);

    return $('canvas').get(0).getContext('2d');
}

Asymmetry.prototype.resizeRenderer = function(w, h) {
    this.renderer.width = w;
    this.renderer.height = h;
}

Asymmetry.prototype.initWorld = function() {
    // Define world
    var worldBounds = new AABB(0, 0, this.width, this.height);

    var world = new World({
        bounds: worldBounds
    });

    var solid = new Solid(10, 400, 400, 100);
    world.pushSolid(solid);

    return world;
}

Asymmetry.prototype.updateWorld = function(dt) {
    this.world.update(dt);

    this.player.update(dt);
    this.socket.emit('player pos', this.player.pos);
}

Asymmetry.prototype.drawWorld = function() {
    var self = this;

    this.renderer.clearRect(0, 0, this.width, this.height);

    // Draw solids
    for (var i = 0; i < this.world.solids.length; i++) {
        var s = this.world.solids[i];

        this.renderer.fillRect(s.pos.x, s.pos.y, s.w, s.h);
    };

    // Draw the player
    var p = this.player2;
    this.renderer.fillRect(p.pos.x, p.pos.y, p.w, p.h);
}

Asymmetry.prototype.spawnSolid = function(x, y, w, h) {
    var s = new Solid(w, h, x, y);
    this.world.pushSolid(s);
}
