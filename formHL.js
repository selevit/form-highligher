
/*global window, document, Error, Object, NodeList, Array */

(function (exports) {
    'use strict';

    var FormHL = function () {
        this.inputStateClassName = null;
        this.inputMessageClassName = null;
        this.mainMessageClassName = null;
        this.invalidClassName = null;
        this.commonErrorSeparator = '<br>';
    };

    if (!Array.prototype.indexOf) {
        // IE8 indexOf support
        Array.prototype.indexOf = function(elt /*, from*/) {
            var len = this.length >>> 0,
              from = Number(arguments[1]) || 0;
            if (from < 0) {
                from = Math.ceil(from)
            } else {
                from = Math.floor(from);
            }
            if (from < 0) {
                from += len;
            }
            for (; from < len; from++) {
                if (from in this && this[from] === elt) {
                    return from;
                }
            }
            return -1;
        };
    }

    /**
     * Initialize form highlighter object
     *
     * @param {object} options Parameters of highlighter
     */
    FormHL.prototype.init = function(options) {
        if (typeof options === 'object' && options.constructor === Object) {
            for (var key in options) {
                if (options.hasOwnProperty(key)) {
                    if (!this.hasOwnProperty(key)) {
                        throw new Error("unknown property: " + key);
                    }
                    this[key] = options[key];
                }
            }
        } else {
            throw new Error("options must be object");
        }
    };

    /**
     * Remove all errors from form
     *
     * @param {Element} form DOM element of form
     */
    FormHL.prototype.clearForm = function(form) {
        var inputMessageBlocks, inputMessageBlock, mainMessageBlocks,
            mainMessageBlock;

        if (!(form instanceof Element)) {
            throw new Error('form must be instance of Element');
        }
        if (!this.invalidClassName) {
            throw new Error("invalid class is not specified");
        }

        if (this.inputStateClassName) {
            var states = form.querySelectorAll('.' + this.inputStateClassName),
                classList, index, state;
            for (var i = 0; i < states.length; i++) {
                state = states[i];
                classList = state.className.split(/\s/);
                index = classList.indexOf(this.invalidClassName);
                if (index !== -1) {
                    classList.pop(index);
                    state.className = classList.join(' ');
                }
            }
        }

        if (this.inputMessageClassName) {
            inputMessageBlocks = form.querySelectorAll(
                '.' + this.inputMessageClassName
            );
            for (var i = 0; i < inputMessageBlocks.length; i++) {
                inputMessageBlock = inputMessageBlocks[i];
                inputMessageBlock.innerHTML = '';
                if (inputMessageBlock.style.display !== 'none') {
                    inputMessageBlock.style.display = 'none';
                }
            }
        }

        if (this.mainMessageClassName) {
            mainMessageBlocks = form.querySelectorAll(
                '.' + this.mainMessageClassName
            );
            for (var i = 0; i < mainMessageBlocks.length; i++) {
                mainMessageBlock = mainMessageBlocks[i];
                mainMessageBlock.innerHTML = '';
                if (mainMessageBlock.style.display !== 'none') {
                    mainMessageBlock.style.display = 'none';
                }
            }
        }
    };

    /**
     * Highlight form field errors
     *
     * @param {Element} form DOM element of form
     * @param string inputName Field name ("name" attribute)
     * @param string errorText Text of the field error
     */
    FormHL.prototype.highlightInput = function(form, inputName, errorText) {
        var input, inputStateBlock, inputMessageBlock;
        if (!(form instanceof Element)) {
            throw new Error('form must be instance of Element');
        }
        input = form.elements[inputName];
        if (!input) {
            throw new Error('form has no input with name: ' + inputName);
        } else if (input instanceof NodeList) {
            // radio inputs
            input = input[0];
        }
        if (!this.inputStateClassName) {
            throw new Error('inputStateClassName is not specified');
        }
        // Find element to add input state class
        var el = input, classList;

        do {
            el = el.parentNode;
            if (el) {
                classList = el.className.split(/\s/);
            }
        } while (el && el.tagName !== 'FORM' && classList.indexOf(this.inputStateClassName) === -1);

        if (!el) {
            throw new Error(
                'input has no parent element with class: ' +
                this.inputStateClassName
            );
        }
        inputStateBlock = el;

        if (!this.invalidClassName) {
            throw new Error('invalid class is not specified');
        }

        // Show error
        if (errorText) {
            inputMessageBlock = inputStateBlock.querySelector(
                '.' + this.inputMessageClassName
            );
            if (!inputMessageBlock) {
                inputMessageBlock = document.createElement("div");
                inputMessageBlock.className = this.inputMessageClassName;
                inputStateBlock.appendChild(inputMessageBlock);
            }
            inputMessageBlock.innerHTML = errorText;
            if (inputMessageBlock.style.display === 'none') {
                inputMessageBlock.style.display = ''; // default style
            }
        }

        // Add error class
        classList = inputStateBlock.className.split(/\s/);
        if (classList.indexOf(this.invalidClassName) === -1) {
            classList.push(this.invalidClassName);
            inputStateBlock.className = classList.join(' ');
        }
    };

    /**
     * Show common errors of the form
     *
     * @param {Element} form DOM element of form
     * @param {Array} errors List of common (non-field) errors
     */
    FormHL.prototype.showCommonErrors = function (form, errors) {
        if (!(form instanceof Element)) {
            throw new Error('form must be instance of Element');
        }
        if (Object.prototype.toString.call(errors) !== '[object Array]') {
            throw new Error('errors must be an array');
        }
        if (errors.length === 0) {
            return;
        }

        var mainMessageBlock = form.querySelector(
            '.' + this.mainMessageClassName
        );
        if (!mainMessageBlock) {
            mainMessageBlock = document.createElement('div');
            mainMessageBlock.className = this.mainMessageClassName;
            form.appendChild(mainMessageBlock);
        }

        mainMessageBlock.innerHTML = errors.join(this.commonErrorSeparator);
        if (mainMessageBlock.style.display === 'none') {
            mainMessageBlock.style.display = ''; // default style
        }
    };

    /**
     * Highlight field errors in form
     *
     * @param {Element} form DOM element of form
     * @param {object} errors List of field errors
     */
    FormHL.prototype.highlight = function(form, errors) {
        if (!(form instanceof Element)) {
            throw new Error('form must be instance of Element');
        }
        if (typeof errors !== 'object' || errors.constructor !== Object) {
            throw new Error('errors must be plain object');
        }

        var commonErrors = [], fieldErrorCounter = 0;
        this.clearForm(form);

        for (var key in errors) {
            if (errors.hasOwnProperty(key)) {
                if (!isNaN(Number(key))) {
                    commonErrors.push(errors[key]);
                } else {
                    this.highlightInput(form, key, errors[key]);
                    if (fieldErrorCounter === 0) {
                        // focus on first error field
                        if (form.elements[key].focus !== undefined) {
                            // element is focusable
                            form.elements[key].focus();
                        }
                    }
                    fieldErrorCounter += 1;
                }
            }
        }

        this.showCommonErrors(form, commonErrors);
    };

    exports.FormHL = FormHL;

}(window));
