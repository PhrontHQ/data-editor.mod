var Component = require("montage/ui/component").Component,
    TranslateComposer = require("montage/composer/translate-composer").TranslateComposer;

exports.DatagridColumnHeader = Component.specialize({

    constructor: {
        value: function DatagridColumnHeader() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this._translateComposer = new TranslateComposer;
                this._translateComposer.addEventListener("translateStart", this);
                this._translateComposer.addEventListener("translateEnd", this);
                this._translateComposer.addEventListener("translate", this);
                this._translateComposer.axis = "horizontal";
                this._translateComposer.translateX = this.width;
                this._translateComposer.minTranslateX = 50;
                this._translateComposer.hasMomentum = false;
                this.addComposerForElement(this._translateComposer, this.resizeHandle);
                this.wrapper.addEventListener("click", this);
            }
        }
    },

    handleTranslateStart: {
        value: function () {
            this.classList.add("isResizing");
        }
    },

    handleTranslate: {
        value: function (event) {
            this.width = event.translateX;
            this.datagrid.resizeColumn(this.index, this.width);
        }
    },

    handleTranslateEnd: {
        value: function () {
            this.classList.remove("isResizing");
            this.datagrid.updateStyle();
        }
    },

    handleClick: {
        value: function () {
            this.datagrid.sortBy(this.columnDescriptor.ordering);
        }
    },

    title: {
        value: undefined
    }

});
