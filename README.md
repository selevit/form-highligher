Form-highligher
===============

JS tool for showing errors at web forms

## Example of usage

```javascript
/* Highligher initializing */
/**
* FormHighligher settings
*/
var hlOptions = {
 inputStateSelector: ".b-form__block",
 invalidClassName: "b-form_error",
 validClassName: "b-form_valid",
 mainMessageClassName: "b-form__main_error",
 inputMessageClassName: "b-form__error-label_input"
};
var highligher = new FormHighligher();
highligher.init(hlOptions);

var errors = {
    "email": "Incorrect email"<
    "subject": "Required field",
    "0": "Non-field error 1",
    "1": "Non-field error 2"
};
var form = $('#email-form');
highligher.highlight(form, errors);
```
