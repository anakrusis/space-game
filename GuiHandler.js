TITLE_VERSION = "Space Game pre alpha 0.1.1e";
BUILD_DATE = "2021-07-13"

var mainelement = document.getElementById("main");
document.title = TITLE_VERSION;

GUI_SCALE = 1.5;
MOUSE_SENSITIVITY = 1;
PLANET_CAM = true; cam_rot = 0;
FANCY_TEXT = true; LORES_MODE = false;

lasttouches = [];
options_buffer = {}; // This is used to buffer changes in the options menu
// Each key is an array containing a set of strings referring to the path of the variable
// and the value associated is the value assigned to said variable

shiftDown = false;
backspaceTimer = 0;
BACKSPACE_TIMER_AMT = 20;

selectedTextEntry = null;

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
		
		shiftDown = false;
		if (keyIsDown(16)){
			shiftDown = true;
		}
		if (keyIsDown(8)){
			backspaceTimer--;
			if (backspaceTimer <= 0){
				
				if (framecount % 4 == 0){
					
					selectedTextEntry.setting = selectedTextEntry.setting.slice(0, -1);
					// = BACKSPACE_TIMER_AMT;
				}
			}
		}
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.update();
			}
		}
		if (LORES_MODE && FANCY_TEXT){ GUI_SCALE = 2; }
		
		if (this.lastLoresMode != LORES_MODE){
			pixelDensity( LORES_MODE ? 0.5 : 1 );
		}
		this.lastLoresMode = LORES_MODE;
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
		
		selectedTextEntry = null;
		
		for (var i = this.elements.length - 1; i >= 0; i--){
			var e = this.elements[i];
			if (e.active){
				e.click();
			}
		}
	}
	
	static render(){
		
		scale(GUI_SCALE);
		fill(0);
		stroke(255);
		
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
				if (client.world.getPlayer().getNation().getCapitalCity() == city){
					citystring = "⌂ " + citystring;
				}
			}else{
				textAlign(LEFT);
				citystring = "← " + city.name;
				if (client.world.getPlayer().getNation().getCapitalCity() == city){
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
				
				MissionHandler.onPlayerSelectEntity( client.world.getPlayer(), hoverEntity );
				if (hoverEntity){
					selectedEntity = hoverEntity; return;
				}else{
					selectedEntity = null;
				}
				
				// Then, it will make sure you are on the main screen, and if so, then you can modify the player's movement with the touch.
				// The screen is partitioned into four quadrants based on the players facing direction.
				
				if (!GROUP_INFOBAR.active){ return; };
				
				var abs_angle = Math.atan2( cursorAbsY - player.y, cursorAbsX - player.x );
				abs_angle = loopyMod(abs_angle - player.dir, PI*2);
				
				// forward
				if ( abs_angle < HALF_PI/2 || abs_angle > (3/2)*PI + (1/4)*PI ){
					if (player.boostForce.magnitude < 10) {
						server.onUpdateRequest( player.boostForce.magnitude + 0.005, "world", "getPlayer", "boostForce", "magnitude" );
					}
				} 
				// left
				if ( abs_angle > PI + (1/4)*PI && abs_angle < (3/2)*PI + (1/4)*PI ){
					server.onUpdateRequest( player.dir - 0.1, "world", "getPlayer", "dir" );
				} 
				// right
				if ( abs_angle > HALF_PI/2 && abs_angle < 3 * HALF_PI/2 ){
					server.onUpdateRequest( player.dir + 0.1, "world", "getPlayer", "dir" );
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