var Client = require('./Client'),
    Asymmetry = require('./Asymmetry'),
    $ = require('jquery-browserify'),
    Timer = require('./Timer'),
    Vector = require('./Vector'),
    kb = require('./keyboard');

kb = kb.k;

$(document).ready(main);

function main() {
    var ASYM = new Asymmetry(),
        offset = $('canvas').offset(),
        timer = new Timer(),
        PLAYER_SPEED = 50;

    // Bind events, yeah it's pretty
    kb.on('right', function() {
        ASYM.player.setXVel(PLAYER_SPEED);
    }, function() {
        ASYM.player.setXVel(0);
    });
    
    kb.on('left', function() {
        ASYM.player.setXVel(-PLAYER_SPEED);
    }, function() {
        ASYM.player.setXVel(0);
    });
    
    kb.on('down', function() {
        ASYM.player.setYVel(PLAYER_SPEED);
    }, function() {
        ASYM.player.setYVel(0);
    });

    kb.on('up', function() {
        ASYM.player.setYVel(-PLAYER_SPEED);
    }, function() {
        ASYM.player.setYVel(0);
    });
    
    kb.on('q', function() {
        ASYM.socket.emit('render style', 'red');
    });
    
    kb.on('e', function() {
        ASYM.socket.emit('render style', 'green');
    });
    
    var frame = 0,
        fpsTimer = new Timer();

    tick();

    ASYM.socket.on('client connected', function(number) {
        var ip = "172.16.0.25";

        if(number > 2) alert('too many people connected');

        ASYM.client = new Client(ip, number);
    });

    ASYM.socket.on('new player pos', function(pos) {
        ASYM.player2.pos = new Vector(pos.x, pos.y);
    });

    ASYM.socket.on('new render style', function(fillStyle) {
        ASYM.renderer.fillStyle = fillStyle;
    });

    function tick() {
        requestAnimationFrame(tick);

        frame++;
        if(fpsTimer.getTime() > 1000) {
            $('#fps').html(frame + 'fps');
            fpsTimer.reset();
            frame = 0;
        }

        ASYM.updateWorld(timer.getTime() / 1000);

        ASYM.drawWorld();

        timer.reset();
    }
}
