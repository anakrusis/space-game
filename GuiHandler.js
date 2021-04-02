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
class GuiGroup {
	
	constructor(x, y, title){
		
		this.panel = QuickSettings.create(x, y, title, mainelement);
		this.elements = {};
		
		GuiHandler.groups.push(this);
	}
	
	addHTML(key){
		
		this.panel.addHTML(key, ""); 
		this.panel.hideTitle(key);
		
	}
	
	update(){
			
	}
	
}

var GROUP_INFOBAR = new GuiGroup(0,0,"Space Game 0.0.1 2021-04-02"); GROUP_INFOBAR.addHTML("planet");
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
		
		this.panel.setValue("planet", infostring);	
		this.panel.showControl("planet");
	}else{
		this.panel.hideControl("planet");
	}
}