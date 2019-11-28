var Cell = require("../cell.reel").Cell;

exports.CellObjects = Cell.specialize({

    constructor: {
        value: function CellObjects() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            this.super(isFirstTime);
            if (isFirstTime) {
                this._element.addEventListener("click", this);
            }
        }
    },

    handleClick: {
        value: function () {
            if (this.hasExpandButton) {
                this.expandButton.focus();
            }
        }
    }

});
