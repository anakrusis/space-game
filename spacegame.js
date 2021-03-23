var canvas;
var ctx;

var keysDown = {};

var framecount = 0;

CHUNK_DIM = 16384; // both width and height of the chunks are equal. this could technically be very large.

server = new Server();
//server.world = new World();

client = new Client();

function setup(){
	createCanvas(400, 400);
}

function draw(){
	var outerw  = window.innerWidth;
	var outerh = window.innerHeight;
	var window_aspect_ratio = outerh/outerw
	
	bodydiv = document.getElementById("bodydiv");
	var cw = bodydiv.offsetWidth - 30;
	var ch = cw * (window_aspect_ratio)
	resizeCanvas(cw, ch);
	
	background(13,0,13);
	//applyMatrix(cam_zoom, 0, 0, cam_zoom, cam_x + width/2, cam_y + height/2);
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (!(e instanceof EntityPlayer)){ drawEntity(e); }
	}
	
	for ( var chunk of client.world.getLoadedChunks() ) {
		//ctx.strokeStyle = "rgb(128, 128, 128)";
		//var chunkx = tra_x(chunk.x * CHUNK_DIM); var chunky = tra_y(chunk.y * CHUNK_DIM);
		//ctx.strokeRect( chunkx , chunky , CHUNK_DIM * cam_zoom, CHUNK_DIM * cam_zoom);
		stroke(128);
		noFill();
		square(tra_x(chunk.x * CHUNK_DIM), tra_y(chunk.x * CHUNK_DIM), CHUNK_DIM * cam_zoom);
		
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
			
			if (cam_zoom < 1.5){ var scale = 20/cam_zoom; } else { var scale = 1; }
			var fx = e.x; var fy = e.y;
			stroke(e.color[0] / 2, e.color[1] / 2, e.color[2] / 2);
			noFill();
			beginShape();
			for (var i = 0; i < e.futurePointsX.length; i++){
				fx = e.futurePointsX[i]; fy = e.futurePointsY[i];
				vertex(tra_x(fx),tra_y(fy));
			}
			endShape();
			
			drawEntity(e, scale); 
		}
	}
	
	//resetMatrix();
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

var init = function(){
	canvas = document.getElementById("Canvas");
	//canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto;"
	
	//canvas.style = "margin:auto;"
	
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	addEventListener("keydown", function (e) { // when a key is pressed
		keysDown[e.keyCode] = true;
	}, false);

	addEventListener("keyup", function (e) { // when a key is unpressed
		delete keysDown[e.keyCode];
	}, false);
	
	// TODO make use of these functions (very soon)
	
	if (ctx) {
		// React to mouse events on the canvas, and mouseup on the entire document
		//canvas.addEventListener('mousedown', mousedown, false);
		//canvas.addEventListener('mousemove', mousemove, false);
		//window.addEventListener('mouseup',   mouseup, false);

		// React to touch events on the canvas
		//canvas.addEventListener('touchstart', touchstart, false);
		//canvas.addEventListener('touchmove', touchmove, false);
		canvas.addEventListener('click', function (e) {
			
		});	
	}
	
	// main loop
	var main = function () {
		var now = Date.now();
		var delta = now - then;
		
		if (framecount % 1 == 0){
			update(delta);
		}
		//render();
		
		framecount++;
		
		then = now;
		requestAnimationFrame(main);
	};
	var w = window;
	requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

	var then = performance.now();
	main();
}

var update = function(delta){
	server.update();
	
	var player = client.world.getPlayer();
	if (player){
		if (87 in keysDown) { // up
			if (player.boostForce.magnitude < 5) {
				server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
			}
		}
		else if (83 in keysDown) { // down
			if (player.boostForce.magnitude > 0) {
				server.onUpdateRequest( player.boostForce.magnitude - 0.005, "world", "player", "boostForce", "magnitude" );
			}
			
		}else{
			//server.onUpdateRequest( player.velocity / 1.01, "world", "player", "velocity" );
			
		}
		
		if (65 in keysDown) { // left
			server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
		}
		if (68 in keysDown) { // right
			server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
		}
		
		if (82 in keysDown){
			server.onUpdateRequest( 0, "world", "player", "boostForce", "magnitude" );
		}
	}
	
	if (80 in keysDown){
		var myJSON = JSON.stringify(server.world);
		document.getElementById("bodydiv2").innerHTML = myJSON;
	}
	
	if (81 in keysDown) { // q
		cam_zoom += (cam_zoom / 25);
		
	}else if (69 in keysDown) { // e
		cam_zoom -= (cam_zoom / 25);
	}
	
}

var render = function(){
	var outerw  = window.innerWidth;
	var outerh = window.innerHeight;
	var window_aspect_ratio = outerh/outerw
	
	bodydiv = document.getElementById("bodydiv");
	canvas.width = bodydiv.offsetWidth - 30;
	canvas.height = canvas.width * (window_aspect_ratio)
	
	ctx.fillStyle = "rgb(13, 0, 13)"; // blank color for the canvas
	ctx.fillRect(0,0,canvas.width,canvas.height);
	ctx.lineWidth = 1;
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (!(e instanceof EntityPlayer)){ renderEntity(e); }
	}
	
	for ( var chunk of client.world.getLoadedChunks() ) {
		ctx.strokeStyle = "rgb(128, 128, 128)";
		var chunkx = tra_x(chunk.x * CHUNK_DIM); var chunky = tra_y(chunk.y * CHUNK_DIM);
		ctx.strokeRect( chunkx , chunky , CHUNK_DIM * cam_zoom, CHUNK_DIM * cam_zoom);
		
		for ( var uuid in chunk.bodies ){
			var b = chunk.bodies[uuid];
			
			if (b instanceof BodyPlanet){
				var orbitbody = new EntityBody(b.getStar().x, b.getStar().y, 0, b.getOrbitDistance());
				orbitbody.color = [0, 128, 0]; orbitbody.filled = false;
				renderEntity(orbitbody);
			}
			
			renderEntity(b);
		}
	}
	
	for ( var uuid in client.world.entities ){
		var e = client.world.entities[uuid];
		if (e instanceof EntityPlayer){ renderEntity(e); }
	}
	var c = 1;
	for (var force of client.world.player.forceVectors){
		ctx.fillText("Mag: " + force.magnitude + " Dir: " + force.dir, 20, c*40);
		c++;
		var spx = client.world.player.x; var spy = client.world.player.y;
		var dpx = spx + (20 * force.magnitude * Math.cos(force.dir));
		var dpy = spy + (20 * force.magnitude * Math.sin(force.dir));
		ctx.beginPath();
		ctx.moveTo( tra_x( spx ), tra_y( spy ) );
		ctx.lineTo( tra_x( dpx ), tra_y( dpy ) );
		ctx.closePath();
		ctx.stroke();
	}
	ctx.strokeStyle = "rgb(240, 0, 0)";
	var spx = client.world.player.x; var spy = client.world.player.y;
	var dpx = spx + (20 * Math.cos(avgDirection)); var dpy = spy + (20 * Math.sin(avgDirection));
	ctx.beginPath();
	ctx.moveTo( tra_x( spx ), tra_y( spy ) );
	ctx.lineTo( tra_x( dpx ), tra_y( dpy ) );
	ctx.closePath();
	ctx.stroke();
	
	ctx.fillText("Player dir: " + client.world.player.dir, 20, 200)
};

var renderEntity = function(e){
	if (e.filled){
		ctx.fillStyle = "rgb(" + e.color[0] + ", " + e.color[1] + ", " + e.color[2] + ")";
	}else{
		ctx.strokeStyle = "rgb(" + e.color[0] + ", " + e.color[1] + ", " + e.color[2] + ")";
	}
	var pts = e.getAbsolutePoints();
	
	ctx.beginPath();
	ctx.moveTo(tra_x(pts[0]), tra_y(pts[1]));
	for (i = 0; i < pts.length; i += 2){
		var px = pts[i]; var py = pts[i+1];
		ctx.lineTo(tra_x(px), tra_y(py));
		
	}
	ctx.closePath();
	if (e.filled){ ctx.fill(); } else { ctx.stroke(); };
}

init();