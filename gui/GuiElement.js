class GuiElement {
	constructor(x,y,width,height,parent){
		
		// core properties
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.padding = 5;
		this.borderweight = 1;
		
		this.dispx = this.x + this.padding;
		this.dispy = this.y + this.padding;
		this.dispwidth = 100;
		this.dispheight = 100;
		
		this.active = true;
		this.bypassActiveForClicks = false; // a few elements bypass the parents activity for click elements, such as the zoom buttons
		this.visible = true;
		this.transparent = false;
		this.ticksShown = 0;
		this.holdclick = false; // If true, it will trigger the click event every tick that it is held, instead of just once at the beginning
		
		this.autopos = "top"; // float property
		this.autosize = false; // will fill up to the size of its children elements
		
		this.staticposition = false; // will not affect the size of autosize parent
		
		this.autocenterX = false; // will center to middle of screen (best for popup windows, or also some HUD stuff)
		this.autocenterY = false;
		
		this.text = "";
		this.disptext = "";
		
		// referential properties
		this.parent = parent;
		this.children = [];
		
		if (parent){
			parent.appendElement( this );
		}else{
			GuiHandler.elements.push(this);
		}
		GuiHandler.allElements.push(this);
	}
	
	// update() contains most of the auto positioning of text boxes and things, it is an outer layer to the 
	// inner layer function onUpdate() which has more personal properties of individual GUI elements
	update(){
		
		if (this.onUpdate){
			this.onUpdate();
		}
		
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.update();
		}
		
		if (!this.staticposition){
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
				
				if (this.autocenterX){
					this.x = width/GUI_SCALE/2 - this.width/2;
				}
				if (this.autocenterY){
					this.y = height/GUI_SCALE/2 - this.height/2;
				}
				
				this.dispx = this.x + this.padding; this.dispy = this.y + this.padding;
			}
		}
		
		// This fills up an element based on the size of the children elements inside it:
		// it gets the extremes for X and Y and then pads them out afterwards
		if (this.autosize){
			var minx = 100000; var miny = 100000;
			var maxx = 0; var maxy = 0;
			for (var i = 0; i < this.children.length; i++){
				
				var c = this.children[i];
				if (c.visible && !c.staticposition){
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
		
		//this.disptext = this.text;
		
		// Homemade word-wrap lol... The reasoning behind this is because the built-in one is a little feisty, it doesn't technically add any new lines
/* 		var linecount = 0;
		for (var i = 0; i < this.text.length; i++){
			
			if (this.text.slice(i, i+2) == "\n"){
				linecount = 0;
			}
			
			if ((linecount+1) >= 30 && this.text.slice(i, i+1) == " "){
				
				this.disptext = this.text.slice(0,i) + "\n" + this.text.slice(i+1);
				linecount = 0;
				//var txt2 = txt1.slice(0, 3) + "\n" + txt1.slice(3);
			}
			linecount++;
		} */
		
/* 		this.lines1 = (this.text.match(/\n/g) || '').length
		
		var length_without_newlines = this.text.length;
		for (var i = 0; i < this.text.length; i++){
			if (this.text.slice(i, i+2) == "\n"){
				length_without_newlines -= 2;
			}
		}
		
		this.lwn = length_without_newlines;
		
		this.lines2 = Math.floor(length_without_newlines / 30) + 1 */
		if (!FANCY_TEXT){
			var lines = 0;
			var linepos = 0;
			for (var i = 0; i < this.text.length; i++){
				
				//console.log(this.text.slice(i,i+2));
				if (this.text.slice(i, i+1) == "\n"){
					lines++;
					linepos = 0;
				}
				
				if ((linepos+1) % (this.dispwidth/10) == 0){
					
					lines++;
					linepos = 0;
					//var txt2 = txt1.slice(0, 3) + "\n" + txt1.slice(3);
				}
				linepos++;
			}
			this.lines = lines;
		}
		
		if (FANCY_TEXT){
			var h = (16 * this.lines) + this.padding*6;
		}else{
			var h = 22 * this.lines + this.padding*5;
		}
		this.dispheight = Math.max(this.dispheight, h);
		
		if (this.visible){
			this.ticksShown++;
		}else{
			this.ticksShown = 0;
		}
	}
	
	// This is blank by default so each GUI element can have unique per-tick behaviors
	onUpdate(){
		
	}
	
	// This one also acts as a skeleton function for the real behavior which is onClick()
	click(x,y){
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.click(x,y);
		} 
		
		if (bypassGameClick){ return false; }
		
		if (this.visible && (this.active || this.bypassActiveForClicks)){
			if (x > this.dispx*GUI_SCALE && x < (this.dispx + this.dispwidth) * GUI_SCALE
			 && y > this.dispy*GUI_SCALE && y < (this.dispy + this.dispheight)* GUI_SCALE ){
			
				this.onClick(); 
				bypassGameClick = true;
			}
		}
	}
	
	// This one is empty and left to be defined individually
	onClick(){
		
	}
	
	appendElement(e){
		e.parent = this;
		this.children.push(e);
	}
	
	// This is recursive, and it goes from a top parent element through all the children of the tree
	render(){
		if (!this.visible || this.ticksShown < 3) { return; }
		
		if (!this.transparent){ fill(0); } else { noFill(); blendMode(DIFFERENCE); }
		stroke(255);
		strokeWeight(this.borderweight);
			
		rect( this.dispx, this.dispy, this.dispwidth, this.dispheight );
		
		if (this.transparent){ blendMode(BLEND); }
		noStroke();
		strokeWeight(1);
		fill(255);
		
		if (this.text != ""){
			//this.text = this.text.toUpperCase();
			//textWrap(LINE)
			//
			//if (!FANCY_TEXT){
			//text( this.text, this.dispx + this.padding, this.dispy + this.padding, this.dispwidth - (this.padding*2));
			
			this.disptext = this.text;
			
			//stroke(255,0,0); noFill();
			//}else{
			this.lines = 0;
			var dx = this.dispx + this.padding; var dy = this.dispy + this.padding;
			
			var SOURCE_SIZE = 8;
			var DEST_WIDTH = 9.60; var DEST_HEIGHT = 20;
			var i = 0; var column = 0; this.maxcolumns = Math.floor ( this.dispwidth / DEST_WIDTH ) - 1;
			
			// This big loop serves several purposes-- it is a homemade word wrap with more control than the default p5.js word wrap
			// it also can render rectangles underneath the text, which can be used for text background color
			// (or with text rendered using the multiply blendmode, it can be used to do colored text as well!)
			while ( i < this.text.length ){

				var c = this.text.charCodeAt(i);
				
				if ( c != 32 ){
					
					//rect(dx,dy,DEST_WIDTH,DEST_HEIGHT)
				}
				
				dx += ( DEST_WIDTH * 1 ); column++;
				
				if (c == 32){
					var f = this.text.substring(i+1); var tospace = f.split(" "); var tonl = f.split("\n");
					
					var f2 = ( tospace[0].length < tonl[0].length ) ? tospace : tonl;
					
					if ( column + (f2[0].length) > this.maxcolumns ){ 
						dy += ( DEST_HEIGHT ); dx = this.dispx + this.padding;
						column = 0; this.lines++;
						
						this.disptext = [this.disptext.slice(0, i), "\n", f].join('')
					}
				}else if (this.text.substring(i,i+1) == "\n"){
					dy += ( DEST_HEIGHT ); dx = this.dispx + this.padding;
					column = 0; this.lines++;
				}
				i++;
			}
			fill(255); noStroke();
			text( this.disptext, this.dispx + this.padding, this.dispy + this.padding + 13 )
			
		}else{
			this.lines = 0;
		}
		if (this.onRender){
			this.onRender();
		}
		
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.render();
		}

	}
	
	// Same deal, this is empty so each element can have custom rendering stuff
	onRender(){
		
	}
	
	// Likewise for the following methods
	show(){
		this.visible = true;
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.show();
		}
		//this.onUpdate();
		this.onShow();
	}
	
	onShow(){
		
	}
	
	hide(){
		this.visible = false;
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.hide();
		}
	}
}

class GuiTextEntry extends GuiElement { 

	constructor(x,y,width,height,parent,patharray){
		
		super(x,y,width,40,parent);
		this.patharray = patharray;
		this.cursorpos = 0;
		this.setting = "";
	}
	
	onClick(){
		
		if (!selectedTextEntry){
			selectedTextEntry = this;
			this.setting = this.text;
			//this.cursorpos = this.text.length - 1;
		}
	}
	
	commit(){
		// Todo maybe make sure it's not All Spaces
		if (this.setting != "" && this.setting != " "){
			
			path_to_data = window;
			parent   = window;
			
			for (var i = 0; i < this.patharray.length - 1; i++){
				var key = this.patharray[i];
				
				if (typeof path_to_data === "function"){
					newfunc = path_to_data.bind( parent );
					path_to_data = newfunc()[key];
				}else{
					parent       = path_to_data;
					path_to_data = path_to_data[key];
				}
				
			}
			if (path_to_data){
				// final item is the one which is being read
				if (typeof path_to_data === "function"){
					newfunc = path_to_data.bind( parent );
					newfunc()[ this.patharray[ this.patharray.length - 1] ] = this.setting;
				}else{
					path_to_data[ this.patharray [ this.patharray.length - 1] ] = this.setting;
				}
			}
		}
		selectedTextEntry = null;
	}
	
	onRender(){
		
		if (selectedTextEntry){

			this.text = this.setting;
			
			if (framecount % 32 >= 16){
				var cursorx = this.dispx + this.padding + ((this.setting.length % 28) * 6.45 * 1.5);
				var cursory = this.dispy + this.padding + 11*1.5 + (10*1.5*(this.lines - 1));
				fill(255);
				rect( cursorx, cursory, 6 * 1.5, 8 * 1.5);
			}
		
		}else{
			
			path_to_data = window;
			parent   = window;
			
			for (var i = 0; i < this.patharray.length - 1; i++){
				var key = this.patharray[i];
				
				if (typeof path_to_data === "function"){
					newfunc = path_to_data.bind( parent );
					path_to_data = newfunc()[key];
				}else{
					parent       = path_to_data;
					path_to_data = path_to_data[key];
				}
				
			}
			if (path_to_data){
				// final item is the one which is being read
				if (typeof path_to_data === "function"){
					newfunc = path_to_data.bind( parent );
					this.text = newfunc()[ this.patharray[ this.patharray.length - 1] ];
				}else{
					this.text = path_to_data[ this.patharray [ this.patharray.length - 1] ];
				}
			}
		}
	}

}

class GuiScrollContainer extends GuiElement {
	constructor(x,y,width,height,parent,minelements){
		super(x,y,width,height,parent);
		this.autosize = true; this.autopos = "top"; this.minelements = minelements;
		this.scrollindex = 0;
		this.upbutton   = new GuiElement( 0, 0, 25, 10, this ); this.upbutton.staticposition = true;
		this.downbutton = new GuiElement( 0, 0, 25, 10, this ); this.downbutton.staticposition = true;
		//this.upbutton.text = "/\\"; this.downbutton.text = "V";
		//this.upbutton.hide();
		this.upbutton.onClick = function(){
			this.parent.scrollindex--; //this.parent.ticksShown = 0;
		}
		this.downbutton.onClick = function(){
			this.parent.scrollindex++; //this.parent.ticksShown = 0;
		}
		
		this.upbutton.onRender = function(){
			
			var tpad = 5; var spad = 2; // top pad and side pad of triangle
			triangle(this.dispx + this.dispwidth/2, this.dispy + tpad, this.dispx + spad, this.dispy + this.dispheight - tpad, this.dispx + this.dispwidth - spad, this.dispy + this.dispheight - tpad);
		}
		this.downbutton.onRender = function(){
			
			var tpad = 5; var spad = 2; // top pad and side pad of triangle
			triangle(this.dispx + this.dispwidth/2, this.dispy + this.dispheight - tpad, this.dispx + spad, this.dispy + tpad, this.dispx + this.dispwidth - spad, this.dispy + tpad);
		}
	}
	
	onShow(){
		this.onUpdate();
	}
	
	onUpdate(){
		
		// Upper and lower bounds for allowed scroll amounts
		this.scrollindex = Math.max(this.scrollindex, 0);
		var max = Math.max(this.children.length - 2 - this.minelements, 0);
		this.scrollindex = Math.min(this.scrollindex, max );
		
/* 		this.upbutton.show(); this.downbutton.show();
		if (this.scrollindex >= max ){
			this.downbutton.hide();
		}
		if (this.scrollindex <= 0){
			this.upbutton.hide();
		} */
		
		// Iterates through every element and sees if it falls within the window or not
		var showing = 0;
		for ( i = 0; i < this.children.length; i++ ){
			var c = this.children[i];
			if (c == this.upbutton || c == this.downbutton){ continue; }
			
			c.hide();
			if (i >= this.scrollindex && i < this.scrollindex + this.minelements){
				c.show(); showing++;
			}
		}

		// Re-adds the up and down buttons if they are ever removed (like in a children clear in the onShow() event)
		var ub = this.children.indexOf(this.upbutton);
		if (ub == -1 && this.children.length > this.minelements){
			this.children.push(this.upbutton);
			this.children.push(this.downbutton);
		}
		
		// And manually positions them
		this.upbutton.dispheight = 10; this.downbutton.dispheight = 10;
		this.upbutton.dispx   = this.dispx + this.dispwidth + (this.upbutton.dispwidth / 2) - this.padding ;
		this.downbutton.dispx = this.dispx + this.dispwidth + (this.downbutton.dispwidth / 2) - this.padding;
		
		this.upbutton.dispy   = this.dispy;
		this.downbutton.dispy = this.dispy + this.dispheight;// - this.downbutton.dispheight;
	}
	
	onRender(){
		var boundtop = this.dispy + this.upbutton.dispheight;
		var boundbtm = this.downbutton.dispy;
		var scrollmax = Math.max(this.children.length - 2 - this.minelements, 0);
		var barheight = ( boundbtm - boundtop ) * (this.minelements / (this.children.length - 2));
		//console.log(barheight);
		
		//var bartop = ( boundbtm - boundtop ) * this.scrollindex / ( this.scrollmax );
		//var coeff = (this.scrollindex - 0) / ( this.scrollmax - 0 );
		var ratio = this.scrollindex / scrollmax;
		var upped = ( ratio * ( boundbtm - barheight - boundtop ) ) + boundtop
		//console.log(upped);
		
		//rect( (coeff * (this.dispwidth - this.dispheight + 30 )) + this.dispx, this.dispy + 30, this.dispheight - 30, this.dispheight - 30 );
		if (this.children.length > this.minelements){
			fill(0); stroke(255);
			rect( this.upbutton.dispx, this.upbutton.dispy, this.upbutton.dispwidth, this.downbutton.dispy- this.upbutton.dispy );
			fill(255);
			rect( this.upbutton.dispx, upped, this.upbutton.dispwidth, barheight );
		}
	}
}

class GuiCheckbox extends GuiElement {
	constructor(width,parent,patharray){
		super(0,0,width,50,parent);
		this.patharray = patharray;
		this.setting = window[ this.patharray[0] ];
		this.originalsetting = this.setting;
	}
	
	onClick(){
		this.setting = !this.setting;
		options_buffer[ this.patharray ] = this.setting;
	}
	onShow(){
		this.setting = window[ this.patharray[0] ];
	}
	onRender(){
		fill(0);
		stroke(255);
		var topleftX = this.dispx + this.dispwidth - this.dispheight;
		var topleftY = this.dispy + this.padding;
		var w = this.dispheight - this.padding;
		var h = this.dispheight - 2 * this.padding;
		rect( topleftX, topleftY, w, h);
		
		if (this.setting){
			line(topleftX, topleftY, topleftX + w, topleftY + h);
		}
	}
}

class GuiSlider extends GuiElement {
	
	constructor(x,y,width,height,parent,patharray, min, max){
		super(x,y,width,60,parent);
		
		this.min = min; this.max = max;
		
		this.patharray = patharray;
		this.setting = window[ this.patharray[0] ];
		this.originalsetting = this.setting;
	}
	
	updateValFromMousePos(){
		// first scales the mouse position to a range between 0 and 1 (I guess for easier understandability)...
		
		var coeff = ((mouseX / GUI_SCALE) - this.dispx) / ( (this.dispx + this.dispwidth) - this.dispx); //coeff /= GUI_SCALE;
		
		// then rescales to the min and max values of the slider...
		
		var realval = this.min + (coeff * (this.max - this.min))
		
		//console.log(coeff + " -> " + realval);
		
		this.setting = realval;
	
		options_buffer[ this.patharray ] = this.setting;
	}
	
	onClick(){
		this.updateValFromMousePos();
		
	}
	
	onShow(){
		this.setting = window[ this.patharray[0] ];
	}
	
	onRender(){
		fill(0);
		stroke(255);
		rect( this.dispx, this.dispy + 30, this.dispwidth, this.dispheight - 30 );
		
		var coeff = (this.setting - this.min) / ( this.max - this.min );
		fill(255);
		rect( (coeff * (this.dispwidth - this.dispheight + 30 )) + this.dispx, this.dispy + 30, this.dispheight - 30, this.dispheight - 30 );
		
	}
}

class GuiMissionDisplay extends GuiElement {
	
	constructor(x,y,width,height,parent,mission){
		super(x,y,300,height,parent);
		this.mission = mission;
		if (this.mission){
			this.text = mission.displaytext;
		}
	}
	
	setMission(mission){
		this.mission = mission;
		this.text = mission.displaytext;
	}
	
	onRender(){
		var scale = 18;
		var pts = this.mission.getIcon();
		noFill()
		stroke(this.mission.iconColor[0], this.mission.iconColor[1], this.mission.iconColor[2]);
		beginShape();
		for (i = 0; i < pts.length; i += 2){
			var px = (pts[i+1]) * scale + this.dispx - this.padding*8 + this.width; 
			var py = (-pts[i])  * scale + this.dispy - this.padding*2 + this.height + 4;
			vertex(px,py);
		}
		endShape(CLOSE);
	}
}