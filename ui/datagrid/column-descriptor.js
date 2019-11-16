var Montage = require("montage").Montage,
    DataOrdering = require("montage/data/model/data-ordering").DataOrdering;

exports.ColumnDescriptor = Montage.specialize({

    constructor: {
        value: function ColumnDescriptor() {}
    },

    cellValues: {
        get: function () {
            return this._cellValues;
        },
        set: function (cellValues) {
            var key,
                value,
                bindingSource,
                bindingParts,
                orderingPath,
                ordering;

            this._cellValues = cellValues;
            if (typeof cellValues === "object" && this.ordering === undefined) {
                for (key in cellValues) {
                    value = cellValues[key];
                    if (typeof value === "object" && (bindingSource = value["<-"] || value["<->"])) {
                        if (typeof bindingSource === "string") {
                            bindingParts = bindingSource.split(":row.object.");
                            if (orderingPath = bindingParts[1]) {
                                ordering = new DataOrdering;
                                ordering.expression = orderingPath;
                                this.ordering = ordering;
                            }
                        }
                    }
                }
            }
        }
    }

});
