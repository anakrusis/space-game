BYPASS_P5_CLICK = false;

var framecount = 0;
var hoverEntity    = null; // entity that the mouse is hovering over
var selectedEntity = null; // entity which the mouse has clicked on
var singletouchtimer = 0;
var cursorAbsX; var cursorAbsY;

var pathPredictEnabled = true;

CHUNK_DIM = 524288; // both width and height of the chunks are equal. this could technically be very large.
MAX_ZOOM  = 100;

MAX_INTERPLANETARY_ZOOM = 0.333; // anything larger than this will only render a single planet (the planet the player is nearest to/in the gravity radius of)
MAX_INTERSTELLAR_ZOOM   = 0.001; // anything larger than this will render a whole star system and its planets but no buildings/small details(TODO)
// anything smaller than this will only render stars (no planets)

MIN_ZOOM  = 0.001;

server = new Server();
server.init(); server.world.init();
//server.world = new World();

client = new Client();

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

	//settings = QuickSettings.create(0, 0, "Space Game 0.0.1 2021-04-02", mainelement);	
}

function draw(){

	GuiHandler.update();
	
	if (framecount % 1 == 0){
		update();
	}
	framecount++;
	
	background(13,0,13);
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (!(e instanceof EntityPlayer || e instanceof EntityOreVein)){ drawEntity(e); }
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
	
	if (selectedEntity){
		var oldcolor = selectedEntity.color; var oldfilled = selectedEntity.filled;
		selectedEntity.color = [ 255, 255 * (1 + Math.sin(framecount / 15)), 0 ]; selectedEntity.filled = false;
		strokeWeight(5);
		drawEntity(selectedEntity);
		strokeWeight(1);
		selectedEntity.color = oldcolor, selectedEntity.filled = oldfilled;
	}
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e.isOnScreen()){
			if (e instanceof EntityOreVein && cam_zoom > MAX_INTERPLANETARY_ZOOM){
				drawEntity(e);
			}
			if (e instanceof EntityPlayer){ 
				
				if (cam_zoom < 1.5){ var escala = 20/cam_zoom; } else { var escala = 1; }
		
				// This renders the trail in front of the player predicting where it will be in the next 500 ticks
				if (!e.isDead()){
					var fx = e.x; var fy = e.y;
					var futurePoints = predictFuturePoints(e); var futurePointsX = futurePoints[0]; var futurePointsY = futurePoints[1];
					
					stroke(e.color[0] / 2, e.color[1] / 2, e.color[2] / 2);
					noFill();
					beginShape();
					for (var i = 0; i < futurePointsX.length; i+=10){
						fx = futurePointsX[i]; fy = futurePointsY[i];
						vertex(tra_x(fx),tra_y(fy));
					}
					endShape();
				}
				drawEntity(e, escala); 
			}
		}
	}
	
	stroke(255); fill(255);
	textSize(16);
	textFont("Courier");
	text("FPS: " + Math.round(frameRate()), width - 75, 16);
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
	stroke(e.color[0], e.color[1], e.color[2]);
	var pts = e.getRenderPoints();
	beginShape();
	for (i = 0; i < pts.length; i += 2){
		var px = pts[i]; var py = pts[i+1];
		px = ((px - e.x) * scale) + e.x;  py = ((py - e.y) * scale) + e.y; 
		vertex(tra_x(px), tra_y(py));
	}
	endShape(CLOSE);
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
	cursorAbsX = untra_x( mouseX ); cursorAbsY = untra_y( mouseY );
}

function mouseClicked() {
	
	if (BYPASS_P5_CLICK){ BYPASS_P5_CLICK = false; return; }
	
	if (GuiHandler.activeGroup != GROUP_INFOBAR){ return; };
	
	if (hoverEntity){
		cursorEntity = new Entity(cursorAbsX, cursorAbsY, 0);
		if (CollisionUtil.isEntityCollidingWithEntity(cursorEntity, hoverEntity)){
			selectedEntity = hoverEntity;
		}else{
			selectedEntity = null;
		}
	}else{
		selectedEntity = null;
	}
}

function mouseWheel(e) {
	
	//console.log(e.delta);
	//cam_zoom -= (cam_zoom / 25) * (e.delta / 25);
	
	cam_zoom -= (cam_zoom / 25) * (e.delta / 25);
	cam_zoom = Math.min(cam_zoom, MAX_ZOOM);
	cam_zoom = Math.max(cam_zoom, MIN_ZOOM);

	return false;
}

var update = function(){
	server.update();
	
	var player = client.world.getPlayer();
	
	// KEYBOARD HANDLING
	
	if (player){
		if (keyIsDown(87)) { // up
			if (player.boostForce.magnitude < 10) {
				server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
			}
		}
		else if (keyIsDown(83)) { // down
			if (player.boostForce.magnitude > 0) {
				server.onUpdateRequest( player.boostForce.magnitude - 0.005, "world", "player", "boostForce", "magnitude" );
			}
			
		}else{
			//server.onUpdateRequest( player.velocity / 1.01, "world", "player", "velocity" );
			
		}
		
		if (keyIsDown(65)) { // left
			server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
		}
		if (keyIsDown(68)) { // right
			server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
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
	
	// TOUCHSCREEN HANDLING
	
	if (touches.length == 1){
		// This is both random accidental screen tap protection, and, also allows double touch events to not
		// accidentally trigger single touch events (you know, both fingers dont touch the screen on the same tick hardly ever)
		// so there is a 20-tick window for a single touch event to add on more touches, before it's registered as a single touch
		
		if (lasttouches.length==0){ singletouchtimer = 0;}else{ singletouchtimer++; }
		
		if (singletouchtimer > 20){
			
			cursorAbsX = untra_x( touches[0].x ); cursorAbsY = untra_y( touches[0].y ); mouseClicked();
			
			var angle = Math.atan2(touches[0].y - tra_y(player.y) , touches[0].x - tra_x(player.x));
			//console.log(angle);
			server.onUpdateRequest( angle, "world", "player", "dir" );
			server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
		}
	}
	
	if (touches.length == 2 && lasttouches.length == 2){
		
		var thistickdist = CollisionUtil.euclideanDistance( touches[0].x, touches[0].y, touches[1].x, touches[1].y);
		var lasttickdist = CollisionUtil.euclideanDistance( lasttouches[0].x, lasttouches[0].y, lasttouches[1].x, lasttouches[1].y);
		
		var diff = thistickdist - lasttickdist;
		console.log(diff);
		cam_zoom += ((cam_zoom / 25) * (diff / 11 ))
	}
	// deep copy of last tick's touch events
	lasttouches = [];
	for (var i = 0; i < touches.length; i++){
		lasttouches[i] = touches[i];
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