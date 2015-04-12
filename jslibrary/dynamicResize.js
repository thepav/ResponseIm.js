function dynamicResize(canvas, context, backCanvas, backContext, image, type, pixelArray) {
	var self = {};
	self.canvas = canvas;
	self.image = image;
	self.height = $(canvas).height();
	self.context = context;
    self.backCanvas = backCanvas;
    self.backContext = backContext;
	self.type = type;
    self.cachePictures = {};
    self.orgImgWidth = image.width;
    alert(self.orgImgWidth);
    self.initialCanvasWidth = $(canvas).width();
    self.initialWindowWidth = $(window).width();



    self.getPixelData = function(data, w, h) {
        self.backContext.createImageData(w, h);
        self.backContext.drawImage(data, 0, 0);
        return backContext.getImageData(0, 0, w, h);
    }

	self.pixelData = self.getPixelData(self.image, 1920, self.height);

    self.downsampleHorizontalAndPopulateArray = function(srcImageData, width, height, pixelArray) {
        console.log("downsampleHorizontalAndPopulateArray");
        var backContext = self.backContext;
        var d = 0;
        self.cachePictures[0] = srcImageData;
        for (var i=1; i < pixelArray.length; i++) {
            
            var result = backContext.createImageData(width-i, height);
            var pixelsToExclude = pixelArray[i-1];
            var d = 0;
            var numSkipped = 0;
            for (var row = 0; row < height; row += 1) {
                for (var col = 0; col < width-i+1; col += 1) {
                    if (col == pixelsToExclude[row]) {
                        numSkipped = numSkipped + 1;
                    } else {
                        for (var c = 0; c < 4; c += 1) {
                            result.data[d] = self.cachePictures[i-1].data[(row*(width-i+1)+col)*4+c];
                            d = d + 1;
                        }
                    }
                }
            }
            if (numSkipped != 736) {
                console.log("numSkipped " + numSkipped);   
            }
            console.log(width-i);
            //if (i%10 == 0) {
                self.cachePictures[i] = result;
            //}
        }
        
        return result;
    }

    self.resizeHorizontallyAndPopulateArray = function(pixelArray) {

        self.pixelData = self.downsampleHorizontalAndPopulateArray(self.pixelData, self.orgImgWidth, self.height, pixelArray);
     //    context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        // self.canvas.width = self.width;
        // context.putImageData(self.pixelData, 0, 0);
        return self.pixelData
    }

    self.setWidth = function(width) {
        context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        console.log('index: '+ width);
        context.putImageData(self.cachePictures[width], 0,0,0,0,self.canvas.width,self.canvas.height);
        $(self.canvas).css('width',self.orgImgWidth);
        //$("#img-no-inseam").css('width', self.cachePictures[width].width + "px;");
    }

	if (type == 'vertical') {

	} else if (type == 'horizontal') {
		//var worker = new Worker('polarBearHorizontalWorker.js');
		self.resizeHorizontallyAndPopulateArray(pixelArray);
        //self.setWidth(0);
        console.log('INITIAL SET! '+(self.orgImgWidth-self.initialCanvasWidth));
        self.setWidth(self.orgImgWidth-self.initialCanvasWidth);
		$( window ).resize(function() {
            self.setWidth(self.orgImgWidth- $(window).width());
            console.log("HI");
		});
	}
    return self;
    
}