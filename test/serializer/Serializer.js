var World = require(__dirname + "/../../src/world/World")
,   Serializer = require(__dirname + "/../../src/serializer/Serializer")
,   IslandSolver = require(__dirname + "/../../src/solver/IslandSolver")
,   GSSolver = require(__dirname + "/../../src/solver/GSSolver")
,   SAPBroadphase = require(__dirname + "/../../src/collision/SAPBroadphase")
,   NaiveBroadphase = require(__dirname + "/../../src/collision/NaiveBroadphase")

function v(a){
    return [a[0],a[1]];
}

exports.deserialize = function(test){
    var s = Serializer.sample,
        serializer = new Serializer(),
        world = serializer.deserialize(s);

    // Check no errors
    test.deepEqual(serializer.validateResult.errors, []);

    test.ok(world instanceof World,'Should return a world instance! '+serializer.error);

    test.deepEqual(v(world.gravity),s.gravity,'gravity wasnt set correctly');

    // Solver
    switch(s.solver.type){
        case "GSSolver":
            test.ok(world.solver instanceof GSSolver);
            test.equal(world.solver.iterations, s.solver.iterations);
            test.equal(world.solver.stiffness,  s.solver.stiffness);
            test.equal(world.solver.relaxation, s.solver.relaxation);
            break;

        case "IslandSolver":
            test.ok(world.solver instanceof IslandSolver);
            break;
    }

    // Broadphase
    switch(s.broadphase.type){
        case "NaiveBroadphase":
            test.ok(world.broadphase instanceof NaiveBroadphase);
            break;
        case "SAPBroadphase":
            test.ok(world.broadphase instanceof SAPBroadphase);
            break;
    }

    // Bodies
    for(var i=0; i<s.bodies.length; i++){
        var jb = s.bodies[i];
        test.equal(jb.mass,world.bodies[i].mass);
        test.equal(jb.fixedRotation,world.bodies[i].fixedRotation);
        // Todo check all properties

        // Check shapes
        for(var j=0; j<jb.circleShapes.length; j++){
            var shape = jb.circleShapes[j];
            test.equal(shape.radius,world.bodies[i].shapes[j].radius);
        }
    }

    // Springs
    for(var i=0; i<s.springs.length; i++){
        var js = s.springs[i],
            sp = world.springs[i];
        test.equal(js.restLength, sp.restLength);
        test.equal(js.stiffness, sp.stiffness);
        test.equal(js.damping, sp.damping);
        test.deepEqual(js.localAnchorA, v(sp.localAnchorA));
        test.deepEqual(js.localAnchorB, v(sp.localAnchorB));
    }

    // DistanceConstraints
    var constraintCount = 0;
    for(var i=0; i<s.distanceConstraints.length; i++){
        var jd = s.distanceConstraints[i],
            c = world.constraints[constraintCount];
        test.equal(jd.distance,  c.distance);
        test.equal(jd.maxForce,  c.equations[0].maxForce);
        test.equal(jd.maxForce, -c.equations[0].minForce);
        constraintCount++;
    }

    // RevoluteConstraints
    for(var i=0; i<s.revoluteConstraints.length; i++){
        var jr = s.revoluteConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.pivotA),     jr.pivotA);
        test.deepEqual(v(c.pivotB),     jr.pivotB);
        test.equal(c.motorEnabled,      jr.motorEnabled);
        test.equal(c.getMotorSpeed(),   jr.motorSpeed);
        test.equal(c.lowerLimit,        jr.lowerLimit);
        test.equal(c.upperLimit,            jr.upperLimit);
        test.equal(c.lowerLimitEnabled,     jr.lowerLimitEnabled);
        test.equal(c.upperLimitEnabled,     jr.upperLimitEnabled);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // PrismaticConstraints
    for(var i=0; i<s.prismaticConstraints.length; i++){
        var jr = s.prismaticConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.localAnchorA),   jr.localAnchorA);
        test.deepEqual(v(c.localAnchorB),   jr.localAnchorB);
        test.deepEqual(v(c.localAxisA),     jr.localAxisA);
        test.equal(c.motorEnabled,          jr.motorEnabled);
        test.equal(c.motorSpeed,            jr.motorSpeed);
        test.equal(c.lowerLimit,            jr.lowerLimit);
        test.equal(c.upperLimit,            jr.upperLimit);
        test.equal(c.lowerLimitEnabled,     jr.lowerLimitEnabled);
        test.equal(c.upperLimitEnabled,     jr.upperLimitEnabled);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // LockConstraints
    for(var i=0; i<s.lockConstraints.length; i++){
        var jr = s.lockConstraints[i],
            c = world.constraints[constraintCount];
        test.deepEqual(v(c.localOffsetB),   jr.localOffsetB);
        test.deepEqual(c.localAngleB,       jr.localAngleB);
        test.equal(c.equations[0].maxForce, jr.maxForce);
        constraintCount++;
    }

    // ContactMaterials
    for(var i=0; i<s.contactMaterials.length; i++){
        var cm = s.contactMaterials[i],
            c = world.contactMaterials[i];
        test.equal(cm.id, c.id);
        test.equal(cm.materialA, c.materialA.id);
        test.equal(cm.materialB, c.materialB.id);
        test.equal(cm.stiffness, c.stiffness);
        test.equal(cm.relaxation, c.relaxation);
        test.equal(cm.frictionStiffness, c.frictionStiffness);
        test.equal(cm.frictionRelaxation, c.frictionRelaxation);
        test.equal(cm.restitution, c.restitution);
    }

    test.done();
}

exports.serialize = function(test){
    var s = Serializer.sample;
    var serializer = new Serializer();
    var world = serializer.deserialize(Serializer.sample);

    test.ok(world instanceof World);
    test.deepEqual(serializer.validateResult.errors,[]);

    var obj = serializer.serialize(world);

    test.ok(typeof(obj) == "object");
    test.ok(serializer.validate(obj));
    test.deepEqual(serializer.validateResult.errors,[])
    for(var key in s) test.deepEqual(s[key], obj[key]);
    //test.deepEqual(s, obj);

    test.done();
};

exports.stringify = function(test){
    var world = new World();
    var serializer = new Serializer();
    var str = serializer.stringify(world);
    test.ok(typeof(str) == "string");
    test.done();
};

exports.parse = function(test){
    var str = JSON.stringify(Serializer.sample);
    var serializer = new Serializer();
    var world = serializer.parse(str);
    test.ok(world instanceof World);
    test.done();
};
