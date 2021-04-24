class Nymgen {
	
	// Este generador de nombres va a seguir la fonotáctica del español aproximadamente, con excepción de los sonidos que resultan en ortografía no familiar para los anglohablantes, por ejemplo, ñ, ll, etc. es de esperar que las cadenas generadas sean pronunciable en español e ingles y otros idiomas también...! -amimifafa
	static newName(){
		
		// empezamos con representacion de sonidos en AFI con ciertas diferencias incluyendo "ʃ" para la africada "ch" y la inclusion del "w" para silabas con "gua", "güe", "güi" etc...
		var vocales   = ["a","a","a","e","i","o","u"];
		var iniciales = ["m","n","p","f","b","t","d","s","ʃ","ʝ","k","x","g","l","r","w"];
		var finales    = ["n","d","s","r","l"];
		
		var cantidaddesilabas = RandomUtil.fromRangeI(2,5);
		var nombreFinal = "";
		
		for (var i = 0; i < cantidaddesilabas; i++){
			var patronSeed = p5.prototype.random();
			if (patronSeed < 0.773 ){ // CV patron
				
				nombreFinal += this.randomFromArr(iniciales);
				nombreFinal += this.randomFromArr(vocales);
				
			}else if (patronSeed < 0.838){ // V patron
				
				nombreFinal += this.randomFromArr(vocales);
				
			}else{ // CVC patron
				
				nombreFinal += this.randomFromArr(iniciales);
				nombreFinal += this.randomFromArr(vocales);
				nombreFinal += this.randomFromArr(finales);
			}
		}
		
		//console.log( "original: " + nombreFinal );
		
		// reemplazando cada AFI caracter con su equivalente en ortografia española 
		for (var i = 0; i < nombreFinal.length; i++){
			
			var car = nombreFinal.substr(i,1);
			var next = nombreFinal.substr(i+1,1);
			switch ( car ){
				
				case "w":
					// "hu", "ho"... este patron es un poco iregular, los sonidos no caben perfectamente...
					if ((next == "o" || next == "u")){
						nombreFinal = this.replacechar(nombreFinal, i, "h");
						
					// "güe", "güi" o "hue", "hui"...
					}else if ((next == "i" || next == "e")){
						nombreFinal = this.replacechar(nombreFinal, i, "hu");
						
					// "gua"
					}else{
						nombreFinal = this.replacechar(nombreFinal, i, "gu");
					}
					break;
				
				case "k":
					// "que","qui"...
					if ((next == "i" || next == "e")){
						nombreFinal = this.replacechar(nombreFinal, i, "qu");
						
					// "ca","cu","co"...
					}else{
						nombreFinal = this.replacechar(nombreFinal, i, "c");
					}						
					break;
				
				case "x":
					// Puede ser "gi" y "ge"...
					if ((next == "i" || next == "e") && p5.prototype.random() > 0.5){
						nombreFinal = this.replacechar(nombreFinal, i, "g");
						
					// y tambien "ji", "je" y el resto "ja","ju","jo" todo representando el mismo sonido
					}else{
						nombreFinal = this.replacechar(nombreFinal, i, "j");
					}						
					break;
				
				case "ʃ":
					nombreFinal = this.replacechar(nombreFinal, i, "ch");
					break;
				
				case "ʝ":
					
					nombreFinal = this.replacechar(nombreFinal, i, "y");	
					break;
					
				default:
					break;
			}
		}
		
		//console.log( "despues: " + nombreFinal );
		
		nombreFinal = this.replacechar(nombreFinal,0, nombreFinal.substr(0,1).toUpperCase());
		
		return nombreFinal;
	}
	
	static replacechar(cadena,index,newchar){
		cadena = cadena.substr(0, index) + newchar + cadena.substr(index + 1);
		return cadena;
	}
	
	static randomFromArr(a){
		var index = RandomUtil.fromRangeI(0, a.length);
		return a[index];
	}
}