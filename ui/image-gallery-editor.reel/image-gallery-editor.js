"use strict";
var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Exif = require("exif-js/exif").EXIF;

function getOrientedCanvas(galleryImage, callback) {
    var image;

    if (galleryImage) {
        image = new Image;
        image.src = galleryImage.originalSrc;
        image.onload = function () {
            var canvas = document.createElement("canvas"),
                context = canvas.getContext("2d"),
                orientation = galleryImage.exif && galleryImage.exif.Orientation || 1,
                width,
                height;

            if (orientation <= 4) {
                width = image.width;
                height = image.height;
            } else {
                width = image.height;
                height = image.width;
            }
            canvas.width = width;
            canvas.height = height;
            switch(orientation) {
                case 1: context.transform(1, 0, 0, 1, 0, 0); break;
                case 2: context.transform(-1, 0, 0, 1, width, 0); break;
                case 3: context.transform(-1, 0, 0, -1, width, height); break;
                case 4: context.transform(1, 0, 0, -1, 0, height); break;
                case 5: context.transform(0, 1, 1, 0, 0, 0); break;
                case 6: context.transform(0, 1, -1, 0, width, 0); break;
                case 7: context.transform(0, -1, -1, 0, width, height); break;
                case 8: context.transform(0, -1, 1, 0, 0, height); break;
            }
            context.drawImage(image, 0, 0);
            callback(canvas);
        };
    }
}

function resize(canvas, maxSize) {
    var resizedCanvas,
        context;

    if (Math.max(canvas.width, canvas.height) > maxSize) {
        resizedCanvas = document.createElement("canvas");
        context = resizedCanvas.getContext("2d");
        if (canvas.width > canvas.height) {
            resizedCanvas.width = maxSize;
            resizedCanvas.height = Math.round(canvas.height * maxSize / canvas.width) || 1;
        } else {
            resizedCanvas.height = maxSize;
            resizedCanvas.width = Math.round(canvas.width * maxSize / canvas.height) || 1;
        }
        context.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
        return resizedCanvas;
    }
    return canvas;
}

var GalleryImage = Montage.specialize({

    constructor: {
        value: function GalleryImage() {}
    },

    description: {value: undefined},
    exif: {value: undefined},
    latitude: {value: undefined},
    longitude: {value: undefined},

    originalSrc: {value: undefined},
    originalWidth: {value: undefined},
    originalHeight: {value: undefined},

    transformedSrc: {value: undefined},
    transformedWidth: {value: undefined},
    transformedHeight: {value: undefined},

    thumbnailSrc: {value: undefined},
    thumbnailWidth: {value: undefined},
    thumbnailHeight: {value: undefined},

    transformedMaxSize: {value: 1500},
    transformedFormat: {value: "image/jpeg"},
    transformedQuality: {value: 0.5},

    thumbnailMaxSize: {value: 300},
    thumbnailFormat: {value: "image/jpeg"},
    thumbnailQuality: {value: 0.5},

    _resize: {
        value: function () {

        }
    },

    transform: {
        value: function () {
            var self = this;

            getOrientedCanvas(this, function (canvas) {
                var transformedCanvas = resize(canvas, self.transformedMaxSize),
                    thumbnailCanvas = resize(canvas, self.thumbnailMaxSize);

                self.transformedSrc = transformedCanvas.toDataURL(self.transformedFormat, self.transformedQuality);
                self.transformedWidth = transformedCanvas.width;
                self.transformedHeight = transformedCanvas.height;
                self.thumbnailSrc = thumbnailCanvas.toDataURL(self.thumbnailFormat, self.thumbnailQuality);
                self.thumbnailWidth = thumbnailCanvas.width;
                self.thumbnailHeight = thumbnailCanvas.height;
            });
        }
    }

},{

    withLoadedImage: {
        value: function (loadedImage, callback) {
            var galleryImage = new GalleryImage;

            galleryImage.originalSrc = loadedImage.src;
            galleryImage.originalWidth = loadedImage.width;
            galleryImage.originalHeight = loadedImage.height;
            Exif.getData(loadedImage, function () {
                galleryImage.exif = Exif.getAllTags(this);
                if (galleryImage.exif) {
                    if (galleryImage.exif.GPSLatitude &&
                        galleryImage.exif.GPSLatitudeRef &&
                        galleryImage.exif.GPSLongitude &&
                        galleryImage.exif.GPSLongitudeRef) {
                        galleryImage.latitude = (
                            galleryImage.exif.GPSLatitude[0].numerator / galleryImage.exif.GPSLatitude[0].denominator +
                            galleryImage.exif.GPSLatitude[1].numerator / galleryImage.exif.GPSLatitude[1].denominator / 60 +
                            galleryImage.exif.GPSLatitude[2].numerator / galleryImage.exif.GPSLatitude[2].denominator / 3600
                        ) * (galleryImage.exif.GPSLatitudeRef === "N" ? 1 : -1);
                        galleryImage.longitude = (
                            galleryImage.exif.GPSLongitude[0].numerator / galleryImage.exif.GPSLongitude[0].denominator +
                            galleryImage.exif.GPSLongitude[1].numerator / galleryImage.exif.GPSLongitude[1].denominator / 60 +
                            galleryImage.exif.GPSLongitude[2].numerator / galleryImage.exif.GPSLongitude[2].denominator / 3600
                        ) * (galleryImage.exif.GPSLongitudeRef === "E" ? 1 : -1);
                    }
                }
                galleryImage.transform();
                callback(galleryImage);
            });
        }
    }

});

exports.ImageGalleryEditor = Component.specialize({

    constructor: {
        value: function ImageGalleryEditor() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this.addImageFileInput.addEventListener("change", this.handleAddImageFileInputChange.bind(this));
            }
        }
    },

    addGalleryImage: {
        value: function (galleryImage) {
            if (!this.content) {
                this.content = [];
            }
            this.content.push(galleryImage);
            this.repetition.selection.set(0, galleryImage);
        }
    },

    loadImage: {
        value: function (src, callback) {
            var image = new Image;

            image.src = src;
            image.addEventListener("load", function () {
                callback(image);
            });
        }
    },

    handleAddImageFileInputChange: {
        value: function () {
            var file = this.addImageFileInput.files[0],
                fileReader,
                self;

            if (file) {
                self = this;
                fileReader = new FileReader;
                fileReader.readAsDataURL(file);
                fileReader.addEventListener("load", function () {
                    self.loadImage(fileReader.result, function (image) {
                        GalleryImage.withLoadedImage(image, function (galleryImage) {
                            self.addGalleryImage(galleryImage);
                        });
                    });
                });
                this.addImageFileInput.value = null;
            }
        }
    },

    handleAddImageButtonAction: {
        value: function () {
            this.addImageFileInput.click();
        }
    },

    handleDeleteButtonAction: {
        value: function () {
            var selected = this.repetition.selection[0],
                index = this.content.indexOf(selected);

            this.content.splice(index, 1);
            this.repetition.selection.set(0, this.content[index] || this.content[index - 1]);
        }
    },

    selected: {
        get: function () {
            return this._selected;
        },
        set: function (value) {
            var self;

            if (this._selected !== value) {
                self = this;
                this._selected = value;
                getOrientedCanvas(this._selected, function (canvas) {
                    self._oriented = canvas;
                    self.needsDraw = true;
                });
            }
            this._oriented = undefined;
            this.needsDraw = true;
        }
    },

    handleResize: {
        value: function () {
            this.needsDraw = true;
        }
    },

    willDraw: {
        value: function () {
            var rect = this.canvasElement.getBoundingClientRect();

            this._canvasWidth = rect.width;
            this._canvasHeight = rect.height;
        }
    },

    draw: {
        value: function () {
            var padding = 20,
                maxWidth,
                maxHeight,
                width,
                height;

            this.canvasElement.innerHTML = "";
            if (this._canvasWidth === 0 || this._canvasHeight === 0) {
                this.needsDraw = true;
                return;
            }
            if (this._oriented) {
                maxWidth = this._canvasWidth - padding * 2;
                maxHeight = this._canvasHeight - padding * 2;
                if (this._oriented.width / this._oriented.height > maxWidth / maxHeight) {
                    width = maxWidth;
                    height = this._oriented.height * maxWidth / this._oriented.width;
                } else {
                    width = this._oriented.width * maxHeight / this._oriented.height;
                    height = maxHeight;
                }
                this._oriented.style.width = width + "px";
                this._oriented.style.height = height + "px";
                this._oriented.style.position = "absolute";
                this._oriented.style.left = ((this._canvasWidth - width) >> 1) + "px";
                this._oriented.style.top = ((this._canvasHeight - height) >> 1) + "px";
                this.canvasElement.appendChild(this._oriented);
            }
        }
    }

});
