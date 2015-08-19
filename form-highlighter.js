/*global window, document, Error, Object */

(function (exports) {
    'use strict';

    var FormHighlighter = function () {
        this.inputStateClassName = null;
        this.inputMessageClassName = null;
        this.mainMessageClassName = null;
        this.invalidClassName = null;
        this.commonErrorSeparator = '<br>';
    };

    /**
     * Initialize form highlighter object
     *
     * @param {object} options Parameters of highlighter
     */
    FormHighlighter.prototype.init = function(options) {
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
     * @param {Element|string} form Form selector or DOM Element
     */
    FormHighlighter.prototype.clearForm = function(form) {

        var inputMessageBlock, mainMessageBlock;

        if (!(form instanceof Element)) {
            form = document.querySelector(form);
        }

        if (!this.invalidClassName) {
            throw new Error("invalid class is not specified");
        }

        if (this.inputStateClassName) {
            var state = form.querySelector(this.inputStateClassName);
            if (state) {
                state.classList.remove(this.invalidClassName);
            }
        }

        if (this.inputMessageClassName) {
            inputMessageBlock = form.querySelector(
                '.' + this.inputMessageClassName
            );
            if (inputMessageBlock) {
                inputMessageBlock.innerHTML = '';
                if (inputMessageBlock.style.display !== 'none') {
                    inputMessageBlock.style.displey = 'none';
                }
            }
        }

        if (!this.mainMessageClassName) {
            mainMessageBlock = form.querySelector(
                '.' + this.mainMessageClassName
            );
            if (mainMessageBlock) {
                mainMessageBlock.innerHTML = '';
                if (mainMessageBlock.style.display !== 'none') {
                    mainMessageBlock.style.displey = 'none';
                }
            }
        }
    };

    /**
     * Highlight form field errors
     *
     * @param {string|Element} form Selector or DOM element of the form
     * @param string inputName Field name ("name" attribute)
     * @param string errorText Text of the field error
     */
    FormHighlighter.prototype.highlightInput = function(form, inputName, errorText) {

        var input, inputStateBlock, inputMessageBlock;

        if (!(form instanceof Element)) {
            form = document.querySelector(form);
        }

        input = form.elements[inputName];
        if (!input) {
            throw new Error('form has no input with name: ' + inputName);
        }

        if (!this.inputStateClassName) {
            throw new Error('inputStateClassName is not specified');
        }

        // Find element to add input state class
        var el;
        do {
            el = input.parentNode;
        } while (el.tagName !== 'form' && !el.classList.contains(this.inputStateClassName)); // class
        if (!el) {
            throw new Error(
                'input has no parent element with selector: ' +
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
        if (!inputStateBlock.classList.contains(this.invalidClassName)) {
            inputStateBlock.classList.add(this.invalidClassName);
        }
    };

    /**
     * Show common errors of the form
     *
     * @param {string|Element} form Selector or DOM element of form
     * @param {Array} errors list of common (non-field) errors
     */
    FormHighlighter.prototype.showCommonErrors = function (form, errors) {
        var mainMessageBlock;

        if (!(form instanceof Element)) {
            form = document.querySelector(form);
        }
        if (Object.prototype.toString.call(errors) !== '[object Array]') {
            throw new Error('errors must be an array');
        }
        if (errors.length === 0) {
            return;
        }

        mainMessageBlock = form.querySelector('.' + this.mainMessageClassName);
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
     * @param {string|Element} form Selefctor of form or DOM element
     * @param {object} errors List of field errors
     */
    FormHighlighter.prototype.highlight = function(form, errors) {
        if (!(form instanceof Element)) {
            form = document.querySelector(form);
        }
        this.clearForm(form);
        if (typeof errors !== 'object' || errors.constructor !== Object) {
            throw new Error('errors must be plain object');
        }

        var commonErrors = [], counter = 0;

        for (var key in errors) {
            if (errors.hasOwnProperty(key)) {
                if (!isNaN(Number(key))) {
                    commonErrors.push(errors[key]);
                } else {
                    this.highlightInput(form, key, errors[key]);
                }
                if (counter === 0) {
                    // focus on first error field
                    form.elements[key].focus();
                }
                counter += 1;
            }
        }

        this.showCommonErrors(form, commonErrors);
    };

    exports.FormHighlighter = FormHighlighter;

}(window));
