var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component;

var GalleryImage = Montage.specialize({

    constructor: {
        value: function GalleryImage() {}
    }

},{

    withLoadedImage: {
        value: function (loadedImage) {
            var galleryImage = new GalleryImage;

            galleryImage.originalSrc = loadedImage.src;
            galleryImage.originalWidth = loadedImage.width;
            galleryImage.originalHeight = loadedImage.height;
            return galleryImage;
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
                        self.addGalleryImage(GalleryImage.withLoadedImage(image));
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

    src: {
        get: function () {
            return this._src;
        },
        set: function (value) {
            if (this._src !== value) {
                this._src = value;
                this.needsDraw = true;
            }
        }
    },

    draw: {
        value: function () {
            if (this._src) {
                this.imageElement.style.backgroundImage = "url(" + this._src + ")";
            }
        }
    }

});
