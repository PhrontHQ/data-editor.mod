var Component = require("montage/ui/component").Component;

exports.Cell = Component.specialize({

    constructor: {
        value: function Cell() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this._element.addEventListener("focusin", this);
                this.defineBinding("expandButton.label", {"<-": "datagrid.expandButtonLabel"});
                this.expandButton.addEventListener("action", this);
            }
        }
    },

    handleAction: {
        value: function () {
            this.datagrid.dispatchExpandAction(this.columnIndex);
        }
    },

    handleFocusin: {
        value: function () {
            this.classList.add("isFocused");
            this._element.addEventListener("focusout", this);
            this.datagrid.setActiveSelection(this.columnIndex, this);
        }
    },

    handleFocusout: {
        value: function () {
            this.classList.remove("isFocused");
            this._element.removeEventListener("focusout", this);
        }
    },

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

    hasExpandButton: {
        get: function () {
            return this._hasExpandButton;
        },
        set: function (value) {
            if (this._hasExpandButton !== value) {
                this._hasExpandButton = value;
                if (value) {
                    this.classList.add("hasExpandButton");
                } else {
                    this.classList.remove("hasExpandButton");
                }
            }
        }
    }

});
