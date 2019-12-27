var Montage = require("montage").Montage,
    Component = require("montage/ui/component").Component,
    Template = require("montage/core/template").Template,
    DataOrdering = require("montage/data/model/data-ordering").DataOrdering,
    instances = 0;

exports.Datagrid = Component.specialize({

    constructor: {
        value: function Datagrid() {
            this.activeSelections = {};
            this._visibleIndexes = new Set;
        }
    },

    defaultColumnHeaderPrototype: {
        value: "phront-data-editor/ui/datagrid/datagrid-column-header.reel"
    },

    expandButtonLabel: {
        value: "Expand"
    },

    _rowHeight: {
        value: 46
    },

    _scroll: {
        value: 0
    },

    _defaultColumnWidth: {
        value: 200
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                this.styleSheet = document.head.appendChild(
                    document.createElement("style")
                );
                this._instanceClass = "Datagrid-" + ++instances;
                this._element.classList.add(this._instanceClass);
                this._instanceClass = "." + this._instanceClass;
                this._generateContent();
                this._computeVisibleIndexes();
                this._element.nativeAddEventListener("wheel", this);
                window.addEventListener("resize", this);
            }
        }
    },

    handleResize: {
        value: function () {
            this._computeVisibleIndexes();
        }
    },

    handleScroll: {
        value: function (event) {
            this._scroll = this._bodyElement.scrollTop;
            this.__headerElement.scrollLeft = this._bodyElement.scrollLeft;
            this._computeVisibleIndexes();
        }
    },

    _computeVisibleIndexes: {
        value: function () {
            var windowHeight = window.innerHeight,
                maxDrawnRows = Math.ceil(windowHeight / this._rowHeight) + 1,
                firstDrawnIndex = Math.floor(this._scroll / this._rowHeight),
                i;

            if (firstDrawnIndex < 0) {
                firstDrawnIndex = 0;
            }
            if (this.content) {
                if (firstDrawnIndex + maxDrawnRows > this.content.length) {
                    firstDrawnIndex = this.content.length - maxDrawnRows;
                }
            }
            this.firstDrawnIndex = firstDrawnIndex;
            this.lastDrawnIndex = firstDrawnIndex + maxDrawnRows - 1;
            for (i = this.firstDrawnIndex; i <= this.lastDrawnIndex; i++) {
                this._visibleIndexes.add(i);
            }
            this._setVisibleIndexes();
        }
    },

    _setVisibleIndexes: {
        value: function () {
            var index,
                indexSet,
                available,
                repetitionIndexes,
                i;

            if (this._repetition && this._visibleIndexes) {
                indexSet = this._visibleIndexes;
                available = [];
                repetitionIndexes = this._repetition.visibleIndexes;
                if (repetitionIndexes.length < this._visibleIndexes.length) {
                    for (i = repetitionIndexes.length; i < this._visibleIndexes.length; i++) {
                        repetitionIndexes.set(i, 0);
                    }
                } else {
                    if (repetitionIndexes.length > this._visibleIndexes.length) {
                        repetitionIndexes.splice(this._visibleIndexes.length, Infinity);
                    }
                }
                for (i = 0; i < repetitionIndexes.length; i++) {
                    index = repetitionIndexes[i];
                    if (indexSet.has(index)) {
                        indexSet.delete(index);
                    } else {
                        available.push(i);
                    }
                }
                i = 0;
                indexSet.forEach(function (index) {
                    indexSet.delete(index);
                    repetitionIndexes.set(available[i++], index);
                });
            }
        }
    },

    dispatchExpandAction: {
        value: function (columnIndex) {
            var actionEvent = document.createEvent("CustomEvent");

            actionEvent.initCustomEvent(
                "expandAction",
                true,
                true,
                this.columnDescriptors[columnIndex]
            );
            this.dispatchEvent(actionEvent);
        }
    },

    setActiveSelection: {
        value: function (columnIndex, cell) {
            var columnDescriptor = this.columnDescriptors[columnIndex],
                value = cell[columnDescriptor.cellValuePath];

            if (columnDescriptor.activeSelectionGroup) {
                this.activeSelections[columnDescriptor.activeSelectionGroup] = {
                    value: cell[columnDescriptor.cellValuePath],
                    columnIndex: columnIndex,
                    columnDescriptor: this.columnDescriptors[columnIndex],
                    cellComponent: cell,
                    row: this._repetition.selection[0]
                };
            }
        }
    },

    draw: {
        value: function () {
            if (this.content && this._repetition) {
                this._repetition._element.style.height = this.content.length * this._rowHeight + "px";
            }
        }
    },

    repetition: {
        get: function () {
            return this._repetition;
        },
        set: function (value) {
            if (value) {
                this._repetition = value;
                if (this._bodyElement) {
                    this._bodyElement.removeEventListener("scroll", this);
                }
                this._bodyElement = this._repetition._element.parentNode;
                this._bodyElement.addEventListener("scroll", this);
                this._setVisibleIndexes();
                this.needsDraw = true;
            }
        }
    },

    handleEvent: {
        value: function (event) {
            this._bodyElement.scrollLeft += event.deltaX;
            this._bodyElement.scrollTop += event.deltaY;
            this.__headerElement.scrollLeft = this._bodyElement.scrollLeft;
            event.preventDefault();
        }
    },

    _headerElement: {
        get: function () {
            return this.__headerElement;
        },
        set: function (value) {
            if (value) {
                /*if (this.__headerElement) {
                    this.__headerElement.nativeRemoveEventListener("wheel", this);
                }*/
                this.__headerElement = value;
                //this.__headerElement.nativeAddEventListener("wheel", this);
            }
        }
    },

    sortBy: {
        value: function (ordering) {
            var index;

            if (!this.orderings) {
                this.orderings = [];
            }
            index = this.orderings.indexOf(ordering);
            if (index === 0) {
                if (ordering.order === DataOrdering.ASCENDING) {
                    ordering.order = DataOrdering.DESCENDING;
                } else {
                    ordering.order = DataOrdering.ASCENDING;
                }
            } else {
                if (index > 0) {
                    this.orderings.splice(index, 1);
                }
                this.orderings.unshift(ordering);
            }
        }
    },

    resizeColumn: {
        value: function (index, width) {
            this.columnDescriptors[index].width = Math.round(width);
            this.updateStyle(this._contentWidth);
        }
    },

    updateStyle: {
        value: function (contentWidth) {
            var style,
                numberOfColumns,
                left,
                descriptor;

            if (this.columnDescriptors) {
                style = "";
                numberOfColumns = this.columnDescriptors.length;
                left = 0;
                for (i = 0; i < numberOfColumns; i++) {
                    descriptor = this.columnDescriptors[i];
                    style += (
                        ".Datagrid-row>*:nth-child(" + numberOfColumns + "n+" + (i + 1) + ")," +
                        ".Datagrid-columnHeaders>*:nth-child(" + numberOfColumns + "n+" + (i + 1) + ")" +
                        "{" +
                            "width:" + (descriptor.width || this._defaultColumnWidth) + "px;" +
                            "left:" + left + "px;" +
                            "z-index:" + (numberOfColumns - i) +
                        "}"
                    );
                    left += descriptor.width || this._defaultColumnWidth;
                }
                left += 50;
                if (!contentWidth) {
                    this._contentWidth = contentWidth = left;
                }
                style += ".Datagrid-header{height:" + this._rowHeight + "px;line-height:" + this._rowHeight + "px}";
                style += ".Datagrid-columnHeaders{width:" + (contentWidth + 100) + "px}";
                style += ".Datagrid-row{width:" + contentWidth + "px;height:" + this._rowHeight + "px;line-height:" + this._rowHeight + "px}";
                style += ".Datagrid-body{top:" + this._rowHeight + "px}";
                this.styleSheet.innerHTML = style;
            }
        }
    },

    _generateContent: {
        value: function () {
            var template,
                self,
                serializationObject,
                serialization,
                columnHeadersHtml,
                cellsHtml,
                html,
                headerId,
                cellId,
                descriptor,
                numberOfColumns,
                value,
                expression,
                bindingType,
                key,
                i;

            if (this.columnDescriptors) {
                serializationObject = this.ownerComponent._template._serialization._serializationObject;
                template = new Template;
                serialization = {};
                serialization[this.identifier + ":rowRepetition"] = {
                    prototype: "montage/ui/repetition.reel",
                    values: {
                        element: {"#": "rowRepetition"},
                        isSelectionEnabled: true,
                        visibleIndexes: [],
                        content: {"<-": "@" + this.identifier + ".content"}
                    }
                };
                serialization.row = {
                    prototype: "phront-data-editor/ui/datagrid/datagrid-row.reel",
                    values: {
                        element: {"#": "row"},
                        rowHeight: this._rowHeight,
                        index: {"<-": "@" + this.identifier + ":rowRepetition.visibleIndexes[@" + this.identifier + ":rowRepetition:iteration.index]"}
                    }
                };
                columnHeadersHtml = "";
                cellsHtml = "";
                numberOfColumns = this.columnDescriptors.length;
                for (i = 0; i < numberOfColumns; i++) {
                    descriptor = this.columnDescriptors[i];
                    headerId = "header" + (i + 1);
                    serialization[headerId] = {
                        prototype: descriptor.columnHeaderPrototype || this.defaultColumnHeaderPrototype,
                        values: {
                            element: {"#": headerId},
                            index: i,
                            width: descriptor.width || this._defaultColumnWidth,
                            datagrid: {"=": "@" + this.identifier},
                            columnDescriptor: {"=": "@" + this.identifier + ".columnDescriptors." + i}
                        }
                    };
                    columnHeadersHtml += "<div data-montage-id='" + headerId + "'></div>";
                    cellId = "cell" + (i + 1);
                    descriptor.cellValues.element = {"#": cellId};
                    descriptor.cellValues.datagrid = {"=": "@" + this.identifier};
                    descriptor.cellValues.columnIndex = i;
                    for (key in descriptor.cellValues) {
                        value = descriptor.cellValues[key];
                        if (typeof value === 'object') {
                            if (expression = value[bindingType = '<->'] || value[bindingType = '<-']) {
                                if (typeof expression === 'string') {
                                    value[bindingType] = expression.split("@" + this.identifier + ":row.").join("@" + this.identifier + ":rowRepetition:iteration.");
                                }
                            }
                        }
                    }
                    serialization[cellId] = {
                        prototype: descriptor.cellPrototype,
                        values: descriptor.cellValues
                    };
                    cellsHtml += "<div data-montage-id='" + cellId + "'></div>";
                }
                html = (
                    "<head>" +
                        "<script type='text/montage-serialization'>" +
                            JSON.stringify(serialization) +
                        "</script>" +
                    "</head>" +
                    "<body>" +
                        "<div class='Datagrid-header'>" +
                            "<div class='Datagrid-columnHeaders'>" +
                                columnHeadersHtml +
                            "</div>" +
                        "</div>" +
                        "<div class='Datagrid-body'>" +
                            "<div data-montage-id='rowRepetition' class='Datagrid-rowRepetition'>" +
                                "<div data-montage-id='row' class='Datagrid-row'>" +
                                    cellsHtml +
                                "</div>" +
                            "</div>" +
                        "</div>" +
                    "</body>"
                );
                this._element.innerHTML = '';
                self = this;
                template.initWithHtml(html, this.ownerComponent._template._require).then(function () {
                    var serialization = template.getSerialization(),
                        serializationObject = serialization.getSerializationObject(),
                        instances = {},
                        label;

                    for (label in self.ownerComponent.templateObjects) {
                        serializationObject[label] = {};
                        instances[label] = self.ownerComponent.templateObjects[label];
                    }
                    template.setObjects(serializationObject);
                    template.instantiateWithInstances(instances, self._element.ownerDocument).then(
                        function (part) {
                            var component,
                                i;

                            self.repetition = part.childComponents[0];
                            for (i = 0; i < part.childComponents.length; i++) {
                                component = part.childComponents[i];
                                self.addChildComponent(component);
                                component.needsDraw = true;
                            }
                            self._element.appendChild(part.fragment);
                            self._headerElement = self._element.firstChild;
                            self._columnHeadersElement = self._headerElement.firstChild;
                        }
                    );
                });
                this.updateStyle();
            }
        }
    }

});
