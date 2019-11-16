var Component = require("montage/ui/component").Component;
var RangeController = require("montage/core/range-controller").RangeController;

exports.Main = Component.specialize({

    constructor: {
        value: function Main() {}
    },

    enterDocument: {
        value: function (isFirstTime) {
            if (isFirstTime) {
                var content = [],
                    q = 0,
                    words = ["Javier", "Benoit", "Tomoe", "John", "Foo", "Alice", "Matt", "Etiama", "Rose", "Francisco", "Roman", "Cortes", "Okawa", "Sony", "Phront", "Bird", "Bar", "Ok", "Loremipsumlong", "Pinnapleman", "Datagridtest"],
                    i;

                for (i = 0; i < 100000; i++) {
                    content[i] = {
                        "name": words[Math.random() * words.length | 0] + " " + words[Math.random() * words.length | 0],
                        "age": Math.random() * 120 | 0,
                        "index": i + 1,
                        "images": [],
                        "objects": [],
                        "isFoo": Math.random() > .5
                    };
                    var length = (Math.random() * 5 | 0) + 1;
                    for (j = 0; j < length; j++) {
                        content[i].images.push({
                            foobar: {
                                originalSrc: "assets/tmp/photo" + (q++ % 31 + 1) + ".jpg?q=" + Math.random()
                            }
                        });
                    }
                    length = (Math.random() ** 2 * 4 | 0);
                    for (j = 0; j < length; j++) {
                        content[i].objects.push({
                            objectName: words[Math.random() * words.length | 0]
                        });
                    }
                }
                this.datagrid.content = content;
            }
        }
    }

});
