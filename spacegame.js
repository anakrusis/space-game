var framecount = 0;
var selectedEntity = null;

CHUNK_DIM = 65536; // both width and height of the chunks are equal. this could technically be very large.

server = new Server();
server.init(); server.world.init();
//server.world = new World();

client = new Client();

var mainelement = document.getElementById("main");

function loopyMod(x, m) {
	return (x % m + m) % m;
}

function setup(){
	createCanvas(400, 400);

	settings = QuickSettings.create(0, 0, "Space Game 0.0.1 2021-03-28", mainelement);
	
	settings.addHTML("fps", "b");
	
	settings.addHTML("planet", "goes the weasal"); 
	settings.hideTitle("planet");
	settings.hideTitle("fps");
	
}

function draw(){
	settings.setWidth(width/4);
	
	settings.setValue("fps", "FPS: " + Math.round(frameRate()));
	
	if (selectedEntity){
		var infostring = "<b>" + selectedEntity.name + "</b><br>"
		var daylen = 2 * Math.PI / selectedEntity.rotSpeed / 60 / 60;
		infostring += "Day length: " + Math.round(daylen) + " Earth minutes<br>"
		var yearlen = selectedEntity.orbitPeriod / 60 / 60;
		infostring += "Year length: " + Math.round(yearlen) + " Earth minutes<br>"
		
		settings.setValue("planet", infostring);	
		settings.showControl("planet");
	}else{
		settings.hideControl("planet");
	}
	
	if (framecount % 1 == 0){
		update();
	}
	framecount++;
	
	var outerw  = window.innerWidth;
	var outerh = window.innerHeight;
	var window_aspect_ratio = outerh/outerw
	
	bodydiv = document.getElementById("bodydiv");
	var cw = bodydiv.offsetWidth - 30;
	var ch = cw * (window_aspect_ratio)
	resizeCanvas(windowWidth, windowHeight);
	
	background(13,0,13);
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (!(e instanceof EntityPlayer)){ drawEntity(e); }
	}
	
	for ( var chunk of client.world.getLoadedChunks() ) {
		//ctx.strokeStyle = "rgb(128, 128, 128)";
		var chunkx = tra_x(chunk.x * CHUNK_DIM); var chunky = tra_y(chunk.y * CHUNK_DIM);
		//ctx.strokeRect( chunkx , chunky , CHUNK_DIM * cam_zoom, CHUNK_DIM * cam_zoom);
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
			
			drawEntity(b);
		}
	}
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e instanceof EntityPlayer){ 
			
			if (cam_zoom < 1.5){ var escala = 20/cam_zoom; } else { var escala = 1; }
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
			
			drawEntity(e, escala); 
		}
	}
	
}

var drawEntity = function(e, scale){
	if (!scale){ scale = 1; }
	
	if (e.filled){
		fill(e.color[0], e.color[1], e.color[2]);
		//ctx.fillStyle = "rgb(" + e.color[0] + ", " + e.color[1] + ", " + e.color[2] + ")";
	}else{
		noFill();
		//ctx.strokeStyle = "rgb(" + e.color[0] + ", " + e.color[1] + ", " + e.color[2] + ")";
	}
	stroke(e.color[0], e.color[1], e.color[2]);
	var pts = e.getAbsolutePoints();
	beginShape();
	for (i = 0; i < pts.length; i += 2){
		var px = pts[i]; var py = pts[i+1];
		px = ((px - e.x) * scale) + e.x;  py = ((py - e.y) * scale) + e.y; 
		vertex(tra_x(px), tra_y(py));
	}
	endShape(CLOSE);
}

var predictFuturePoints = function(player){
	var futurePointsX = [];
	var futurePointsY = [];

	var e = new Entity( player.x, player.y, player.dir );
	var markedDead = false;
	for (var i = 0; i < 500; i++){
		e.update();
		if (e.isDead() || e.grounded){ 
			if (markedDead){
				break;
			}
			markedDead = true;
		};
		e.boostForce = player.boostForce; e.boostForce.dir = e.dir;
		e.forceVectors.push(e.boostForce);
		futurePointsX.push(e.x); futurePointsY.push(e.y);
	}
	return [futurePointsX, futurePointsY];
}

function keyPressed() {
	if (keyCode === 70){
		fullscreen(!fullscreen());
	}
}

var update = function(){
	server.update();
	
	var player = client.world.getPlayer();
	if (player){
		if (keyIsDown(87)) { // up
			if (player.boostForce.magnitude < 5) {
				server.onUpdateRequest( player.boostForce.magnitude + 0.0025, "world", "getPlayer", "boostForce", "magnitude" );
			}
		}
		else if (keyIsDown(83)) { // down
			if (player.boostForce.magnitude > 0) {
				server.onUpdateRequest( player.boostForce.magnitude - 0.0025, "world", "player", "boostForce", "magnitude" );
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
	
	cursorAbsX = untra_x( mouseX ); cursorAbsY = untra_y( mouseY );
	selectedEntity = null;
	cursorChunkX = Math.floor(cursorAbsX / CHUNK_DIM); cursorChunkY = Math.floor(cursorAbsY / CHUNK_DIM); 
	cursorEntity = new Entity(cursorAbsX, cursorAbsY, 0);
	
	var cc = client.world.getChunk(cursorChunkX,cursorChunkY);
	if (cc){
		for (var uuid in cc.bodies) {
			var body = cc.bodies[uuid];
			if (CollisionUtil.isColliding(cursorEntity, body) && body.canEntitiesCollide){
				selectedEntity = body; break;
			}
		}
	}
}