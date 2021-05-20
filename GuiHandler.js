TITLE_VERSION = "Space Game pre alpha 0.1.1c";

var mainelement = document.getElementById("main");
document.title = TITLE_VERSION;

GUI_SCALE = 1.5;
MOUSE_SENSITIVITY = 1;
PLANET_CAM = true; cam_rot = 0;

lasttouches = [];
options_buffer = {}; // This is used to buffer changes in the options menu
// Each key is an array containing a set of strings referring to the path of the variable
// and the value associated is the value assigned to said variable

class GuiHandler {	
	static elements = []; // outermost parent elements here, child elements contained within..
	
	static init(){
		
		if (getItem("GUI_SCALE")){
			GUI_SCALE = getItem("GUI_SCALE");
		}
		
		if (getItem("MOUSE_SENSITIVITY")){
			MOUSE_SENSITIVITY = getItem("MOUSE_SENSITIVITY");
		}
		
	}
	
	static update(){
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (true){
				e.update();
			}
		}
	}
	
	static openWindow( element ){
		
		// sets the previous outermost element to inactive
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.active = false;
			}
		}
		
		// Special case where these two are inseperable, TODO maybe put these into a bigger super-group
		if (element == GROUP_INFOBAR){
			GROUP_HOTBAR.active = true;
			GROUP_HOTBAR.show();
			BUTTON_MENU.active = true;
			BUTTON_MENU.show();
		}
		
		element.active = true;
		
		element.show();
		
	}
	
	static onClick(){
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.click();
			}
		}
	}
	
	static render(){
		
		scale(GUI_SCALE);
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			e.render();
		}
		
		resetMatrix()
	}
	
	// Draws the names of the cities pointing toward their location. The text is angled radially to point towards the center of the planet. The text will always face upward if possible.
	static drawCityLabels(){
		for (key in client.world.cities){
			
			if (cam_zoom < MIN_CITY_TEXT_ZOOM){ break; };
			
			var city = client.world.cities[key]; var nation = city.getNation();
			var centerslice = city.getPlanet().getAbsPointsSlice( city.centerIndex, city.centerIndex );
			var centerx = centerslice[0]; var centery = centerslice[1];
			
			var angle = city.getPlanet().dir + ( 2 * Math.PI ) * ( city.centerIndex / city.getPlanet().terrainSize );
			angle = loopyMod( angle, Math.PI*2 );
			
			var radius = 20 + (16 * cam_zoom);
			centerx += ( radius * Math.cos(angle)); centery += ( radius * Math.sin(angle));
			
			stroke( nation.color[0], nation.color[1], nation.color[2] ); 
			fill  ( nation.color[0], nation.color[1], nation.color[2] );
			
			push();
			translate(tra_x(centerx), tra_y(centery));
			
			var citystring;
			
			if (PLANET_CAM){
				angle -= (cam_rot + HALF_PI);
				angle = loopyMod(angle, Math.PI*2);
			}
			
			// This part here decides whether the text is facing up or down and adjusts the angle accordingly
			if (angle > Math.PI / 2 && angle < (3 * Math.PI)/2){
				angle -= Math.PI ;
				angle = loopyMod( angle, Math.PI*2 );
				textAlign(RIGHT);
				
				citystring = city.name + " →";
				if (client.world.player.getNation().getCapitalCity() == city){
					citystring = "⌂ " + citystring;
				}
			}else{
				textAlign(LEFT);
				citystring = "← " + city.name;
				if (client.world.player.getNation().getCapitalCity() == city){
					citystring = citystring + " ⌂";
				}
			}
			
			if (PLANET_CAM){
				angle += (cam_rot + HALF_PI);
			}
			
			rotate(angle);
			
			textSize(24);
			text(citystring, 0, 0);
			
			pop();
			textAlign(LEFT);
		}
	}
	
	static handleTouches(){
		
		var player = client.world.getPlayer();
		
		cursorAbsX = untra_x( mouseX, mouseY ); cursorAbsY = untra_y( mouseX, mouseY );
	
		// TOUCHSCREEN HANDLING
		
		// The single touch is complicated because it can do many actions. Let's try to break it down:
		
		if (touches.length == 1){
			// This is both random accidental screen tap protection, and, also allows double touch events to not
			// accidentally trigger single touch events (you know, both fingers dont touch the screen on the same tick hardly ever)
			// so there is a 15-tick window for a single touch event to add on more touches, before it's registered as a single touch
			
			if (lasttouches.length==0){ singletouchtimer = 0;}else{ singletouchtimer++; }
			
			if (singletouchtimer > 15){
				
				//cursorAbsX = untra_x( touches[0].x ); cursorAbsY = untra_y( touches[0].y );
				
				// First, it will try to find a gui element and interact with it. All other actions will be skipped.
				
				GuiHandler.onClick();
	
				if (bypassGameClick){ bypassGameClick = false; return; }
				
				// Second, it will try to find an entity to select. All other actions will be skipped.
				
				if (hoverEntity){
					selectedEntity = hoverEntity; return;
				}else{
					selectedEntity = null;
				}
				
				// Then, it will make sure you are on the main screen, and if so, then you can modify the player's movement with the touch.
				// TODO: Partition the screen into four quadrants to allow the same kind of control that WASD has!
				
				if (!GROUP_INFOBAR.active){ return; };
				
				var abs_angle = Math.atan2( cursorAbsY - player.y, cursorAbsX - player.x );
				
/* 				if ( PLANET_CAM ){
				
					var rel_angle = abs_angle - cam_rot - HALF_PI// - (player.dir % HALF_PI);
				
				} else {
					
					var rel_angle = abs_angle;
				}
				
				rel_angle = rel_angle % PI; */
				
				//console.log(rel_angle);
				
/* 				if ( rel_angle > -HALF_PI/2 && rel_angle < HALF_PI/2){
					server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
				} 
				else if ( rel_angle > HALF_PI/2 && rel_angle < HALF_PI ){
					server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
				}
				else if ( rel_angle > -HALF_PI && rel_angle < -HALF_PI/2 ){
					server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
				} */
				
				//var angle = Math.atan2(touches[0].y - tra_y(player.y) , touches[0].x - tra_x(player.x));
				
				abs_angle = loopyMod(abs_angle - player.dir, PI*2);
				
				// forward
				if ( abs_angle < HALF_PI/2 || abs_angle > (3/2)*PI + (1/4)*PI ){
					server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
				} 
				// left
				if ( abs_angle > PI + (1/4)*PI && abs_angle < (3/2)*PI + (1/4)*PI ){
					server.onUpdateRequest( player.dir - 0.1, "world", "player", "dir" );
				} 
				// right
				if ( abs_angle > HALF_PI/2 && abs_angle < 3 * HALF_PI/2 ){
					server.onUpdateRequest( player.dir + 0.1, "world", "player", "dir" );
				}
				if ( abs_angle > 3 * HALF_PI/2 && abs_angle < PI + (1/4)*PI) {
					
					if (player.boostForce.magnitude > 0) {
					
						server.onUpdateRequest( player.boostForce.magnitude - 0.005, "world", "getPlayer", "boostForce", "magnitude" );
					
					}
				}
				
				if (framecount % 30 == 0){
					//console.log(abs_angle);
				}
				//server.onUpdateRequest( abs_angle, "world", "player", "dir" );
				
			}
		}
		
		// The double touch is simpler because it just handles the camera zoom. Maybe in the future it will do more
		
		if (touches.length == 2 && lasttouches.length == 2){
			
			var thistickdist = CollisionUtil.euclideanDistance( touches[0].x, touches[0].y, touches[1].x, touches[1].y);
			var lasttickdist = CollisionUtil.euclideanDistance( lasttouches[0].x, lasttouches[0].y, lasttouches[1].x, lasttouches[1].y);
			
			var diff = thistickdist - lasttickdist;
			//console.log(diff);
			cam_zoom += ((cam_zoom / 25) * (diff / 11 ))
		}
		// deep copy of last tick's touch events
		lasttouches = [];
		for (var i = 0; i < touches.length; i++){
			lasttouches[i] = touches[i];
		}
	}
}