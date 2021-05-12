var cam_x = 0;
var cam_y = 0;
var cam_dir = 0;
var cam_zoom = 32;
var cameraSpeed = 1;

var cam_destX = 0;
var cam_destY = 0;
var cam_destDir = 0;
var cam_destTime = 0;

var tra_x = function(x){ // translate x based on camera values
	var originx = width / 2;
	return ((x-cam_x)*cam_zoom)+originx
}

var tra_y = function(y){ // translate y based on camera values
	var originy = height / 2;
	return ((y-cam_y)*cam_zoom)+originy
}

var untra_x = function(x,y){ // these two convert screen pos back to ingame pos (for cursor clicking and stuff)
	
	var originx = width / 2;
	var originy = height / 2;
	
	if (PLANET_CAM){
	
		var ordx = x - (width / 2); var ordy = y - (height / 2);
				
		var rotx = rot_x( cam_rot + HALF_PI, ordx, ordy ) + width/2; 
		var roty = rot_y( cam_rot + HALF_PI, ordx, ordy ) + height/2; 
	
	} else {
		
		var rotx = x; var roty = y;
	}
	
	var outputx = rotx - originx;
	var outputy = roty - originy;
	
	outputx = ( (outputx) / cam_zoom ) + cam_x ;
	outputy = ( (outputy) / cam_zoom ) + cam_y ;
	
	return outputx;
}
var untra_y = function(x,y){
	
	var originx = width / 2;
	var originy = height / 2;
	
	if (PLANET_CAM){
	
		var ordx = x - (width / 2); var ordy = y - (height / 2);
				
		var rotx = rot_x( cam_rot + HALF_PI, ordx, ordy ) + width/2; 
		var roty = rot_y( cam_rot + HALF_PI, ordx, ordy ) + height/2; 
	
	} else {
		
		var rotx = x; var roty = y;
	}
	
	var outputx = rotx - originx;
	var outputy = roty - originy;
	
	outputx = ( (outputx) / cam_zoom ) + cam_x ;
	outputy = ( (outputy) / cam_zoom ) + cam_y ;
	
	return outputy;
}

var tra_x_o = function(x, orx){ // translate x based on camera values and a specified origin X point
	return ((x-cam_x)*cam_zoom)+orx
}

var tra_y_o = function(y, ory){ // translate y based on camera values and a specified origin Y point
	return ((y-cam_y)*cam_zoom)+ory
}

var rot_x = function(angle,x,y){
	return x * Math.cos(angle) - y * Math.sin(angle) // appends an X val
}

var rot_y = function(angle,x,y){
	return x * Math.sin(angle) + y * Math.cos(angle) // and a Y val
}

var setCamPos = function ( x, y, dir ){
	cam_x = x; cam_y = y; cam_dir = dir;
}

var setCamDest = function( x, y, dir, time ){
	cam_destX = x;
	cam_destY = y;
	cam_destDir = dir;
	cam_destTime = time;
}