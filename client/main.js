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
        ASYM.socket.emit('right', PLAYER_SPEED);
    }, function() {
        ASYM.socket.emit('right', 0);
    });
    
    kb.on('left', function() {
        ASYM.socket.emit('left', PLAYER_SPEED);
    }, function() {
        ASYM.socket.emit('left', 0);
    });
    
    kb.on('down', function() {
        ASYM.socket.emit('down', PLAYER_SPEED);
    }, function() {
        ASYM.socket.emit('down', 0);
    });

    kb.on('up', function() {
        ASYM.socket.emit('up', PLAYER_SPEED);
    }, function() {
        ASYM.socket.emit('up', 0);
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
        var ip = "localhost";

        if(number > 2) alert('too many people connected');

        ASYM.client = new Client(ip, number);
    });

    ASYM.socket.on('right', function(speed) {
        ASYM.player.setXVel(speed);
    });
    
    ASYM.socket.on('left', function(speed) {
        ASYM.player.setXVel(speed);
    });
    
    ASYM.socket.on('up', function(speed) {
        ASYM.player.setYVel(speed);
    });
    
    ASYM.socket.on('down', function(speed) {
        ASYM.player.setYVel(speed);
    });

    ASYM.socket.on('render style', function(fillStyle) {
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
