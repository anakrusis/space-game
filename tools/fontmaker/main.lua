FONT_SIZE = 24

function love.load()
	font = love.graphics.setNewFont( "COURIER.TTF", FONT_SIZE );
	love.graphics.setDefaultFilter( "nearest", "nearest", 0 )
end

function love.keypressed(key, scancode, isrepeat)

	if key == "r" then
		renderdata = love.image.newImageData( 16 * FONT_SIZE, 16 * FONT_SIZE );
		canvas = love.graphics.newCanvas( renderdata:getWidth(), renderdata:getHeight() );
		love.graphics.setCanvas(canvas)
		
		for j = 0, 7 do
			for i = 0, 15 do
				
				ch = ( 16 * j ) + i; print(ch);
				love.graphics.print(string.char(ch), i * FONT_SIZE, j * FONT_SIZE);
		
			end
		end
		
		love.graphics.setCanvas()
		canvas_data = canvas:newImageData()
		renderdata:paste(canvas_data, 0, 0)
		
		renderimg = love.graphics.newImage(renderdata)
		
		-- Writing new edited frame
		
		filenameout = "font.png"
		
		dataOut = renderdata:encode("png")
		str_out = dataOut:getString()
		
		outfile = io.open (filenameout, "wb")
		outfile:write(str_out)
		outfile:close()
	
	end
end

function love.draw()
	
	if renderimg then
	
		love.graphics.draw(renderimg);
	
	end
end