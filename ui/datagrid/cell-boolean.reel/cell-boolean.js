var Cell = require("../cell.reel").Cell;

exports.CellBoolean = Cell.specialize({

    constructor: {
        value: function CellBoolean() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            this.super(isFirstTime);
            if (isFirstTime) {
                this._element.addEventListener("click", this);
                this.checkbox.addEventListener("input", this);
            }
            this.displayCheckbox.checked = this.checkbox.checked = this._value;
        }
    },

    _value: {
        value: false
    },

    value: {
        get: function () {
            return this._value;
        },
        set: function (value) {
            value = !!value;
            if (this._value !== value) {
                this._value = value;
                if (this.checkbox) {
                    this.displayCheckbox.checked = this.checkbox.checked = value;
                }
            }
        }
    },

    handleInput: {
        value: function () {
            this.value = this.checkbox.checked;
        }
    },

    handleClick: {
        value: function () {
            this.checkbox.focus();
        }
    }

});
