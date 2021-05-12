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
	
	//var px = client.world.getPlayer().getNearestBody().x;
	//var py = client.world.getPlayer().getNearestBody().y;
	
	//output = rot_x( -cam_rot, (x - px), (y - py)) + px;
	//output = rot_x( cam_rot, (x + originx), ( y + originy ) ) - originx;
	var outputx = x - originx;
	var outputy = y - originy;
	
	//outputx = rot_x( cam_rot, outputx - originx, outputy - originy ) + originx;
	//outputy = rot_y( cam_rot, outputx - originx, outputy - originy ) + originy;
	//var output = rot_x(-cam_rot, (x - originx), (y - originy));
	
	outputx = ( (outputx) / cam_zoom ) + cam_x ;
	outputy = ( (outputy) / cam_zoom ) + cam_y ;
	
	return outputx;
	
	//return ((x - originx)/cam_zoom) + cam_x
}
var untra_y = function(x,y){
/* 	var originy = height / 2;
	return ((y - originy)/cam_zoom) + cam_y */
	
	var originx = width / 2;
	var originy = height / 2;
	
/* 	var output = y - originy;
	//output = rot_y( cam_rot, (x + originx), ( y + originy ) ) - originy;
	
	//var output = rot_y(-cam_rot, (x - originx), (y - originy));
	
	output = ( (output) / cam_zoom ) + cam_y ; */
	
	var outputx = x - originx;
	var outputy = y - originy;
	
	//outputx = rot_x( cam_rot, outputx - originx, outputy - originy ) + originx;
	//outputy = rot_y( cam_rot, outputx - originx, outputy - originy ) + originy;
	
	//var output = rot_x(-cam_rot, (x - originx), (y - originy));
	
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