"use strict";
var Component = require("montage/ui/component").Component,
    RangeController = require("montage/core/range-controller").RangeController;

exports.SortableRepetition = Component.specialize({

    constructor: {
        value: function SortableRepetition() {
            this._zIndex = 1;
        }
    },

    _draggingComponent: {
        value: null
    },

    _draggingIteration: {
        value: null
    },

    _getItemPositionAtIndex: {
        value: function (index) {
            var iteration = this._repetition._drawnIterations[index],
                element = iteration.cachedFirstElement,
                box = element.getBoundingClientRect();

            return {
                x: box.left - element.component.translateX + this._element.scrollLeft,
                y: box.top - element.component.translateY + this._element.scrollTop
            };
        }
    },

    _computePosibleLayouts: {
        value: function () {
            var bookmark = document.createComment(""),
                length = this._repetition._drawnIterations.length,
                iteration,
                element,
                layout,
                width,
                height,
                scrollElement,
                scrollTop,
                scrollLeft,
                i;

            // Ensure iterations' first elements are cached
            for (i = 0; i < length; i++) {
                this._repetition._drawnIterations[i].firstElement;
            }
            this._repetition.element.insertBefore(
                bookmark,
                this._draggingComponent.element
            );
            this._layouts = [];
            width = parseFloat(window.getComputedStyle(this._repetition.element).getPropertyValue("width"));
            height = this._repetition.element.getBoundingClientRect().height;
            this._scrollWidth = width;
            this._repetition.element.style.minWidth = this._scrollWidth + "px";
            this._scrollHeight = height;
            this._repetition.element.style.minHeight = this._scrollHeight + "px";
            scrollElement = this.element;
            while (scrollElement && !(scrollElement.scrollTop || scrollElement.scrollLeft)) {
                scrollElement = scrollElement.parentNode;
            }
            if (scrollElement) {
                scrollTop = scrollElement.scrollTop;
                scrollLeft = scrollElement.scrollLeft;
            }
            for (i = 0; i < length; i++) {
                if (i < this._draggingIteration.index) {
                    iteration = this._repetition._drawnIterations[i];
                } else {
                    iteration = this._repetition._drawnIterations[i + 1];
                }
                this._repetition.element.insertBefore(
                    this._draggingComponent.element,
                    iteration ? iteration.cachedFirstElement : null
                );

                // Width and height are computed in a different way on purpose
                // to properly handle the different way browsers handle floating
                // position absolute elements for containers' width and height

                width = parseFloat(window.getComputedStyle(this._repetition.element).getPropertyValue("width"));
                height = this._repetition.element.getBoundingClientRect().height;

                //height = this._element.scrollHeight;
                if (width > this._scrollWidth) {
                    this._scrollWidth = width;
                    this._repetition.element.style.minWidth = this._scrollWidth + "px";
                }
                if (height > this._scrollHeight) {
                    this._scrollHeight = height;
                    this._repetition.element.style.minHeight = this._scrollHeight + "px";
                }
                layout = this._getLayout();
                layout.insertBeforeIndex = i;
                this._layouts.push(layout);
            }
            this._repetition.element.insertBefore(
                this._draggingComponent.element,
                bookmark
            );
            this._repetition.element.removeChild(bookmark);
            if (scrollElement) {
                scrollElement.scrollTop = scrollTop;
                this._previousScrollLeft = scrollLeft;
            }
        }
    },

    _findCloserLayoutIndex: {
        value: function () {
            var index = this._draggingIteration.index,
                draggingPosition = this._layouts[index][index],
                minDistance = Infinity,
                distance, dX, dY,
                layout,
                closerLayoutIndex,
                i;

            for (i = 0; i < this._layouts.length; i++) {
                layout = this._layouts[i];
                dX = layout[index].x - this._draggingComponent.translateX - draggingPosition.x;
                dY = layout[index].y - this._draggingComponent.translateY - draggingPosition.y;
                distance = dX * dX + dY * dY;
                if (distance < minDistance) {
                    minDistance = distance;
                    closerLayoutIndex = i;
                }
            }
            return closerLayoutIndex;
        }
    },

    _getElementAtIndex: {
        value: function (index) {
            var iteration = this._repetition._drawnIterations[index];

            return iteration ? iteration.cachedFirstElement : null;
        }
    },

    _getComponentAtIndex: {
        value: function (index) {
            return this._getElementAtIndex(index).component;
        }
    },

    _getLayout: {
        value: function () {
            var length = this._repetition._drawnIterations.length,
                layout = [],
                i;

            for (i = 0; i < length; i++) {
                layout.push(this._getItemPositionAtIndex(i));
            }
            return layout;
        }
    },

    handleTranslateStart: {
        value: function (event) {
            var component,
                currentLayout,
                targetLayout,
                length,
                rect,
                scrollLeft,
                scrollTop,
                i;

            if (this._draggingComponent === null) {
                this._draggingComponent = event.target.component;
                this._draggingIteration = this._repetition._findIterationContainingElement(
                    this._draggingComponent.element
                );
                this._draggingComponent.element.style.zIndex = this._zIndex++;
                this._computePosibleLayouts();
                rect = this._draggingComponent.element.getBoundingClientRect();
                this._draggingComponent.element.style.position = "fixed";
                this._draggingComponent.element.style.top = rect.top + "px";
                this._draggingComponent.element.style.left = rect.left + "px";
                this._previousWidth = this._draggingComponent.element.style.width;
                this._previousHeight = this._draggingComponent.element.style.height;
                this._previousMaxWidth = this._draggingComponent.element.style.maxWidth;
                this._previousMaxHeight = this._draggingComponent.element.style.maxHeight;
                this._previousBoxSizing = this._draggingComponent.element.style.boxSizing;
                this._draggingComponent.element.style.width = rect.width + "px";
                this._draggingComponent.element.style.height = rect.height + "px";
                this._draggingComponent.element.style.maxWidth = "none";
                this._draggingComponent.element.style.maxHeight = "none";
                this._draggingComponent.element.style.boxSizing = "border-box";
                currentLayout = this._layouts[this._layouts.length - 1];
                targetLayout = this._layouts[this._draggingIteration.index];
                length = this._repetition._drawnIterations.length;
                for (i = 0; i < length; i++) {
                    if (i !== this._draggingIteration.index) {
                        component = this._getComponentAtIndex(i);
                        component.translateX = targetLayout[i].x - currentLayout[i].x;
                        component.translateY = targetLayout[i].y - currentLayout[i].y;
                    }
                }
                this._insertBeforeIndex = null;
            }
        }
    },

    handleTranslate: {
        value: function (event) {
            var currentLayout,
                targetLayout,
                draggingPosition,
                repetitionRect,
                component,
                index,
                i;

            if (this._draggingComponent !== null) {
                /*repetitionRect = this._repetition.element.getBoundingClientRect();
                index = this._draggingIteration.index;
                draggingPosition = this._layouts[index][index];
                console.log(draggingPosition.y + event.translateY - repetitionRect.top - 2 * this._element.scrollTop);*/
                this._draggingComponent.translateX = event.translateX;
                this._draggingComponent.translateY = event.translateY;
                this._closerLayoutIndex = this._findCloserLayoutIndex();
                if (this._insertBeforeIndex !== this._closerLayoutIndex) {
                    this._insertBeforeIndex = this._closerLayoutIndex;
                    //currentLayout = this._layouts[this._draggingIteration.index];
                    currentLayout = this._layouts[this._layouts.length - 1];
                    targetLayout = this._layouts[this._insertBeforeIndex];
                    for (i = 0; i < currentLayout.length; i++) {
                        if (i !== this._draggingIteration.index) {
                            component = this._getComponentAtIndex(i);
                            component.animateTo(
                                targetLayout[i].x - currentLayout[i].x,
                                targetLayout[i].y - currentLayout[i].y
                            );
                        }
                    }
                }
            }
        }
    },

    handleTranslateEnd: {
        value: function () {
            var length,
                component,
                content,
                translateX,
                translateY,
                currentLayout,
                targetLayout,
                indices,
                translates,
                i;

            if (this._draggingComponent !== null) {
                length = this._repetition._drawnIterations.length;
                indices = [];
                for (i = 0; i < length; i++) {
                    indices[i] = i;
                }
                indices.splice(this._draggingIteration.index, 1);
                indices.splice(this._closerLayoutIndex, 0, this._draggingIteration.index);
                translateX = this._draggingComponent.translateX;
                translateY = this._draggingComponent.translateY;
                translates = [];
                for (i = 0; i < length; i++) {
                    component = this._getComponentAtIndex(i);
                    translates.push({
                        x: component.translateX,
                        y: component.translateY
                    });
                }
                this._getComponentAtIndex(this._closerLayoutIndex).element.style.zIndex = this._zIndex++;
                this._draggingComponent.element.style.position = null;
                this._draggingComponent.element.style.top = null;
                this._draggingComponent.element.style.left = null;
                this._draggingComponent.element.style.width = this._previousWidth;
                this._draggingComponent.element.style.height = this._previousHeight;
                this._draggingComponent.element.style.maxWidth = this._previousMaxWidth;
                this._draggingComponent.element.style.maxHeight = this._previousMaxHeight;
                this._draggingComponent.element.style.boxSizing = this._previousBoxSizing;
                targetLayout = this._layouts[this._insertBeforeIndex];
                for (i = 0; i < length; i++) {
                    component = this._getComponentAtIndex(i);
                    component.needsDraw = true;
                    if (i === this._closerLayoutIndex) {
                        currentLayout = this._layouts[this._draggingIteration.index];
                    } else {
                        currentLayout = this._layouts[this._layouts.length - 1];
                    }
                    translateX = translates[indices[i]].x - targetLayout[indices[i]].x + currentLayout[indices[i]].x;
                    translateY = translates[indices[i]].y - targetLayout[indices[i]].y + currentLayout[indices[i]].y;
                    component.translateX = translateX;
                    component.translateY = translateY;
                    if (translateX || translateY) {
                        component.animateTo(0, 0, 165);
                    }
                }
                content = this.content.slice();
                content.splice(this._draggingIteration.index, 1);
                content.splice(this._closerLayoutIndex, 0, this._draggingIteration.object);
                this.content.swap(0, Infinity, content);
                this._draggingComponent = null;
                this._draggingIteration = null;
                this._repetition.element.style.minWidth = null;
                this._repetition.element.style.minHeight = null;
            }
        }
    },

    handleTranslateCancel: {
        value: function () {
            var length,
                i;

            if (this._draggingComponent !== null) {
                length = this._repetition._drawnIterations.length;
                for (i = 0; i < length; i++) {
                    this._getComponentAtIndex(i).animateTo(0, 0);
                }
                this._draggingComponent = null;
                this._draggingIteration = null;
                this._repetition.element.style.minWidth = null;
                this._repetition.element.style.minHeight = null;
            }
        }
    },

    content: {
        get: function () {
            return this.getPath("contentController.content");
        },
        set: function (content) {
            this.contentController = new RangeController().initWithContent(content);
        }
    }/*,

    willDraw: {
        value: function () {
            var length,
                iteration,
                element,
                box,
                i;

            if (this._draggingComponent !== null) {
                if (this._isFirstTranslate) {
                    length = this._repetition._drawnIterations.length;
                    for (i = 0; i < length; i++) {
                        iteration = this._repetition._drawnIterations[i];
                        element = iteration.cachedFirstElement || iteration.firstElement;
                        box = element.getBoundingClientRect();
                    }
                    this._isFirstTranslate = false;
                }
            }
        }
    }*/

});
