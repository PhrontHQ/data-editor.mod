var Component = require("montage/ui/component").Component;

exports.CellImagesImage = Component.specialize({

    constructor: {
        value: function CellImagesImage() {}
    },

    src: {
        get: function () {
            return this._src;
        },
        set: function (value) {
            if (this._src !== value) {
                this._src = value;
                if (value) {
                    this.needsDraw = true;
                }
            }
        }
    },

    draw: {
        value: function () {
            if (this._src) {
                this._element.style.backgroundImage = "url(" + this._src + ")";
            }
        }
    }

});
