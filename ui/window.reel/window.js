"use strict";
var Component = require("montage/ui/component").Component,
    TranslateComposer = require("montage/composer/translate-composer").TranslateComposer,
    zIndex = 0;

exports.Window = Component.specialize({

    constructor: {
        value: function Window() {}
    },

    addTranslateComposers: {
        value: function (element) {
            var areas = [
                    {element: this.header, isMovingFromX: true, isMovingToX: true, isMovingFromY: true, isMovingToY: true},
                    {element: this.resizeTopLeft, isMovingFromX: true, isMovingFromY: true},
                    {element: this.resizeTop, isMovingFromY: true},
                    {element: this.resizeTopRight, isMovingToX: true, isMovingFromY: true},
                    {element: this.resizeLeft, isMovingFromX: true},
                    {element: this.resizeRight, isMovingToX: true},
                    {element: this.resizeBottomLeft, isMovingFromX: true, isMovingToY: true},
                    {element: this.resizeBottom, isMovingToY: true},
                    {element: this.resizeBottomRight, isMovingToX: true, isMovingToY: true}
                ],
                translateComposer,
                i;

            for (i = 0; i < areas.length; i++) {
                translateComposer = new TranslateComposer;
                translateComposer.addEventListener("translateStart", this);
                translateComposer.hasMomentum = false;
                translateComposer.area = areas[i];
                this.addComposerForElement(translateComposer, areas[i].element);
            }
        }
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this.addTranslateComposers();
                this._element.addEventListener("focusin", this);
                window.addEventListener("resize", this);
                this._hasEnteredDocument = true;
            }
            this.syncDraw();
        }
    },

    handleResize: {
        value: function () {
            this.syncDraw();
        }
    },

    handleFocusin: {
        value: function () {
            this._element.style.zIndex = ++zIndex;
        }
    },

    handleTranslateStart: {
        value: function (event) {
            event.target.addEventListener("translate", this);
            event.target.addEventListener("translateEnd", this);
            event.target.addEventListener("translateCancel", this);
            this._startFromX = this._fromX;
            this._startFromY = this._fromY;
            this._startToX = this._toX;
            this._startToY = this._toY;
        }
    },

    width: {value: 600},
    height: {value: 450},
    _minWidth: {value: 300},
    _minHeight: {value: 300},
    _fromX: {value: undefined},
    _fromY: {value: undefined},
    _toX: {value: undefined},
    _toY: {value: undefined},

    syncDraw: {
        value: function () {
            var innerWidth = window.innerWidth,
                innerHeight = window.innerHeight,
                headerHeight = this.header.getBoundingClientRect().height,
                width, height,
                dif;

            if (this._fromY > innerHeight - headerHeight) {
                dif = this._fromY - (innerHeight - headerHeight);
                this._fromY = innerHeight - headerHeight;
                this._toY -= dif;
            }
            if (this._fromY < 0) {
                this._toY -= this._fromY;
                this._fromY = 0;
            }
            if (this._fromX > innerWidth - headerHeight) {
                dif = this._fromX - (innerWidth - headerHeight);
                this._fromX = innerWidth - headerHeight;
                this._toX -= dif;
            }
            if (this._toX < headerHeight) {
                dif = this._toX - headerHeight;
                this._toX = headerHeight;
                this._fromX -= dif;
            }
            this._element.style.left = this._fromX + "px";
            this._element.style.top = this._fromY + "px";
            width = this._toX - this._fromX;
            height = this._toY - this._fromY;
            if (this._width !== width) {
                this._width = width;
                this._element.style.width = width  + "px";
            }
            if (this._height !== height) {
                this._height = height;
                this._element.style.height = height  + "px";
            }
            this._dispatchResize();
        }
    },

    _dispatchResize: {
        value: function () {
            var stack = this.childComponents.slice(),
                component;

            while (component = stack.pop()) {
                if (typeof component.handleResize === "function") {
                    component.handleResize();
                }
                stack.swap(stack.length, 0, component.childComponents);
            }
        }
    },

    handleTranslate: {
        value: function (event) {
            var innerWidth = window.innerWidth,
                innerHeight = window.innerHeight,
                area = event.target.area;

            if (area.isMovingFromX) {
                this._fromX = Math.round(this._startFromX + event.translateX);
            }
            if (area.isMovingFromY) {
                this._fromY = Math.round(this._startFromY + event.translateY);
            }
            if (area.isMovingToX) {
                this._toX = Math.round(this._startToX + event.translateX);
            }
            if (area.isMovingToY) {
                this._toY = Math.round(this._startToY + event.translateY);
            }
            if (!(area.isMovingFromX && area.isMovingFromY && area.isMovingToX && area.isMovingToY)) {
                if (area.isMovingFromX) {
                    if (this._toX - this._fromX < this._minWidth) {
                        this._fromX = this._toX - this._minWidth;
                    }
                    if (this._fromX < 0) {
                        this._fromX = 0;
                    }
                }
                if (area.isMovingFromY) {
                    if (this._toY - this._fromY < this._minHeight) {
                        this._fromY = this._toY - this._minHeight;
                    }
                    if (this._fromY < 0) {
                        this._fromY = 0;
                    }
                }
                if (area.isMovingToX) {
                    if (this._toX - this._fromX < this._minWidth) {
                        this._toX = this._fromX + this._minWidth;
                    }
                    if (this._toX > innerWidth) {
                        this._toX = innerWidth;
                    }
                }
                if (area.isMovingToY) {
                    if (this._toY - this._fromY < this._minHeight) {
                        this._toY = this._fromY + this._minHeight;
                    }
                    if (this._toY > innerHeight) {
                        this._toY = innerHeight;
                    }
                }
            }
            this.syncDraw();
        }
    },

    _resetTranslateComposer: {
        value: function (translateComposer) {
            translateComposer.removeEventListener("translate", this);
            translateComposer.removeEventListener("translateEnd", this);
            translateComposer.removeEventListener("translateCancel", this);
            translateComposer.translateX = 0;
            translateComposer.translateY = 0;
        }
    },

    handleTranslateEnd: {
        value: function (event) {
            this._resetTranslateComposer(event.target);
        }
    },

    handleTranslateCancel: {
        value: function (event) {
            this._resetTranslateComposer(event.target);
        }
    },

    title: {
        value: "Window"
    },

    _isVisible: {
        value: false
    },

    isVisible: {
        get: function () {
            return this._isVisible;
        },
        set: function (value) {
            value = !!value;
            if (this._isVisible !== value) {
                this._isVisible = value;
                if (value) {
                    this._fromX = (window.innerWidth - this.width) >> 1;
                    this._fromY = (window.innerHeight - this.height) >> 1;
                    this._toX = this._fromX + this.width;
                    this._toY = this._fromY + this.height;
                    this.element.classList.add("isVisible");
                    if (this._hasEnteredDocument) {
                        this.syncDraw();
                    }
                } else {
                    this.element.classList.remove("isVisible");
                }
            }
        }
    },

    handleCloseButtonAction: {
        value: function () {
            this.isVisible = false;
        }
    }

});
