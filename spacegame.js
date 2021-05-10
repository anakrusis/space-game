var framecount = 0;
var hoverEntity    = null; // entity that the mouse is hovering over
var selectedEntity = null; // entity which the mouse has clicked on
var selectedMission = null; // mission selected in the menus
var singletouchtimer = 0;
var cursorAbsX; var cursorAbsY;
var bypassGameClick = false; // gui boolean for when a gui element is clicked, not to trigger anything in game world

var pathPredictEnabled = true;
var trajPredictor = new Entity(0,0,0);
var trajectory = [[],[]];
var dir_history = [];

var trajectoryBuffer = [[],[]];
var traj_pointer = 0;

CHUNK_DIM = 524288; // both width and height of the chunks are equal. this could technically be very large.
MAX_ZOOM  = 100;

MIN_CITY_TEXT_ZOOM = 0.04; // anything smaller than this will not render city label names

MAX_INTERPLANETARY_ZOOM = 0.333; // anything larger than this will only render a single planet (the planet the player is nearest to/in the gravity radius of)
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

function setup(){

	document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
	
	createCanvas(windowWidth, windowHeight);
	frameRate(60);
	
	server = new Server();
	server.init(); server.world.init();
	//server.world = new World();

	client = new Client();
	update(); update(); update(); // I guess it takes three ticks to position everything correctly (including the camera and player)

	//settings = QuickSettings.create(0, 0, "Space Game 0.0.1 2021-04-02", mainelement);	
}

function draw(){
	
	if (GROUP_INFOBAR.active){
		update();
	}
	framecount++;
	
	background(13,0,13);
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e.isOnScreen()){
			if (!(e instanceof EntityPlayer || e instanceof EntityOreVein)){ drawEntity(e); }
		}
	}
	
	// Optimized version that only renders the nearest body when above a certain zoom level
	
	if (cam_zoom > MAX_INTERPLANETARY_ZOOM){
		
		b = client.world.getPlayer().getNearestBody();
		
		if (b.oceanUUID){
			var ocean = b.getChunk().getBody(b.oceanUUID);
			drawEntity(ocean);
		}
		drawEntity(b);
			
	}else if (cam_zoom > MAX_INTERSTELLAR_ZOOM){
		
		var chunk = client.world.getPlayer().getChunk();
		var chunkx = tra_x(chunk.x * CHUNK_DIM); var chunky = tra_y(chunk.y * CHUNK_DIM);
		stroke(128);
		noFill();
		square(chunkx, chunky, CHUNK_DIM * cam_zoom);
	
		for ( var uuid in chunk.bodies ){
			var b = chunk.bodies[uuid];
			
			if (b instanceof BodyPlanet){
				
				if (b.oceanUUID){
					var ocean = b.getChunk().getBody(b.oceanUUID);
					drawEntity(ocean);
				}
				
				var orbitbody = new EntityBody(b.getStar().x, b.getStar().y, 0, b.getOrbitDistance());
				orbitbody.color = [0, 128, 0]; orbitbody.filled = false;
				drawEntity(orbitbody);
			}
			if (!(b instanceof BodyOcean)){
				drawEntity(b);
			}
		}
		
	// Full version that renders all loaded chunks fully (not very optimized, needs work)
	}else{
		
		for ( var chunk of client.world.getLoadedChunks() ) {
			
			var chunkx = tra_x(chunk.x * CHUNK_DIM); var chunky = tra_y(chunk.y * CHUNK_DIM);
			stroke(128);
			noFill();
			square(chunkx, chunky, CHUNK_DIM * cam_zoom);
			
			for ( var uuid in chunk.bodies ){
				var b = chunk.bodies[uuid];
				
				if (b instanceof BodyStar){
					drawEntity(b);
				}
			}
		}
	}
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e.isOnScreen()){
			if (e instanceof EntityOreVein && cam_zoom > MAX_INTERPLANETARY_ZOOM){
				drawEntity(e);
			}
			if (e instanceof EntityPlayer){ 
				
				if (cam_zoom < 1.5){ var escala = 20/cam_zoom; } else { var escala = 1; }
		
				stroke(e.color[0] / 2, e.color[1] / 2, e.color[2] / 2);
				//drawPointsTrailFromEntity(e, trajectoryBuffer);
				
				updateTrajectory(e);
				//stroke(255,0,0);
				drawPointsTrailFromEntity(e, predictFuturePoints(e));
				
				drawEntity(e, escala); 
			}
		}
	}
	
	GuiHandler.update();
	GuiHandler.drawCityLabels();
	GuiHandler.render();
	
	GuiHandler.handleTouches();
	fill(255,0,0);
	circle(tra_x(cursorAbsX), tra_y(cursorAbsY), 5);
	
	stroke(255); fill(255);
	textSize(16);
	textFont("Courier");
	text("FPS: " + Math.round(frameRate()), width - 75, 16);
	
	text("" + traj_pointer, width - 75, 32);
}

var drawPointsTrailFromEntity = function(e, points){
		// This renders the trail in front of the player predicting where it will be in the next 500 ticks
	if (!e.isDead()){
		var fx = e.x; var fy = e.y;
		var futurePointsX = points[0]; var futurePointsY = points[1];
		
		noFill();
		beginShape();
		for (var i = 0; i < futurePointsX.length; i+=1){
			fx = futurePointsX[i]; fy = futurePointsY[i];
			vertex(tra_x(fx),tra_y(fy));
		}
		endShape();
	}
}

var drawEntity = function(e, scale){
	if (!e){ return; };
	if (e.isDead()){ return; };
	if (!scale){ scale = 1; }
	
	if (e.filled){
		fill(e.color[0], e.color[1], e.color[2]);
	}else{
		noFill();
	}
	if (selectedEntity == e){
		stroke(255, 255 * (1 + Math.sin(framecount / 15)), 0);
		strokeWeight(5);
	}else{
		stroke(e.color[0], e.color[1], e.color[2]);
		strokeWeight(1);
	}
	var pts = e.getRenderPoints();
	beginShape();
	for (i = 0; i < pts.length; i += 2){
		var px = pts[i]; var py = pts[i+1];
		px = ((px - e.x) * scale) + e.x;  py = ((py - e.y) * scale) + e.y; 
		vertex(tra_x(px), tra_y(py));
	}
	endShape(CLOSE);
	
	if (e instanceof BodyPlanet){
		stroke(128);
		strokeWeight(0.5 * cam_zoom);
		for (var i = 0; i < e.terrainSize; i++){
			if (e.tiles[ i ].hasRoad){
				beginShape();
				//console.log("e");
				var slice = e.getAbsPointsSlice( i, i );
				vertex(tra_x(slice[0]), tra_y(slice[1])); vertex(tra_x(slice[2]), tra_y(slice[3]));
				endShape(CLOSE);
			}
		}
		strokeWeight(1);
	}
/* 	if (e instanceof EntityBuilding){
		var pts = e.getAbsolutePoints();
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			var px = pts[i]; var py = pts[i+1];
			px = ((px - e.x) * scale) + e.x;  py = ((py - e.y) * scale) + e.y; 
			vertex(tra_x(px), tra_y(py));
		}
		endShape(CLOSE);
	} */
	
	strokeWeight(1);
}

var doTrajectoryStep = function(e, player){
	
	e.boostForce = player.boostForce; e.boostForce.dir = e.dir;
	e.forceVectors.push(e.boostForce);
	
	e.update();
	
	if (e.isDead() || e.grounded){ 
		return;
	}
	
	trajectory[0].push(e.x); trajectory[1].push(e.y); dir_history.push(e.dir);
}

var updateTrajectory = function(player){
	
	if (!pathPredictEnabled){ 
		trajectory = [[],[]]; return; 
	}
	
	if ( framecount % 600 == 0 ){
		trajectory = [[],[]];
	}
	
	var lastx = trajectory[0][ trajectory[0].length - 1 ];
	var lasty = trajectory[1][ trajectory[1].length - 1 ];
	var lastdir = dir_history[ dir_history.length - 1 ]
	
	if (!lastx){
		traj_pointer = 0;
		
		lastx = player.x;
		lasty = player.y;
		lastdir = player.dir;
	}
	
	trajPredictor.x = lastx; trajPredictor.y = lasty; trajPredictor.dir = lastdir;
	
	//trajPredictor.boostForce = player.boostForce; trajPredictor.boostForce.dir = trajPredictor.dir;
	//trajPredictor.forceVectors.push(trajPredictor.boostForce);
	
	//var e = new Entity(lastx, lasty, lastdir );
	
	if (trajectory[0].length < 1000){
		
		for (var i = 0; i < 5; i++){
			doTrajectoryStep(trajPredictor, player);
			traj_pointer++;
		}
		
	}else{
		doTrajectoryStep(trajPredictor, player);
	}
	
	trajectory[0].shift(); trajectory[1].shift(); dir_history.shift();
	
/* 	if (trajectory[0].length < 500){
		//
		
	}else{
		//trajectory[0].splice(125); trajectory[1].splice(125); dir_history.splice(125);
		//trajectory[0].length = 500; trajectory[1].length = 500; dir_history.length = 500;
		
		trajectory[0].shift(); trajectory[1].shift(); dir_history.shift();
	} */
}

var predictDerivativePoints = function(player){
	if (!pathPredictEnabled){ return [[],[]]; }
	
	var nearbody = player.getNearestBody();
	
	var futurePointsX = [];
	var futurePointsY = [];
	
	var angacc = player.angacc;
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
	}
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
	if (keyCode === 70){
		fullscreen(!fullscreen());
	}else if (keyCode === 80){
		pathPredictEnabled = !pathPredictEnabled;
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
}

function mouseWheel(e) {
	
	//console.log(e.delta);
	//cam_zoom -= (cam_zoom / 25) * (e.delta / 25);
	
	cam_zoom -= (cam_zoom / 25) * (e.delta * MOUSE_SENSITIVITY / 25);
	cam_zoom = Math.min(cam_zoom, MAX_ZOOM);
	cam_zoom = Math.max(cam_zoom, MIN_ZOOM);

	return false;
}

// This is truly a double-duty function, doing both serverside and clientside calls. However, the backend behavior is almost entirely relegated to the corresponding objects (World, Chunk, Entity) whereas the clientside behavior is mostly in here (or the GuiHandler and its constituents)

// For multiplayer test, the server side calls will be moved and all the rest will stay put!

var update = function(){
	
	server.update();
	var player = client.world.getPlayer();
	
	// KEYBOARD HANDLING
	
	if (player){
		if (keyIsDown(87)) { // up
			if (player.boostForce.magnitude < 10) {
				server.onUpdateRequest( player.boostForce.magnitude, "world", "player", "lastBoostForce", "magnitude" );
				server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
				trajectory = [[],[]]; dir_history = [];
			}
		}
		else if (keyIsDown(83)) { // down
			if (player.boostForce.magnitude > 0) {
				server.onUpdateRequest( player.boostForce.magnitude, "world", "player", "lastBoostForce", "magnitude" );
				server.onUpdateRequest( player.boostForce.magnitude - 0.005, "world", "player", "boostForce", "magnitude" );
				trajectory = [[],[]]; dir_history = [];
			}
			
		}else{
			//server.onUpdateRequest( player.velocity / 1.01, "world", "player", "velocity" );
			
		}
		
		if (keyIsDown(65)) { // left
			server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
			trajectory = [[],[]]; dir_history = [];
		}
		if (keyIsDown(68)) { // right
			server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
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
	
	hoverEntity = null;
	cursorChunkX = Math.floor(cursorAbsX / CHUNK_DIM); cursorChunkY = Math.floor(cursorAbsY / CHUNK_DIM); 
	cursorEntity = new Entity(cursorAbsX, cursorAbsY, 0);
	
	var cc = client.world.getChunk(cursorChunkX,cursorChunkY);
	if (cc){
		for (var uuid in cc.bodies) {
			var body = cc.bodies[uuid];
			if (CollisionUtil.isColliding(cursorEntity, body) && body.canEntitiesCollide){
				hoverEntity = body; break;
			}
		}
	}
	for (var uuid in client.world.entities){
		entity = client.world.entities[uuid];
		if (entity.isOnScreen()){
			if ((entity instanceof EntityBuilding || entity instanceof EntityOreVein) && CollisionUtil.isEntityCollidingWithEntity(cursorEntity, entity)){
				hoverEntity = entity;
			}
		}
	}
	
	cam_zoom = Math.min(cam_zoom, MAX_ZOOM);
	cam_zoom = Math.max(cam_zoom, MIN_ZOOM);
}