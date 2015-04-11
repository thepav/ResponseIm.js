function dynamicResize(canvas, context, backCanvas, backContext, image, type, pixelArray) {
	var self = {};
	self.canvas = canvas;
	self.image = image;
	self.width = $(canvas).width();
	self.height = $(canvas).height();
	self.context = context;
    self.backCanvas = backCanvas;
    self.backContext = backContext;
	self.currentWidth = self.canvas.width;
	self.type = type;
    self.cachePictures = {};

    self.initialCanvasWidth = $(canvas).width();


    self.getPixelData = function(data, w, h) {
        self.backContext.createImageData(w, h);
        self.backContext.drawImage(data, 0, 0);
        return backContext.getImageData(0, 0, w, h);
    }

	self.pixelData = self.getPixelData(img, self.width, self.height);

	self.downsample = function(srcImageData, width, height) {
        var backContext = document.createElement('canvas').getContext('2d');
        var skip = 2;
        var result = backContext.createImageData(width/2, height/2);
        var d = 0;
        for (var y = 0; y < height; y += skip) {
            for (var x = 0; x < width; x += skip) {
                for (var c = 0; c < 4; c++) {
                    result.data[d++] = srcImageData.data[(y*width+x)*4+c];
                }
            }
        }
        srcImageData = result;
        return srcImageData;
    }

    self.downsampleHorizontal = function(srcImageData, width, height) {
        var backContext = document.createElement('canvas').getContext('2d');
        var result = backContext.createImageData(width-1, height);
        var d = 0;
        for (var y = 0; y < height; y += 1) {
            for (var x = 0; x < width-1; x += 1) {
                for (var c = 0; c < 4; c++) {
                    result.data[d++] = srcImageData.data[(y*width+x)*4+c];
                }
            }
        }
        srcImageData = result;
        return result;
    }

	self.pyrDownHorizontally = function(srcImageData, level) {
        var height = srcImageData.height;
        var width = srcImageData.width;
        for (var i = 0; i <= level; i++) {
            console.info(i + ' ' + self.width + ' ' + self.height);
            srcImageData = self.downsampleHorizontal(srcImageData, self.width, self.height);
            self.width = self.width - 1;
        }
        return srcImageData;
    }

	self.resizeHorizontally = function(widthDiff) {

		self.currentWidth = self.canvas.width;
		self.pixelData = self.pyrDownHorizontally(self.pixelData, widthDiff);
     //    context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
    	// self.canvas.width = self.width;
    	// context.putImageData(self.pixelData, 0, 0);
        return self.pixelData
	}


    self.downsampleHorizontalAndPopulateArray = function(srcImageData, width, height, pixelArray) {
        console.log("downsampleHorizontalAndPopulateArray");
        var backContext = document.createElement('canvas').getContext('2d');
        var d = 0;
        for (var i=0; i < pixelArray.length; i++) {
            
            var result = backContext.createImageData(width-1, height);
            var pixelsToExclude = pixelArray[i];
            var d = 0;
            var numSkipped = 0;
            for (var row = 0; row < height; row += 1) {
                for (var col = 0; col < width; col += 1) {
                    if (col == pixelsToExclude[row]) {
                        numSkipped = numSkipped + 1;
                    } else {
                        for (var c = 0; c < 4; c++) {
                            result.data[d++] = srcImageData.data[(row*width+col)*4+c];
                        }
                    }
                    // for (var c = 0; c < 4; c++) {
                    //     result.data[d++] = srcImageData.data[(row*width+col)*4+c];
                    // }
                }
            }
            if (numSkipped != 600) {
                console.log("numSkipped " + numSkipped);   
            }
            width = width - 1;

            srcImageData = result;
            if (i%10 == 0) {
                self.cachePictures[i] = result;
            }
        }
        
        return result;
    }

    self.pyrDownHorizontallyAndPopulateArray = function(srcImageData, pixelArray) {
        var height = srcImageData.height;
        var width = srcImageData.width;
        for (var i = 0; i <= level; i++) {
            console.info(i + ' ' + self.width + ' ' + self.height);
            srcImageData = self.downsampleHorizontalAndPopulateArray(srcImageData, self.width, self.height, pixelArray);
            self.width = self.width - 1;
        }
        return srcImageData;
    }

    self.resizeHorizontallyAndPopulateArray = function(pixelArray) {

        self.currentWidth = self.canvas.width;
        self.pixelData = self.downsampleHorizontalAndPopulateArray(self.pixelData, self.width, self.height, pixelArray);
     //    context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        // self.canvas.width = self.width;
        // context.putImageData(self.pixelData, 0, 0);
        return self.pixelData
    }

    self.setWidth = function(width) {
        context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        context.putImageData(self.cachePictures[Math.round(width / 10) * 10], 0, 0);
    }

	if (type == 'vertical') {

	} else if (type == 'horizontal') {
		//var worker = new Worker('polarBearHorizontalWorker.js');
		self.resizeHorizontallyAndPopulateArray(pixelArray);
		$( window ).resize(function() {
            self.setWidth(self.initialCanvasWidth - $(canvas).width());
		});
	}
    return self;
    
}