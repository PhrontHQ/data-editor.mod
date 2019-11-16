var Component = require("montage/ui/component").Component,
    SortableRepetition = require("../sortable-repetition.reel").SortableRepetition,
    TranslateComposer = require("montage/composer/translate-composer").TranslateComposer;

exports.SortableRepetitionItem = Component.specialize({

    constructor: {
        value: function SortableRepetitionItem() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            var component = this;

            while ((component = component.parentComponent) && !(component instanceof SortableRepetition));
            this._sortableRepetition = component;
            if (isFirstTime) {
                this._translateComposer = new TranslateComposer;
                this._translateComposer.addEventListener("translateStart", this);
                this._translateComposer.hasMomentum = false;
                this._translateComposer.shouldCancelOnSroll = false;
                this.addComposerForElement(this._translateComposer, this.handle);
            }
        }
    },

    handleTranslateStart: {
        value: function (event) {
            this._translateComposer.addEventListener("translate", this);
            this._translateComposer.addEventListener("translateEnd", this);
            this._translateComposer.addEventListener("translateCancel", this);
            if (this._sortableRepetition && this._sortableRepetition.handleTranslateStart) {
                this._sortableRepetition.handleTranslateStart(event);
            }
        }
    },

    handleTranslate: {
        value: function (event) {
            if (this._sortableRepetition && this._sortableRepetition.handleTranslate) {
                this._sortableRepetition.handleTranslate(event);
            }
        }
    },

    _resetTranslateComposer: {
        value: function () {
            this._translateComposer.removeEventListener("translate", this);
            this._translateComposer.removeEventListener("translateEnd", this);
            this._translateComposer.removeEventListener("translateCancel", this);
            this._translateComposer.translateX = 0;
            this._translateComposer.translateY = 0;
        }
    },

    handleTranslateEnd: {
        value: function (event) {
            this._resetTranslateComposer();
            if (this._sortableRepetition && this._sortableRepetition.handleTranslateEnd) {
                this._sortableRepetition.handleTranslateEnd(event);
            }
        }
    },

    handleTranslateCancel: {
        value: function (event) {
            this._resetTranslateComposer();
            if (this._sortableRepetition && this._sortableRepetition.handleTranslateCancel) {
                this._sortableRepetition.handleTranslateCancel(event);
            }
        }
    },

    _drawnTranslateX: {
        value: 0
    },

    _drawnTranslateY: {
        value: 0
    },

    _translateX: {
        value: 0
    },

    translateX: {
        get: function () {
            return this._translateX;
        },
        set: function (value) {
            if (this._translateX !== value) {
                this._translateX = value;
                if (!this._isOwnUpdate) {
                    this._isAnimating = false;
                }
                this.needsDraw = true;
            }
        }
    },

    _translateY: {
        value: 0
    },

    translateY: {
        get: function () {
            return this._translateY;
        },
        set: function (value) {
            if (this._translateY !== value) {
                this._translateY = value;
                if (!this._isOwnUpdate) {
                    this._isAnimating = false;
                }
                this.needsDraw = true;
            }
        }
    },

    animateTo: {
        value: function (x, y, duration) {
            this._animationStartTime = performance.now();
            this._startTranslateX = this._translateX;
            this._startTranslateY = this._translateY;
            this._endTranslateX = x;
            this._endTranslateY = y;
            if (duration === null || duration === undefined) {
                this._animationDuration = 330;
            } else {
                this._animationDuration = duration;
            }
            this._isAnimating = true;
            this.needsDraw = true;
        }
    },

    willDraw: {
        value: function () {
            var time;

            if (this._isAnimating) {
                time = (performance.now() - this._animationStartTime) / this._animationDuration;
                this._isOwnUpdate = true;
                if (time < 1) {
                    time = Math.pow(((Math.cos(Math.PI - Math.pow(time, .2) * Math.PI) + 1) / 2), 9);
                    this.translateX = this._startTranslateX + (this._endTranslateX - this._startTranslateX) * time;
                    this.translateY = this._startTranslateY + (this._endTranslateY - this._startTranslateY) * time;
                } else {
                    this.translateX = this._endTranslateX;
                    this.translateY = this._endTranslateY;
                    this._isAnimating = false;
                }
                this._isOwnUpdate = false;
            }
        }
    },

    draw: {
        value: function () {
            if (this._translateX || this._translateY) {
                this.element.style.transform = "translate3d(" + this._translateX + "px," + this._translateY + "px,0)";
                this._drawnTranslateX = this._translateX;
                this._drawnTranslateY = this._translateY;
            } else {
                this.element.style.transform = null;
            }
            if (this._isAnimating) {
                this.needsDraw = true;
            }
        }
    }

});
