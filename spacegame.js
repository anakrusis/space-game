var framecount = 0;
var hoverEntity    = null; // entity that the mouse is hovering over
var selectedEntity = null; // entity which the mouse has clicked on
var selectedMission = null; // mission selected in the menus
var singletouchtimer = 0;
var cursorAbsX; var cursorAbsY;
var bypassGameClick = false; // gui boolean for when a gui element is clicked, not to trigger anything in game world

var pathPredictEnabled = true; var buildingDrawEnabled = true;
var trajPredictor = new Entity(0,0,0); 
    trajPredictor.boostForce = new ForceVector(0,0);
var trajectory = [[],[]];
var dir_history = [];

var trajectoryBuffer = [[],[]];
var traj_pointer = 0;

var drawEnabled = true;

CHUNK_DIM = 524288; // both width and height of the chunks are equal. this could technically be very large.
MAX_ZOOM  = 100;

MAX_CITY_TEXT_ZOOM = 5.00;

MAX_INTERPLANETARY_ZOOM = 0.5; // anything larger than this will only render a single planet (the planet the player is nearest to/in the gravity radius of)

MIN_CITY_TEXT_ZOOM = 0.04; // anything smaller than this will not render city label names

MAX_INTERSTELLAR_ZOOM   = 0.001; // anything larger than this will render a whole star system and its planets but no buildings/small details(TODO)
// anything smaller than this will only render stars (no planets)

MIN_ZOOM  = 0.001;

RENDER_SCALE = 1;

function loopyMod(x, m) {
	return (x % m + m) % m;
}

function windowResized() {
	var outerw  = window.innerWidth;
	var outerh = window.innerHeight;
	var window_aspect_ratio = outerh/outerw
	
	bodydiv = document.getElementById("bodydiv");
	var cw = bodydiv.offsetWidth - 30;
	var ch = cw * (window_aspect_ratio)
	resizeCanvas(windowWidth, windowHeight);

}

function setup(){

	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
	
	createCanvas(windowWidth, windowHeight);
	
/* 	let canvasElement = createCanvas(windowWidth, windowHeight).elt;
	let context = canvasElement.getContext('2d');
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false; */
	
	//context.scale(0.5, 0.5);
	
	frameRate(60);
	textFont("Courier");
	textSize(16);
	
	server = new Server();
	server.init(); server.world.init();
	//server.world = new World();

	client = new Client();
	update(); update(); update(); // I guess it takes three ticks to position everything correctly (including the camera and player)
	
	GuiHandler.init();
	//settings = QuickSettings.create(0, 0, "Space Game 0.0.1 2021-04-02", mainelement);	
}

function draw(){
	
	if (GROUP_INFOBAR.active && !(selectedTextEntry)){
		update();
	}
	framecount++;
	
	// The level of detail (LOD) is used to tell how many times to invoke a resampling function which each time reduces the number of vertices drawn on a planet by a factor of 2
	// 
	lod = 10 / cam_zoom;
	lod = Math.ceil(Math.log(lod)/Math.log(2))
	lod = Math.max( 0, lod );
	lod = Math.min( 8, lod );
	
	cam_zoom = Math.min(cam_zoom, MAX_ZOOM);
	cam_zoom = Math.max(cam_zoom, MIN_ZOOM);
	
	background(13,0,13);
	
	//fill(13,0,13);
	//rect(0,0,width/RENDER_SCALE,height/RENDER_SCALE);
	
	if ( drawEnabled ){
		//scale(1 / RENDER_SCALE);
		
		// chunk boundary lines are behind everything
		var chunk = client.world.getPlayer().getChunk();

		stroke(128);
		noFill();
		beginShape();
		
		var cx = chunk.x * CHUNK_DIM; var cy = chunk.y * CHUNK_DIM
		vertex( tra_rot_x( cx, cy ), tra_rot_y( cx, cy ) );
		vertex( tra_rot_x( cx + CHUNK_DIM, cy ), tra_rot_y( cx + CHUNK_DIM, cy ) );
		vertex( tra_rot_x( cx + CHUNK_DIM, cy + CHUNK_DIM ), tra_rot_y( cx + CHUNK_DIM, cy + CHUNK_DIM ) );
		vertex( tra_rot_x( cx, cy + CHUNK_DIM ), tra_rot_y( cx, cy + CHUNK_DIM ) );
		vertex( tra_rot_x( cx, cy ), tra_rot_y( cx, cy ) );
		endShape();
		
		var renderqueue = getRenderQueue(chunk);
		for ( var i = 0; i < 6; i++ ){
			for ( var j = 0; j < renderqueue[i].length; j++){

				renderqueue[i][j].render();
			}
		}
		
		fill(255,0,0);
		circle(tra_rot_x(cursorAbsX, cursorAbsY), tra_rot_y(cursorAbsX, cursorAbsY), 5);
		
		if (PLANET_CAM){
			translate(width/2, height/2);
			rotate(-cam_rot);
			rotate(-HALF_PI);
			translate(-width/2, -height/2);
		}
		
		GuiHandler.drawCityLabels();
		
		resetMatrix();
		
		//let c = get(0,0,width/RENDER_SCALE,height/RENDER_SCALE);
		//c.resize(width,height);
		//image(c,0,0,width,height);
	}
	
	GuiHandler.update();
	GuiHandler.render();
	
	GuiHandler.handleTouches();
	
	stroke(255); //fill(255);
	
	text("FPS: " + Math.round(frameRate()), width - ( 75 * GUI_SCALE ), 16 * GUI_SCALE);
	
	//text(Math.round(tra_rot_x(cursorAbsX, cursorAbsY)) + " " + Math.round(tra_rot_y(cursorAbsX, cursorAbsY)), width - 225, 32);
}

var getRenderQueue = function(chunk){
	renderqueue = [[],[],[],[],[],[]];
	
	// entities not confined to chunk
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e.isOnScreen()){
			//e.render();
			renderqueue[e.renderPriority].push(e);
		}
	}
	// entities confined to chunk

	for ( var uuid in chunk.bodies ){
		var b = chunk.bodies[uuid];
		//if (b.isOnScreen()){
			
			renderqueue[b.renderPriority].push(b);
			//b.render();
		//}
	}
	return renderqueue;
}

var predictDerivativePoints = function(player){
	if (!pathPredictEnabled){ return [[],[]]; }
	
/* 	var nearbody = player.getNearestBody(); */
	
	var futurePointsX = [];
	var futurePointsY = [];
	
/* 	var angacc = player.angacc;
	var angvel = player.angvel;
	var vel = player.velocity;
	var x   = player.x; var y = player.y;
	var dir = player.dir;
	for (var i = 0; i < 1000; i++){
		
		if ( CollisionUtil.euclideanDistance(nearbody.x, nearbody.y, x, y) < nearbody.radius ) { break; }
		
		angacc += player.angjer;
		angvel += angacc;
		vel += player.acc;
		
		dir += angvel;
		
		x += vel * Math.cos( dir );
		y += vel * Math.sin( dir );
		
		futurePointsX.push(x); futurePointsY.push(y);
	} */
	return [futurePointsX, futurePointsY];
}

var predictFuturePoints = function(player){
	if (!pathPredictEnabled){ return [[],[]]; }
	
	var futurePointsX = [];
	var futurePointsY = [];

	var e = new Entity( player.x, player.y, player.dir );
	var markedDead = false;
	for (var i = 0; i < 1000; i++){
		e.update();

		e.boostForce = player.boostForce; e.boostForce.dir = e.dir;
		e.forceVectors.push(e.boostForce);
		futurePointsX.push(e.x); futurePointsY.push(e.y);
		
		if (e.isDead() || e.grounded){ 
			if (markedDead){
				break;
			}
			markedDead = true;
		};
	}
	return [futurePointsX, futurePointsY];
}

function touchStarted() {
	
	return false;
}

function keyPressed() {
	
	if (selectedTextEntry){
		
		if (keyCode === 8){
			selectedTextEntry.setting = selectedTextEntry.setting.slice(0, -1);
			backspaceTimer = BACKSPACE_TIMER_AMT;
		}else if (keyCode === 13){
			selectedTextEntry.commit();
		}else if((keyCode >= 48 && keyCode <= 90) || keyCode == 32) {
			var ltr = String.fromCharCode(keyCode);
			if (!shiftDown){
				ltr = ltr.toLowerCase();
			}
			if (selectedTextEntry.setting.length < 27){
				selectedTextEntry.setting += ltr;
			}
		}
		
	}else{
		
		if (keyCode === 70){
			fullscreen(!fullscreen());
		}else if (keyCode === 80){
			pathPredictEnabled = !pathPredictEnabled;
		}else if (keyCode === 32){
			PLANET_CAM = !PLANET_CAM;
		}else if (keyCode === 66){
			buildingDrawEnabled = !buildingDrawEnabled;	
		}
	}
}

function mouseMoved() {
	
}

function mouseClicked() {
	
	GuiHandler.onClick();
	
	if (bypassGameClick){ bypassGameClick = false; return; }
	
	if (!GROUP_INFOBAR.active){ return; };
	
	if (hoverEntity){
		selectedEntity = hoverEntity;
	}else{
		selectedEntity = null;
	}
	MissionHandler.onPlayerSelectEntity( client.world.getPlayer(), selectedEntity );
}

function mouseWheel(e) {
	
	//console.log(e.delta);
	//cam_zoom -= (cam_zoom / 25) * (e.delta / 25);
	
	cam_zoom -= (cam_zoom / 25) * (e.delta * MOUSE_SENSITIVITY / 25);
	cam_zoom = Math.min(cam_zoom, MAX_ZOOM);
	cam_zoom = Math.max(cam_zoom, MIN_ZOOM);

	return false;
}

var lod;

// This is truly a double-duty function, doing both serverside and clientside calls. However, the backend behavior is almost entirely relegated to the corresponding objects (World, Chunk, Entity) whereas the clientside behavior is mostly in here (or the GuiHandler and its constituents)

// For multiplayer test, the server side calls will be moved and all the rest will stay put!

var update = function(){
	
	server.update();
	var player = client.world.getPlayer();
	
	// KEYBOARD HANDLING
	
	if (player){
		if (keyIsDown(87)) { // up
			if (player.boostForce.magnitude < 10) {
				//server.onUpdateRequest( player.boostForce.magnitude, "world", "player", "lastBoostForce", "magnitude" );
				server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
				trajectory = [[],[]]; dir_history = [];
			}
		}
		else if (keyIsDown(83)) { // down
			if (player.boostForce.magnitude > 0) {
				//server.onUpdateRequest( player.boostForce.magnitude, "world", "player", "lastBoostForce", "magnitude" );
				server.onUpdateRequest( player.boostForce.magnitude - 0.005, "world", "getPlayer", "boostForce", "magnitude" );
				trajectory = [[],[]]; dir_history = [];
			}
			
		}else{
			//server.onUpdateRequest( player.velocity / 1.01, "world", "player", "velocity" );
			
		}
		
		if (keyIsDown(65)) { // left
			server.onUpdateRequest( player.dir - 0.1, "world", "getPlayer", "dir" );
			trajectory = [[],[]]; dir_history = [];
		}
		if (keyIsDown(68)) { // right
			server.onUpdateRequest( player.dir + 0.1, "world", "getPlayer", "dir" );
			trajectory = [[],[]]; dir_history = [];
		}
		
		if (keyIsDown(82)) {
			//server.onUpdateRequest( 0, "world", "player", "boostForce", "magnitude" );
		}
	}
	if (keyIsDown(80)){
		//var myJSON = JSON.stringify(server.world);
		//document.getElementById("bodydiv2").innerHTML = myJSON;
	}
	
	if (keyIsDown(81)) { // q
		cam_zoom += (cam_zoom / 25);
		
	}else if (keyIsDown(69)) { // e
		cam_zoom -= (cam_zoom / 25);
	}
	
	// MOUSE HANDLING
	
	cursorAbsX = untra_x( mouseX, mouseY ); cursorAbsY = untra_y( mouseX, mouseY );
	
	hoverEntity = null;
	cursorChunkX = Math.floor(cursorAbsX / CHUNK_DIM); cursorChunkY = Math.floor(cursorAbsY / CHUNK_DIM); 
	cursorEntity = new Entity(cursorAbsX, cursorAbsY, 0);
	
	var cc = client.world.getChunk(cursorChunkX,cursorChunkY);
	if (cc){
		for (var uuid in cc.bodies) {
			var body = cc.bodies[uuid];
			if (CollisionUtil.isColliding(cursorEntity, body) && body.canEntitiesCollide && !(body instanceof BodyOcean)){
				hoverEntity = body; break;
			}
		}
	}
	for (var uuid in client.world.entities){
		entity = client.world.entities[uuid];
		if (entity.isOnScreen()){
			if (!(entity instanceof EntityPlayer || entity instanceof EntityParticle) && CollisionUtil.isEntityCollidingWithEntity(cursorEntity, entity)){
				hoverEntity = entity;
			}
		}
	}
}