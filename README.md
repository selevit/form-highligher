FormHL
===============

JS tool for highlighing errors at web forms

## Example of usage

```javascript

/* Highlighter initializing */
var hl = new FormHL();

/**
* FormHL settings
*/
hl.init({
    inputStateClassName: "b-form__block",
    invalidClassName: "b-form_error",
    mainMessageClassName: "b-form__main_error",
    inputMessageClassName: "b-form__help"
});

// show errors on the form
var errors = {
    "email": "Incorrect email",
    "subject": "Required field",
    "0": "Non-field error 1",
    "1": "Non-field error 2"
};

var form = document.querySelector('#email-form');
hl.highlight(form, errors);
```
