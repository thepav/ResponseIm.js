function dynamicResize(canvas, context, image, type) {
	var self = {};
	self.canvas = canvas;
	self.image = image;
	self.width = self.image.width;
	self.height = self.image.height;
	this.context = context;

	console.log(self.canvas.width);
	console.log(self.canvas.height);

	self.currentWidth = self.canvas.width;
	self.type = type;
	self.pixelData = null;

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

    self.getPixelData = function(data) {
        backContext.createImageData(w, h);
        backContext.drawImage(data, 0, 0);
        return backContext.getImageData(0, 0, w, h);
    }

	self.resizeHorizontally = function() {
		var width = self.canvas.width;
		var widthDiff = self.currentWidth - width;
		self.currentWidth = width;
		if (self.pixelData == null) {
			self.pixelData = self.getPixelData(self.image)
		}
		self.pixelData = self.pyrDownHorizontally(self.pixelData, widthDiff);
        context.clearRect ( 0 , 0 , self.canvas.width, self.canvas.height );
    	self.canvas.width = self.width;
    	context.putImageData(self.pixelData, 0, 0);
	}

	if (type == 'vertical') {

	} else if (type == 'horizontal') {
		var doit;
		
		window.onresize = function(){
		  self.resizeHorizontally();
		};
		// $( window ).resize(function() {
		// 	var a = self.currentWidth - $(window).width()
		// 	console.log(a);
		// });
	}
	return self;
}