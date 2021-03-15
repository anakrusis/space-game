var canvas;
var ctx;

var keysDown = {};

var startClient = function(){
	canvas = document.getElementById("Canvas");
	//canvas.style = "position: absolute; top: 0px; left: 0px; right: 0px; bottom: 0px; margin: auto;"
	
	//canvas.style = "margin:auto;"
	
	ctx = canvas.getContext("2d");
	ctx.imageSmoothingEnabled = false;
	
	addEventListener("keydown", function (e) { // when a key is pressed
		keysDown[e.keyCode] = true;
		//event.preventDefault();
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
	
}

var render = function(){
	var outerw  = window.innerWidth;
	var outerh = window.innerHeight;
	var window_aspect_ratio = outerh/outerw
	
	bodydiv = document.getElementById("bodydiv");
	canvas.width = bodydiv.offsetWidth - 30;
	canvas.height = canvas.width * (window_aspect_ratio)
};

startClient();