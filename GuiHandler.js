var mainelement = document.getElementById("main");

class GuiHandler {
	
	static activeGroup = null;
	static groups      = [];
	
	static update(){
		
		for (var i = 0; i < this.groups.length; i++){
			this.groups[i].update();
		}
	}
	
}

// A group of GUI elements put together such as a menu, or a sidebar, or loquesea
// It's like a wrapper for the quicksettings panel but with some special behavior regarding p5js
class GuiGroup {
	
	constructor(x, y, title){
		
		this.panel = QuickSettings.create(x, y, title, mainelement);
		this.elements = {};
		this.visible = true;
		
		GuiHandler.groups.push(this);
	}
	
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
		
		this.panel.addButton(key,callback);
	}
	
	update(){
			
	}
	
	hide(){
		this.panel.hide();
		this.visible = false;
	}
	
	show(){
		this.panel.show();
		this.visible = true;
	}
}


// MISSIONS: Menu with the missions available

var GROUP_MISSIONS = new GuiGroup(0,0,"Missions"); GROUP_MISSIONS.hide();
GROUP_MISSIONS.update = function(){
	
	this.panel.setPosition(width/2, height/2);
}

// INFOBAR: Left hand bar with the information on various things

var GROUP_INFOBAR = new GuiGroup(0,0,"Space Game 0.0.1 2021-04-03"); GROUP_INFOBAR.addHTML("entityinfo");
GROUP_INFOBAR.update = function(){
	
	this.panel.setWidth(width/4);
	
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
	//console.log("butt");
	//GROUP_INFOBAR.hide();
	//return false;
}
GROUP_INFOBAR.addButton("Missions...", c);

GuiHandler.activeGroup = GROUP_INFOBAR;