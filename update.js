// socket
var socket = io();
var serverId;

socket.on('register', onRegister);

function onRegister(data) {
    serverId = data.id;

    socket.emit('accept', {
        id: serverId,
        agent: 'server'
    })
}





// canvas

/**************************************************************************
 * CONSTANTS
 **************************************************************************/

var FRAME_RATE = 60;
var STEER_SPEED = 1.0;
var MAX_STEER_ANGLE = Math.PI / 3; //60 degrees to be precise
var TOP_ENGINE_SPEED = 2.5;

var engine_speed = 0;
var steering_angle = 0;
var steer_speed = STEER_SPEED;
var world;
var ctx;
var canvas_height;

//1 metre of box2d length becomes 100 pixels on canvas
var SCALE = 100;


/**************************************************************************
 * MAIN
 **************************************************************************/

$(function () {
    game.ctx = ctx = $('#canvas').get(0).getContext('2d');
    var canvas = $('#canvas');

    game.canvas_width = canvas_width = parseInt(canvas.width());
    game.canvas_height = canvas_height = parseInt(canvas.height());

    game.screen_width = game.canvas_width / SCALE;
    game.screen_height = game.canvas_height / SCALE;

    //first create the world
    world = createWorld();

    create_car();

    //Start the Game Loop!!!!!!!
    requestAnimFrame(game_loop);
});


/**************************************************************************
 * GAMR LOOP
 **************************************************************************/

// Preferred way of updating the game loop, instead of using "setinterval",
// or "timeout". This is Mr. Paul Irish cross-browser solution for 
// "requestAnimationFrame", even falling back to older browsers. 
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, setFrameRate(FRAME_RATE));
        };
})();

function setFrameRate(frameRate) {
    return 1000 / frameRate;
}

function game_loop() {
    var time_step = 1.0 / FRAME_RATE;

    update_car();
    //move the world ahead , step ahead man!!
    world.Step(time_step, 8, 3);
    //Clear the forces , Box2d 2.1a 
    world.ClearForces();

    // $(document).keydown(function (e) {
    //     game.key_down(e);
    //     return false;
    // });

    // $(document).keyup(function (e) {
    //     game.key_up(e);
    //     return false;
    // });

    //redraw the world
    redraw_world(world, ctx);

    //call this function again after 10 seconds
    requestAnimFrame(game_loop);
    //setTimeout('game_loop()', 1000/60);
}

//Method to update the car
function update_car() {
    var wheels = ['left', 'right'];

    //Driving
    for (var i in wheels) {
        var d = wheels[i] + '_wheel';
        var wheel = car[d];

        //get the direction in which the wheel is pointing
        var direction = wheel.GetTransform().R.col2.Copy();
        //console.log(direction.y);
        direction.Multiply(car.engine_speed);

        //apply force in that direction
        wheel.ApplyForce(direction, wheel.GetPosition());
    }

    //Steering
    for (var i in wheels) {
        var d = wheels[i] + '_wheel_joint';
        var wheel_joint = car[d];

        //max speed - current speed , should be the motor speed , so when max speed reached , speed = 0;
        var angle_diff = steering_angle - wheel_joint.GetJointAngle();
        wheel_joint.SetMotorSpeed(angle_diff * steer_speed);
    }
}

// method called in a loop to redraw the world
function redraw_world(world, context) {
    //convert the canvas coordinate directions to cartesian
    ctx.save();
    ctx.translate(0, canvas_height);
    ctx.scale(1, -1);
    world.DrawDebugData();
    ctx.restore();

    ctx.font = 'bold 15px arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Use arrow keys to move the car', canvas_width / 2, 20);
    ctx.fillText('Car Gear : ' + car.gear + ' Car Engine Speed : ' + car.engine_speed + ' mps ', canvas_width / 2, 40);
}


/**************************************************************************
 *  IMPORT DEPENDENCIES
 **************************************************************************/

// Box2d Library
var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
    b2Shape = Box2D.Collision.Shapes.b2Shape,
    b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
    b2Joint = Box2D.Dynamics.Joints.b2Joint,
    b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;


/**************************************************************************
 *  USER INPUT
 **************************************************************************/

var game = {
    'key_down': function (e) {
        var code = e.keyCode;
        // console.log('btn is: ', code);

        //left
        if (code == 37) {
            steering_angle = MAX_STEER_ANGLE;
            steer_speed = STEER_SPEED;
        }
        //up
        if (code == 38) {
            car.gear = 1;
            car.start_engine();
        }

        //right
        if (code == 39) {
            steering_angle = -1 * MAX_STEER_ANGLE;
            steer_speed = STEER_SPEED;
        }

        //down
        if (code == 40) {
            car.gear = -1;
            car.start_engine();
        }
    },

    'key_up': function (e) {
        var code = e.keyCode;

        //stop forward velocity only when up or down key is released
        if (code == 38 || code == 40) {
            car.stop_engine();
        }
        //LEFT OR RIGHT
        if (code == 37 || code == 39) {
            steering_angle = 0.0;
            //This is called POWER STEERING, when the steering is released the front wheels need to become straight very quickly
            steer_speed = STEER_SPEED * 8.0;
        }
    },

    'screen_width': 0,
    'screen_height': 0,
};

socket.on('render', function (data) {
    console.log('data: ', data);
    if (data.type === 'down') {
        var e = { keyCode: data.key };
        console.log(e);
        game.key_down(e);
    }
    if (data.type === 'up') {
        var e = { keyCode: data.key };
        game.key_up(e);
    }
});

/**************************************************************************
 * GAME OBJECTS
 **************************************************************************/

// Car
var car = {

    'top_engine_speed': TOP_ENGINE_SPEED,
    'engine_on': false,

    'start_engine': function () {
        car.engine_on = true;
        car.engine_speed = car.gear * car.top_engine_speed;
    },

    'stop_engine': function () {
        car.engine_on = false;
        car.engine_speed = 0;
    },

    'gear': 1
};

//Create box2d world object
function createWorld() {
    var gravity = new b2Vec2(0, 0);
    var doSleep = true;

    world = new b2World(gravity, doSleep);

    //setup debug draw
    var debugDraw = new b2DebugDraw();
    debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    debugDraw.SetDrawScale(SCALE);
    debugDraw.SetFillAlpha(0.5);
    debugDraw.SetLineThickness(1.0);
    debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

    world.SetDebugDraw(debugDraw);

    createBox(world, game.screen_width / 2, 0.5, game.screen_width / 2 - 1, 0.1, { 'type': b2Body.b2_staticBody, 'restitution': 0.5 });
    createBox(world, game.screen_width - 1, game.screen_height / 2, 0.1, game.screen_height / 2 - 1, { 'type': b2Body.b2_staticBody, 'restitution': 0.5 });

    //few lightweight boxes
    var free = { 'restitution': 1.0, 'linearDamping': 1.0, 'angularDamping': 1.0, 'density': 0.2 };
    createBox(world, 2, 2, 0.5, 0.5, free);
    createBox(world, 5, 2, 0.5, 0.5, free);

    return world;
}

//Create standard boxes of given height , width at x,y
function createBox(world, x, y, width, height, options) {
    //default setting
    options = $.extend(true, {
        'density': 1.0,
        'friction': 0.0,
        'restitution': 0.2,

        'linearDamping': 0.0,
        'angularDamping': 0.0,

        'gravityScale': 1.0,
        'type': b2Body.b2_dynamicBody
    }, options);

    var body_def = new b2BodyDef();
    body_def.position.Set(x, y);
    body_def.linearDamping = options.linearDamping;
    body_def.angularDamping = options.angularDamping;
    body_def.type = options.type;
    var b = world.CreateBody(body_def);

    var fix_def = new b2FixtureDef;
    fix_def.density = options.density;
    fix_def.friction = options.friction;
    fix_def.restitution = options.restitution;
    fix_def.shape = new b2PolygonShape();
    fix_def.shape.SetAsBox(width, height);
    b.CreateFixture(fix_def);

    return b;
}

function create_car() {
    car_pos = new b2Vec2(3, 3);
    car_dim = new b2Vec2(0.2, 0.35);
    car.body = createBox(world, car_pos.x, car_pos.y, car_dim.x, car_dim.y, { 'linearDamping': 10.0, 'angularDamping': 10.0 });

    var wheel_dim = car_dim.Copy();
    wheel_dim.Multiply(0.2);

    //front wheels
    left_wheel = createBox(world, car_pos.x - car_dim.x, car_pos.y + car_dim.y / 2, wheel_dim.x, wheel_dim.y, {});
    right_wheel = createBox(world, car_pos.x + car_dim.x, car_pos.y + car_dim.y / 2, wheel_dim.x, wheel_dim.y, {});

    //rear wheels
    left_rear_wheel = createBox(world, car_pos.x - car_dim.x, car_pos.y - car_dim.y / 2, wheel_dim.x, wheel_dim.y, {});
    right_rear_wheel = createBox(world, car_pos.x + car_dim.x, car_pos.y - car_dim.y / 2, wheel_dim.x, wheel_dim.y, {});

    var front_wheels = { 'left_wheel': left_wheel, 'right_wheel': right_wheel };

    for (var i in front_wheels) {
        var wheel = front_wheels[i];

        var joint_def = new b2RevoluteJointDef();
        joint_def.Initialize(car.body, wheel, wheel.GetWorldCenter());

        //after enablemotor , setmotorspeed is used to make the joins rotate , remember!
        joint_def.enableMotor = true;
        joint_def.maxMotorTorque = 100000;

        //this will prevent spinning of wheels when hit by something strong
        joint_def.enableLimit = true;
        joint_def.lowerAngle = -1 * MAX_STEER_ANGLE;
        joint_def.upperAngle = MAX_STEER_ANGLE;

        //create and save the joint
        car[i + '_joint'] = world.CreateJoint(joint_def);
    }

    var rear_wheels = { 'left_rear_wheel': left_rear_wheel, 'right_rear_wheel': right_rear_wheel };

    for (var i in rear_wheels) {
        var wheel = rear_wheels[i];

        var joint_def = new b2PrismaticJointDef();
        joint_def.Initialize(car.body, wheel, wheel.GetWorldCenter(), new b2Vec2(1, 0));

        joint_def.enableLimit = true;
        joint_def.lowerTranslation = joint_def.upperTranslation = 0.0;

        car[i + '_joint'] = world.CreateJoint(joint_def);
    }

    car.left_wheel = left_wheel;
    car.right_wheel = right_wheel;
    car.left_rear_wheel = left_rear_wheel;
    car.right_rear_wheel = right_rear_wheel;

    return car;
}