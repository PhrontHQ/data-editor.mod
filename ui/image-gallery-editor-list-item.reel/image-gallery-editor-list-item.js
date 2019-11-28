var Component = require("montage/ui/component").Component,
    SortableRepetitionItem = require("ui/sortable-repetition-item.reel").SortableRepetitionItem;

exports.ImageGalleryEditorListItem = SortableRepetitionItem.specialize({

    constructor: {
        value: function ImageGalleryEditorListItem() {
            this.super();
        }
    },

    src: {
        get: function () {
            return this._src;
        },
        set: function (value) {
            if (this._src !== value) {
                this._src = value;
                this._needsUpdateSrc = true;
                this.needsDraw = true;
            }
        }
    },

    draw: {
        value: function () {
            var height;

            this.super();
            if (this._needsUpdateSrc) {
                height = this.galleryImage.thumbnailHeight * 100 / this.galleryImage.thumbnailWidth;
                if (height <= 100) {
                    this._element.style.width = "100px";
                    this._element.style.height = height + "px";
                } else {
                    this._element.style.width = this.galleryImage.thumbnailWidth * 100 / this.galleryImage.thumbnailHeight + "px";
                    this._element.style.height = "100px";
                }
                this._element.style.backgroundImage = "url(" + this._src + ")";
                this._needsUpdateSrc = false;
            }
        }
    }

});
