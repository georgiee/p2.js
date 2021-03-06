var World = require(__dirname + '/../../src/world/World')
,   Body = require(__dirname + '/../../src/objects/Body')
,   IslandManager = require(__dirname + '/../../src/world/IslandManager')
,   IslandNode = require(__dirname + '/../../src/world/IslandNode')
,   Equation = require(__dirname + '/../../src/equations/Equation')

exports.construct = function(test){
    new IslandManager();
    test.done();
};

exports.getUnvisitedNode = function(test){
    var node = IslandManager.getUnvisitedNode([]);
    test.equal(node,false);

    var node = IslandManager.getUnvisitedNode([new IslandNode(new Body())]);
    test.ok(node instanceof IslandNode);

    test.done();
};

exports.visit = function(test){
    var manager = new IslandManager();
    manager.visit(new IslandNode(new Body()),[],[]);
    test.done();
};

exports.bfs = function(test){
    var manager = new IslandManager();
    var bodyA = new Body();
    var bodyB = new Body();
    var nodeA = new IslandNode(bodyA);
    var nodeB = new IslandNode(bodyB);

    var bodies=[],
        equations=[];
    manager.bfs(nodeA,bodies,equations);
    test.deepEqual(bodies,[bodyA]);

    var eq = new Equation(bodyA,bodyB);
    nodeA.neighbors.push(nodeB);
    nodeA.equations.push(eq);
    nodeB.neighbors.push(nodeA);
    nodeB.equations.push(eq);
    bodies = [];
    equations = [];
    manager.bfs(nodeA,bodies,equations);
    test.deepEqual(bodies,[bodyA,bodyB]);
    test.deepEqual(equations,[eq]);

    test.done();
};
