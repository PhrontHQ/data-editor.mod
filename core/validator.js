var Montage = require("montage/core/core").Montage;

var Validator = exports.Validator = Montage.specialize({

    constructor: {
        value: function Validator() {}
    },

    requiredRule: {value: null},
    validEmailRule: {value: null},
    validUrlRule: {value: null},
    minLengthRule: {value: null},
    maxLengthRule: {value: null},
    greaterThanRule: {value: null},
    lessThanRule: {value: null},
    numericRule: {value: null},
    integerRule: {value: null},
    _pattern: {value: null},
    isTrimmingBeforeValidation: {value: false},

    pattern: {
        get: function () {
            return this._pattern;
        },
        set: function (value) {
            if (this._pattern !== value) {
                this._pattern = value;
                if (value) {
                    this._patternRegExp = RegExp(value, "u");
                } else {
                    this._patternRegExp = undefined;
                }
            }
        }
    },

    validate: {
        value: function (value) {
            var match;

            if (this.isTrimmingBeforeValidation && typeof value === "string") {
                value = value.trim();
            }
            if (value === undefined || value === null || value === "") {
                return !this.requiredRule;
            }
            // Loose validation of email
            if (this.validEmailRule && !/.+@.+\..+/.test(value)) {
                return false;
            }
            // Loose validation of URL
            if (this.validUrlRule && !/.+:\/\/.+/.test(value)) {
                return false;
            }
            if (this.minLengthRule !== null && value.length < this.minLengthRule) {
                return false;
            }
            if (this.maxLengthRule !== null && value.length > this.maxLengthRule) {
                return false;
            }
            if (this.greaterThanRule !== null && parseFloat(value) <= this.greaterThanRule) {
                return false;
            }
            if (this.lessThanRule !== null && parseFloat(value) >= this.lessThanRule) {
                return false;
            }
            if (this.numericRule && !/^-?(\d+|\d+\.|\d*\.\d+)$/.test(value)) {
                return false;
            }
            if (this.integerRule && !/^-?\d+$/.test(value)) {
                return false;
            }
            if (this._pattern) {
                match = this._patternRegExp.exec(value);
                if (!match || match[0] !== value) {
                    return false;
                }
            }
            return true;
        }
    }

});


/*

var myValidator = new Validator;

console.assert(myValidator.validate(undefined), "Should be valid after creation");
console.assert(myValidator.validate(""), "Empty string value should be valid without required rule");
console.assert(myValidator.validate(null), "Null value should be valid without required rule");

myValidator.requiredRule = true;
console.assert(!myValidator.validate(undefined), "Undefined value should not be valid with required rule");
console.assert(!myValidator.validate(""), "Empty string value should not be valid with required rule");
console.assert(!myValidator.validate(null), "Null value should not be valid with required rule");

myValidator.validEmailRule = true;
console.assert(!myValidator.validate("foo"), "Valid email rule should not report false positives");
console.assert(myValidator.validate("javier.roman.c@gmail.com"), "Valid email rule should not report false negatives");
myValidator.validEmailRule = false;

myValidator.validUrlRule = true;
console.assert(!myValidator.validate("foo"), "Valid URL rule should not report false positives");
console.assert(myValidator.validate("http://www.romancortes.com"), "Valid URL rule should not report false negatives");
myValidator.validUrlRule = false;

myValidator.minLengthRule = 4;
console.assert(!myValidator.validate("foo"), "MinLength rule should not report false positives");
console.assert(myValidator.validate("foob"), "MinLength rule should not report false negatives");
myValidator.minLengthRule = null;

myValidator.maxLengthRule = 3;
console.assert(!myValidator.validate("foob"), "MaxLength rule should not report false positives");
console.assert(myValidator.validate("foo"), "MaxLength rule should not report false negatives");
myValidator.maxLengthRule = null;

myValidator.greaterThanRule = 3;
console.assert(!myValidator.validate("3"), "GreaterThan rule rule should not report false positives");
console.assert(myValidator.validate("4"), "GreaterThan rule should not report false negatives");
myValidator.greaterThanRule = null;

myValidator.lessThanRule = 3;
console.assert(!myValidator.validate("3"), "LessThan rule rule should not report false positives");
console.assert(myValidator.validate("2"), "LessThan rule should not report false negatives");
myValidator.lessThanRule = null;

myValidator.numericRule = true;
console.assert(!myValidator.validate("a"), "Numeric rule rule should not report false positives");
console.assert(!myValidator.validate("1a"), "Numeric rule rule should not report false positives");
console.assert(!myValidator.validate("-"), "Numeric rule rule should not report false positives");
console.assert(!myValidator.validate("-."), "Numeric rule rule should not report false positives");
console.assert(!myValidator.validate("."), "Numeric rule rule should not report false positives");
console.assert(!myValidator.validate("-0.0."), "Numeric rule rule should not report false positives");
console.assert(myValidator.validate("2"), "Numeric rule should not report false negatives");
console.assert(myValidator.validate("-2"), "Numeric rule should not report false negatives");
console.assert(myValidator.validate("-.2"), "Numeric rule should not report false negatives");
console.assert(myValidator.validate("4."), "Numeric rule should not report false negatives");
console.assert(myValidator.validate("-4.2"), "Numeric rule should not report false negatives");
console.assert(myValidator.validate("-1234.1234"), "Numeric rule should not report false negatives");
myValidator.numericRule = null;

myValidator.integerRule = true;
console.assert(!myValidator.validate("a"), "Integer rule should not report false positives");
console.assert(!myValidator.validate("1a"), "Integer rule should not report false positives");
console.assert(!myValidator.validate("-"), "Integer rule should not report false positives");
console.assert(!myValidator.validate("-."), "Integer rule should not report false positives");
console.assert(!myValidator.validate("."), "Integer rule should not report false positives");
console.assert(!myValidator.validate("-0.0."), "Integer rule should not report false positives");
console.assert(!myValidator.validate("-.2"), "Integer rule should not report false positives");
console.assert(!myValidator.validate("4."), "Integer rule should not report false positives");
console.assert(!myValidator.validate("-4.2"), "Integer rule should not report false positives");
console.assert(myValidator.validate("2"), "Integer rule should not report false negatives");
console.assert(myValidator.validate("-2"), "Integer rule should not report false negatives");
console.assert(myValidator.validate("-1234"), "Integer rule should not report false negatives");
console.assert(myValidator.validate(1234), "Integer rule should not report false negatives");
myValidator.integerRule = null;

myValidator.pattern = "foo|bar";
console.assert(!myValidator.validate("foobar"), "Pattern should not report false positives");
console.assert(myValidator.validate("foo"), "Pattern should not report false negatives");
console.assert(myValidator.validate("bar"), "Pattern should not report false negatives");
myValidator.pattern = null;

myValidator.integerRule = true;
console.assert(!myValidator.validate(" 1234 "), "Integer rule should not trim without isTrimmingBeforeValidation");
myValidator.isTrimmingBeforeValidation = true;
console.assert(myValidator.validate(" 1234 "), "isTrimmingBeforeValidation should work as expected");

*/
