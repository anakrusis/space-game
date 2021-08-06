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
var FONT = null;

CHUNK_DIM = 524288; // both width and height of the chunks are equal. this could technically be very large.
MAX_ZOOM  = 100;

MIN_CITY_TEXT_ZOOM = 0.04; // anything smaller than this will not render city label names

MAX_INTERPLANETARY_ZOOM = 0.5; // anything larger than this will only render a single planet (the planet the player is nearest to/in the gravity radius of)
MAX_INTERSTELLAR_ZOOM   = 0.001; // anything larger than this will render a whole star system and its planets but no buildings/small details(TODO)
// anything smaller than this will only render stars (no planets)

MIN_ZOOM  = 0.001;

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

function preload(){
	//FONT = loadImage("font8drawn.png");
}

function setup(){

	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
	
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	textFont("Courier"); textSize(32);
	pixelDensity(1);
	noSmooth();
	
	server = new Server();
	server.init(); server.world.init();
	//server.world = new World();

	client = new Client();
	update(); update(); update(); // I guess it takes three ticks to position everything correctly (including the camera and player)
	
	GuiHandler.init();
	
	let canvasElement = createCanvas(windowWidth, windowHeight).elt;
	let context = canvasElement.getContext('2d');
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
	
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
	
	if ( drawEnabled ){
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
		
		var bodies = 0;

		for ( var i = 0; i < 6; i++ ){
					
			// entities not confined to chunk
			for ( var uuid in client.world.entities ){
				var e = client.world.entities[uuid];
				if (e.isOnScreen() && e.renderPriority == i){
					e.render();
				}
			}
			
			// entities confined to chunk
		
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
				if (b.isOnScreen() && b.renderPriority == i){
				//if (b.renderPriority == i){
					
					b.render();
					
					bodies++;
				}
			}
		}
		
		GuiHandler.drawBuildingGhost();
		
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
	}
	
	GuiHandler.update();
	GuiHandler.render();
	
	GuiHandler.handleTouches();
	
	stroke(255); fill(255);
	textSize(16 * GUI_SCALE);
	text("FPS: " + Math.round(frameRate()), width - ( 75 * GUI_SCALE ), 16 * GUI_SCALE);
	//text("br: " + bodies, width - ( 75 * GUI_SCALE ), 32 * GUI_SCALE);
	textSize(16);
	
	//text(Math.round(tra_rot_x(cursorAbsX, cursorAbsY)) + " " + Math.round(tra_rot_y(cursorAbsX, cursorAbsY)), width - 225, 32);
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
		//}else if (keyCode === 80){
			//pathPredictEnabled = !pathPredictEnabled;
		}else if (keyCode === 80){
			PLANET_CAM = !PLANET_CAM;
			
		}else if (keyCode === 66){ // B
			buildingDrawEnabled = !buildingDrawEnabled;	
			
		}else if (keyCode === 69){ // E
		
		// Hotbar
		}else if (keyCode >= 48 && keyCode <= 57){
			server.onUpdateRequest( keyCode - 49, "world", "getPlayer", "inventory", "selection" );
		}
	}
}

function mouseMoved() {
	
}

function mousePressed() {
	
	GuiHandler.onClick();
	
	if (bypassGameClick){ bypassGameClick = false; return; }
	
	if (!GROUP_INFOBAR.active){ return; };
	
	if (GuiHandler.getBuildingGhost()){
		buildingToPlace = GuiHandler.getBuildingGhost();
		GuiHandler.openWindow(GROUP_CITY_FOUND); return;
	}
	
	if (hoverEntity){
		selectedEntity = hoverEntity;
	}else{
		selectedEntity = null;
	}
	MissionHandler.onPlayerSelectEntity( client.world.getPlayer(), selectedEntity );
	//if (selectedEntity != null){ return; }
	//if (client.world.getPlayer().dead){ return; }
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
	
	// 81 Q 69 E
	
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