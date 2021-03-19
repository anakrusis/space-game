var canvas;
var ctx;

var keysDown = {};

var framecount = 0;

server = new Server();
client = new Client();

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
	
		update(delta);
		render();
		
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
			server.onUpdateRequest( player.velocity + 0.005, "world", "player", "velocity" );
		}
		else if (83 in keysDown) { // down
			if (client.world.getPlayer().velocity > -0.3) {
				server.onUpdateRequest( player.velocity - 0.005, "world", "player", "velocity" );
			}
			
		}else{
			server.onUpdateRequest( player.velocity / 1.01, "world", "player", "velocity" );
			
		}
		
		if (65 in keysDown) { // left
			server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
		}
		if (68 in keysDown) { // right
			server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
		}
	}
	
	if (81 in keysDown) { // q
		cam_zoom += (cam_zoom / 25);
		
	}else if (69 in keysDown) { // e
		cam_zoom -= (cam_zoom / 25);
	}
	
	framecount++;
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
	
	for ( var chunk of client.world.loadedChunks ) {
		ctx.strokeStyle = "rgb(128, 128, 128)";
		var chunkx = tra_x(chunk.x * client.world.CHUNK_DIM); var chunky = tra_y(chunk.y * client.world.CHUNK_DIM);
		ctx.strokeRect( chunkx , chunky , client.world.CHUNK_DIM * cam_zoom, client.world.CHUNK_DIM * cam_zoom);
		
		for ( var uuid in chunk.bodies ){
			var b = chunk.bodies[uuid];
			
			if (b instanceof BodyPlanet){
				var orbitbody = new EntityBody(b.star.x, b.star.y, 0, b.getOrbitDistance());
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