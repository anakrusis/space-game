var mainelement = document.getElementById("main");

class GuiHandler {
	
	static activeGroup = null;
	static groups      = [];
	
	static elements    = []; // parent elements here, child elements contained within..
	
	static update(){
		
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			if (e.active){
				e.update();
			}
		}
	}
	
	static render(){
		for (var i = 0; i < this.elements.length; i++){
			var e = this.elements[i];
			e.render();
		}
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
			
			// This part here decides whether the text is facing up or down and adjusts the angle accordingly
			if (angle > Math.PI / 2 && angle < (3 * Math.PI)/2){
				angle -= Math.PI ;
				angle = loopyMod( angle, Math.PI*2 );
				textAlign(RIGHT);
				citystring = city.name + "🠖 ";
			}else{
				textAlign(LEFT);
				citystring = "🠔 " + city.name;
			}
			
			rotate(angle);
			
			textSize(24);
			text(citystring, 0, 0);
			
			pop();
			textAlign(LEFT);
		}
	}
}

class GuiElement {
	constructor(x,y,width,height){
		
		// core properties
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.padding = 5;
		
		this.dispx = this.x + this.padding;
		this.dispy = this.y + this.padding;
		this.dispwidth = 100;
		this.dispheight = 100;
		
		this.active = true;
		this.visible = true;
		
		this.autopos = "top"; // float property
		this.autosize = false; // will fill up to the size of its children elements
		
		this.text = "";
		
		// referential properties
		this.parent = null;
		this.children = [];
		
		GuiHandler.elements.push(this);
	}
	
	update(){
		
		if (this.onUpdate){
			this.onUpdate();
		}
		
/* 		var xsum = this.dispx + this.padding;
		var ysum = this.dispy + this.padding;
		
		if (this.autopos != "pee"){
			
			for (var i = 0; i < this.children.length; i++){
				
				var c = this.children[i];
				
				c.dispx = this.dispx + this.padding;
				c.dispy = this.dispy + this.padding;
				
				xsum += c.dispwidth + this.padding;
				
			}
			
		} */
		
		var p = this.parent;
		if (p){
		
			// Float left, each element after is right of the one before it
			if (p.autopos == "left"){
				
				this.dispx = p.dispx + p.padding;
				this.dispy = p.dispy + p.padding;
				
				for (var i = 0; i < p.children.length; i++){
					
					if (p.children[i].visible){
						if (p.children[i] == this){
							break;
						}else{
							this.dispx += p.children[i].dispwidth + p.padding;
						}
					}
				}
			} 
			if (p.autopos == "top"){
				
				this.dispx = p.dispx + p.padding;
				this.dispy = p.dispy + p.padding;
				
				for (var i = 0; i < p.children.length; i++){
					
					if (p.children[i].visible){
						if (p.children[i] == this){
							break;
						}else{
							this.dispy += p.children[i].dispheight + p.padding;
						}
					}
				}
			} 
		}else {
			this.dispx = this.x + this.padding; this.dispy = this.y + this.padding;
		}
		
		// This fills up an element based on the size of the children elements inside it:
		// it gets the extremes for X and Y and then pads them out afterwards
		if (this.autosize){
			var minx = 100000; var miny = 100000;
			var maxx = 0; var maxy = 0;
			for (var i = 0; i < this.children.length; i++){
				
				var c = this.children[i];
				if (c.visible){
					if (c.dispx + c.dispwidth > maxx){
						maxx = c.dispx + c.dispwidth;
					}
					if (c.dispx < minx){
						minx = c.dispx;
					}
					if (c.dispy + c.dispheight > maxy){
						maxy = c.dispy + c.dispheight;
					}
					if (c.dispy < miny){
						miny = c.dispy;
					}
				}
			}
			// This padding is compensating for the two lines immediately after
			this.width = maxx - minx + (this.padding*4);
			this.height = maxy - miny + (this.padding*4);
			
			//
		}
		
		this.dispwidth = this.width - (this.padding*2);
		this.dispheight = this.height - (this.padding*2);
		
		var lines = (this.text.match(/\n/g) || '').length + 1
		var h = 20 * lines;
		this.dispheight = Math.max(this.dispheight, h);
	}
	
	appendElement(e){
		e.parent = this;
		this.children.push(e);
	}
	
	// This is recursive, and it goes from a top parent element through all the children of the tree
	render(){
		if (!this.visible) { return; }
		
		fill(0);
		stroke(255);
			
		rect( this.dispx, this.dispy, this.dispwidth, this.dispheight );
		
		fill(255);
		if (this.text != ""){
			text( this.text, this.dispx + this.padding, this.dispy + this.padding, this.dispwidth - (this.padding*2));
		}
		
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.render();
		}
	}
	
	// Likewise for the following methods
	show(){
		this.visible = true;
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.show();
		}
	}
	
	hide(){
		this.visible = false;
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.hide();
		}
	}
}

// A group of GUI elements put together such as a menu, or a sidebar, or loquesea
// Used to be a wrapper for the quicksettings panel but with some special behavior regarding p5js
// now its gonna be its own thing
class GuiGroup {
	
	constructor(x, y, title){
		
		this.panel = QuickSettings.create(x, y, title, mainelement);
		this.elements = [];
		this.visible = true; // rendered to screen
		this.active = true; // can be interacted with
		
		GuiHandler.groups.push(this);
	}
	
	addElement(e){
		this.elements.push(e);
	}
	
	render(){}
	
	addHTML(key){
		this.panel.addHTML(key, ""); 
		this.panel.hideTitle(key);
	}
	addButton(key,c){
		
		// Buttons are made to only work on the active group
		var callback = function() {
			
			if (GuiHandler.activeGroup == this){
				c();
			}
			BYPASS_P5_CLICK = true;
		}
		var newc = callback.bind(this);
		
		this.panel.addButton(key,newc);
	}
	
	update(){
		for (var i = 0; i < this.elements.length; i++){
			var e  = this.elements[i];
			e.update();
		}
	}
	
	hide(){
		this.panel.hide();
		this.visible = false;
	}
	
	show(){
		this.panel.show();
		this.visible = true;
	}
	
	clearAllElements(){
		this.elements = [];
		
		for (key in this.panel._controls){
			var control = this.panel._controls[key];
			if (control){
				this.panel.removeControl(key);
			}
		}
	}
}

// HOTBAR: Shows the cargo hold of items (nine in total for now)

var GROUP_HOTBAR = new GuiElement(0,0,500,500);
GROUP_HOTBAR.autosize = true; GROUP_HOTBAR.autopos = "left";

GROUP_HOTBAR.onUpdate = function(){
	var mid = width/2;
	this.y = height - this.height;
	this.x = mid + (-0.5) * this.width;
}

for (var i = 0; i < 9; i++){
	
	var he = new GuiElement( 0, 0, 64, 64 ); he.index = i;
	GROUP_HOTBAR.appendElement( he )
}

// MISSION INFO: Screen giving info on the particular mission selected

/* var GROUP_MISSION_INFO = new GuiGroup(0,0,"Mission Info"); GROUP_MISSION_INFO.hide(); GROUP_MISSION_INFO.panel.setWidth(500);

GROUP_MISSION_INFO.show = function(){
		
	this.panel.show();
	this.visible = true;
	this.panel.setPosition(width/2, height/2);	
	this.clearAllElements();
	
	var infostring = mission.getSourceCity().name + " to " + mission.getDestinationCity().name + "<br><br>";
	infostring += "$" + mission.reward;
	this.addHTML("text"); this.panel.setValue("text", infostring);	
	
	this.addButton("Accept", function(){
			
		//selectedMission = mission;
		GROUP_MISSION_INFO.hide(); GuiHandler.activeGroup = GROUP_INFOBAR;
		server.world.getPlayer().currentMission = selectedMission;
			
	});
	this.addButton("Back", function(){
			
		//selectedMission = mission;
		//GROUP_MISSIONS.hide(); GROUP_MISSION_INFO.show();
		GROUP_MISSIONS.show(); GROUP_MISSION_INFO.hide(); GuiHandler.activeGroup = GROUP_MISSIONS;
	});
} */

// MISSIONS: Menu with the list of missions available

/* var GROUP_MISSIONS = new GuiGroup(0,0,"Missions"); GROUP_MISSIONS.hide(); GROUP_MISSIONS.panel.setWidth(500);
GROUP_MISSIONS.update = function(){
	//this.panel.setPosition(width/2 - , height/2);
}
GROUP_MISSIONS.show = function(){
	this.panel.show();
	this.visible = true;
	
	if (!(selectedEntity instanceof BuildingSpaceport)){ return; }
	
	this.clearAllElements();
	this.panel.setPosition(width/2, height/2);
	
	var selectedCity = selectedEntity.getCity();
	var missions = selectedCity.getAvailableMissions();
	
	for (mission of missions){
		
		var missionname = mission.getSourceCity().name + " to " + mission.getDestinationCity().name + "...";
		
		this.addButton(missionname, function(){
			
			selectedMission = mission;
			GROUP_MISSIONS.hide(); GROUP_MISSION_INFO.show(); GuiHandler.activeGroup = GROUP_MISSION_INFO;
			
		});
	}		
	this.addButton("Back", function(){ GROUP_MISSIONS.hide(); GuiHandler.activeGroup = GROUP_INFOBAR; });
} */

// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiElement(0,0,0,0); GROUP_INFOBAR.autosize = true;
var tittle = new GuiElement(0,0,300,40); tittle.text = "Space Game 0.0.1 2021-04-10"
GROUP_INFOBAR.appendElement(tittle);

var planetinfo = new GuiElement(0,0,300,40);

planetinfo.onUpdate = function(){
	var e = null;
	if (selectedEntity){
		e = selectedEntity;
	}else if (hoverEntity){
		e = hoverEntity;
	}
	
	if (e){
		var infostring = "" + e.name + "\n";
		if (e instanceof BodyPlanet){
			var starname = e.getStar().name; infostring += "Planet of the " + starname + " system\n\n";
			
			var daylen = 2 * Math.PI / e.rotSpeed / 60 / 60;
			infostring += "• Day length: " + Math.round(daylen) + " Earth min.\n"
			var yearlen = e.orbitPeriod / 60 / 60;
			infostring += "• Year length: " + Math.round(yearlen) + " Earth min\n"
		}
		
		this.text = infostring;	
		this.show();
	}else{
		this.hide();
	}
}

GROUP_INFOBAR.appendElement(planetinfo);
/* var GROUP_INFOBAR = new GuiGroup(0,0,"Space Game 0.0.1 2021-04-08"); 
GROUP_INFOBAR.addHTML("missioninfo"); GROUP_INFOBAR.addHTML("entityinfo");
GROUP_INFOBAR.update = function(){
	
	this.panel.setWidth(width/4);
	
	var mission = server.world.getPlayer().currentMission;
	if (mission){
		var infostring = "<b>" + mission.getSourceCity().name + " to " + mission.getDestinationCity().name;
		var missiontime_min = ~~(mission.timeRemaining / 60) ;
		var missiontime_sec = ~~(mission.timeRemaining % 60 );
		
		var outtime = ""
		outtime += "" + missiontime_min + ":" + (missiontime_sec < 10 ? "0" : "");
		outtime += "" + missiontime_sec;
		
		infostring += " (" + outtime + ")" + "</b><br>";
		
		infostring += mission.desc;
		
		this.panel.setValue("missioninfo", infostring);
		this.panel.showControl("missioninfo");
	}else{
		this.panel.hideControl("missioninfo");
	}
	
	var e = null;
	if (selectedEntity){
		e = selectedEntity;
	}else if (hoverEntity){
		e = hoverEntity;
	}
	
	if (e){
		var infostring = "<b>" + e.name + "</b><br>";
		if (e instanceof BodyPlanet){
			var starname = e.getStar().name; infostring += "Planet of the " + starname + " system<br><br>";
			
			var daylen = 2 * Math.PI / e.rotSpeed / 60 / 60;
			infostring += "• Day length: " + Math.round(daylen) + " Earth minutes<br>"
			var yearlen = e.orbitPeriod / 60 / 60;
			infostring += "• Year length: " + Math.round(yearlen) + " Earth minutes<br>"
		}
		
		this.panel.setValue("entityinfo", infostring);	
		this.panel.showControl("entityinfo");
	}else{
		this.panel.hideControl("entityinfo");
	}
	
	if (selectedEntity instanceof BuildingSpaceport){
		this.panel.showControl("Missions...");
	}else{
		this.panel.hideControl("Missions...");
	}
}
var c = function(){
	
	GROUP_MISSIONS.show(); GuiHandler.activeGroup = GROUP_MISSIONS;

	//GROUP_INFOBAR.hide();
	//return false;
}
GROUP_INFOBAR.addButton("Missions...", c);

GuiHandler.activeGroup = GROUP_INFOBAR; */