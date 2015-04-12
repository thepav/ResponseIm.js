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
    self.orgImgWidth = img.width;
    self.initialCanvasWidth = $(canvas).width();
    self.initialWindowWidth = $(window).width();



    self.getPixelData = function(data, w, h) {
        self.backContext.createImageData(w, h);
        self.backContext.drawImage(data, 0, 0);
        return backContext.getImageData(0, 0, w, h);
    }

	self.pixelData = self.getPixelData(img, self.width, self.height);

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
                }
            }
            console.log(width);
            if (numSkipped != 637) {
                console.log("numSkipped " + numSkipped);   
            }
            width = width - 1;

            srcImageData = result;
            //if (i%10 == 0) {
                self.cachePictures[i] = result;
            //}
        }
        
        return result;
    }


    self.resizeHorizontallyAndPopulateArray = function(pixelArray) {

        self.currentWidth = self.canvas.width;
        self.pixelData = self.downsampleHorizontalAndPopulateArray(self.pixelData, self.orgImgWidth, self.height, pixelArray);
     //    context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        // self.canvas.width = self.width;
        // context.putImageData(self.pixelData, 0, 0);
        return self.pixelData
    }

    self.setWidth = function(width) {
        context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
        console.log('index: '+ width);

        context.putImageData(self.cachePictures[width], 0,0);
        $("#img-no-inseam").css('width', self.cachePictures[width].width + "px;");
    }

	if (type == 'vertical') {

	} else if (type == 'horizontal') {
		//var worker = new Worker('polarBearHorizontalWorker.js');
		self.resizeHorizontallyAndPopulateArray(pixelArray);
        console.log('INITIAL SET! '+(self.orgImgWidth-self.initialCanvasWidth));
        self.setWidth(self.orgImgWidth-self.initialCanvasWidth);
		$( window ).resize(function() {
            self.setWidth(self.orgImgWidth- $(canvas).width());
            console.log("HI");
		});
	}
    return self;
    
}