var $ = require('jquery-browserify'),
    Vector = require('./Vector'),
    AABB = require('./AABB'),
    World = require('./World'),
    Solid = require('./Solid'),
    Player = require('./Player');

module.exports = Asymmetry;

function Asymmetry() {
    var self = this;
    this.TILE_SIZE = 40;
    this.MAZE_BORDER = 2;

    this.socket = io.connect('http://localhost:9966');
    this.width  = $('#canvainer').width(),
    this.height = $('#canvainer').height(),
    this.renderer = this.createRenderer();
    this.world = this.initWorld();

    this.maze = this.generateMaze();
    this.solidifyMaze();

    this.player = new Player(100, 100);
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

    return world;
}

Asymmetry.prototype.updateWorld = function(dt) {
    this.world.update(dt);
    this.player.update(dt); 
    this.socket.emit('player pos', this.player.pos);

    if(this.world.complete()) {
        this.world.solids = [new Solid(this.width, this.height, 0, 0)];
        this.renderer.fillStyle = 'green';
    }
}

Asymmetry.prototype.drawWorld = function() {
    var self = this;

    this.renderer.clearRect(0, 0, this.width, this.height);

    // Draw solids
    for (var i = 0; i < this.world.solids.length; i++) {
        var s = this.world.solids[i];

        this.renderer.fillRect(s.pos.x, s.pos.y, s.w, s.h);
    };

    // Draw goal
    var g = this.world.goal;
    this.renderer.fillRect(g.pos.x, g.pos.y, g.w, g.h);

    // Draw the player
    var p = this.player;
    this.renderer.fillRect(p.pos.x, p.pos.y, p.w, p.h);
}

Asymmetry.prototype.spawnSolid = function(x, y, w, h) {
    var s = new Solid(w, h, x, y);
    this.world.pushSolid(s);
}

Asymmetry.prototype.generateMaze = function() {
    var cells = [],
        w = Math.floor(this.width / this.TILE_SIZE),
        h = Math.floor(this.height / this.TILE_SIZE),
        totalCells = w * h;

    for (var x = 0; x < w; x++) {
        cells[x] = [];
        for (var y = 0; y < h; y++) {
            cells[x][y] = new Cell(x, y);
        };
    };

    var currentCellCoords = new Vector(Math.round(Math.random() * w), Math.round(Math.random() * h)),
        currentCell = cells[currentCellCoords.x][currentCellCoords.y],
        cellStack = [];
        visitedCells = 1;

    function getRandNeighbor(cell) {
        var randNeighborCoords,
            validNeighbors = [];
        
       function validateNeighbor(coords) {
           //Check if the cell is legit
            if(coords.x < w && coords.x >= 0 && coords.y < h && coords.y >= 0) {
                var randNeighbor = cells[coords.x][coords.y];

                if(randNeighbor.N && randNeighbor.E && randNeighbor.S && randNeighbor.W) {
                    validNeighbors.push(randNeighbor);
                }
            }
        }

        for (var i = 0; i <= 3; i++) {
            switch(i) {
                case 0:
                    randNeighborCoords = new Vector(cell.x, cell.y + 1);
                    validateNeighbor(randNeighborCoords);
                    break;
                case 1:
                    randNeighborCoords = new Vector(cell.x + 1, cell.y);
                    validateNeighbor(randNeighborCoords);
                    break;
                case 2:
                    randNeighborCoords = new Vector(cell.x, cell.y - 1);
                    validateNeighbor(randNeighborCoords);
                    break;
                case 3:
                    randNeighborCoords = new Vector(cell.x - 1, cell.y);
                    validateNeighbor(randNeighborCoords);
                    break;
                default:
                    console.log('huh? ' + i);
                    break;
            };
        };

        if(validNeighbors.length > 0) {
            var rn = Math.round(Math.random() * (validNeighbors.length - 1));

            return validNeighbors[rn];
        } else {
            return null;
        }
    }

    while(visitedCells < totalCells) {
        var randNeighbor = getRandNeighbor(currentCell);

        if(randNeighbor !== null) {
            if(randNeighbor.x > currentCell.x) {
                currentCell.E = false;
                randNeighbor.W = false;
            } else if (randNeighbor.x < currentCell.x) {
                currentCell.W = false;
                randNeighbor.E = false;
            } else if (randNeighbor.y < currentCell.y) {
                currentCell.N = false;
                randNeighbor.S = false;
            } else if (randNeighbor.y > currentCell.y) {
                currentCell.S = false;
                randNeighbor.N = false;
            } else {
                console.log('huh...')
            }

            cellStack.push(currentCell);
            currentCell = randNeighbor;
            visitedCells++;
        } else {
            currentCell = cellStack.pop()
        }

    }

    this.world.goal = new Solid(this.TILE_SIZE, this.TILE_SIZE, cells[w - 1][h - 1].x * this.TILE_SIZE, cells[w - 1][h - 1].y * this.TILE_SIZE);

    return cells;
}

Asymmetry.prototype.solidifyMaze = function() {
    var m = this.maze;
    for (var x = 0; x < m.length; x++) {
        for (var y = 0; y < m[x].length; y++) {
            var screenPos = new Vector(x*this.TILE_SIZE, y*this.TILE_SIZE),
                c = m[x][y];

            if(c.N) this.world.pushSolid(new Solid(this.TILE_SIZE, this.MAZE_BORDER, screenPos.x, screenPos.y));
            if(c.E) this.world.pushSolid(new Solid(this.MAZE_BORDER, this.TILE_SIZE, screenPos.x + this.TILE_SIZE, screenPos.y));
            if(c.S) this.world.pushSolid(new Solid(this.TILE_SIZE, this.MAZE_BORDER, screenPos.x, screenPos.y + this.TILE_SIZE));
            if(c.W) this.world.pushSolid(new Solid(this.MAZE_BORDER, this.TILE_SIZE, screenPos.x, screenPos.y));
        };
    };
}

function Cell(x, y) {
    this.x = x;
    this.y = y;
    this.N = true;
    this.E = true;
    this.S = true;
    this.W = true;
}
