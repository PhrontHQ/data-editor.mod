var Component = require("montage/ui/component").Component;

exports.Cell = Component.specialize({

    constructor: {
        value: function Cell() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this._element.addEventListener("focusin", this);
            }
        }
    },

    handleFocusin: {
        value: function () {
            this.classList.add("isFocused");
            this._element.addEventListener("focusout", this);
        }
    },

    handleFocusout: {
        value: function () {
            this.classList.remove("isFocused");
            this._element.removeEventListener("focusout", this);
        }
    },

/*    handleBlur: {
        value: function () {
            this._element.removeEventListener("click", this);
            this._element.removeEventListener("blur", this);
        }
    },*/

    validator: {
        get: function () {
            return this._validator;
        },
        set: function (value) {
            if (this._validator !== value) {
                this._validator = value;
                this.validate();
            }
        }
    },

    value: {
        get: function () {
            return this._value;
        },
        set: function (value) {
            if (this._value !== value) {
                this._value = value;
                this.validate();
            }
        }
    },

    validate: {
        value: function () {
            if (this._validator && this._validator.validate) {
                this.isValid = this._validator.validate(this._value);
                if (this.isValid) {
                    this.classList.remove("isNotValid");
                } else {
                    this.classList.add("isNotValid");
                }
            }
        }
    },

    hasEditor: {
        get: function () {
            return this._hasEditor;
        },
        set: function (value) {
            if (this._hasEditor !== value) {
                this._hasEditor = value;
                if (value) {
                    console.log(this);
                }
            }
        }
    }

});
