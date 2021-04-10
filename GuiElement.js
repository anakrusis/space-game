class GuiElement {
	constructor(x,y,width,height,parent){
		
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
		this.parent = parent;
		this.children = [];
		
		if (parent){
			parent.appendElement( this );
		}else{
			GuiHandler.elements.push(this);
		}
	}
	
	// update() contains most of the auto positioning of text boxes and things, it is an outer layer to the 
	// inner layer function onUpdate() which has more personal properties of individual GUI elements
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
		var h = 22 * lines;
		this.dispheight = Math.max(this.dispheight, h);
		
		for (var i = 0; i < this.children.length; i++){
			var e  = this.children[i];
			e.update();
		}
	}
	
	// This is blank by default so each GUI element can have unique per-tick behaviors
	onUpdate(){
		
	}
	
	// This one also acts as a skeleton function for the real behavior which is onClick()
	click(){
		if (!bypassGameClick){
			for (var i = 0; i < this.children.length; i++){
				var e  = this.children[i];
				e.click();
			} 
			if (mouseX > this.dispx && mouseX < this.dispx + this.dispwidth
			 && mouseY > this.dispy && mouseY < this.dispy + this.dispheight){
			
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