var Component = require("montage/ui/component").Component;

exports.DatagridRow = Component.specialize({

    constructor: {
        value: function DatagridRow() {}
    },

    index: {
        set: function (value) {
            this._element.style.top = value * this.rowHeight + "px";
            if (value % 2) {
                this.classList.add("odd");
            } else {
                this.classList.remove("odd");
            }
        }
    }

});
