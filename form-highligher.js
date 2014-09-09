/*global jQuery, document, console, Error */

(function (g, $) {
"use strict";

var FormHighligher = function () {
  this.inputStateSelector = null;
  this.inputMessageClassName = null;
  this.invalidClassName = null;
  this.mainMessageClassName = null;
};

/**
 * Инициализировать объект хайлайтера форм
 * @param object options параметры хайлайтера
 */
FormHighligher.prototype.init = function(options)
{
  if (!$.isPlainObject(options))
    throw new Error("options must be object");
  var _this = this;
  $.each(options, function (name) {
      if (!_this.hasOwnProperty(name))
        throw new Error("unknown property: " + name);
      _this[name] = options[name];
  });
};

/**
 * Очистить форму от ошибок
 * @param string|object form селектор или объект формы
 */
FormHighligher.prototype.clearForm = function(form)
{
  var $form = $(form), $inputMessageBlock, $mainMessageBlock;

  if (!this.invalidClassName)
    throw new Error("invalid class is not specified");
  if (this.inputStateSelector)
    $form.find(this.inputStateSelector).removeClass(this.invalidClassName);
  if (this.inputMessageClassName) {
    $inputMessageBlock = $form.find('.' + this.inputMessageClassName);
    $inputMessageBlock.html("");
    if ($inputMessageBlock.is(":visible"))
      $inputMessageBlock.hide();
  }
  if (this.mainMessageClassName) {
    $mainMessageBlock = $form.find('.' + this.mainMessageClassName);
    if ($mainMessageBlock.length) {
      $mainMessageBlock.html("");
      if ($mainMessageBlock.is(":visible"))
        $mainMessageBlock.hide();
    }
  }
};

/**
 * Подстветить ошибки поля формы
 * @param string|object form селектор или объект формы
 * @param string inputName имя поля (атрибут name)
 * @param string errorText текст ошибки
 */
FormHighligher.prototype.highlightInput = function(form, inputName,
  errorText)
{
  var $form = $(form), $input, $inputStateBlock, $inputMessageBlock, inputMessageBlock;

  $input = $form.find('[name="' + inputName + '"]');
  if (!$input.length)
    throw new Error('form has no input with name: ' + inputName);

  // Найти элемент, в который добавляется класс состояния поля
  if (this.inputStateSelector) {
    $inputStateBlock = $input.parentsUntil("form", this.inputStateSelector);
    if (!$inputStateBlock || !$inputStateBlock.length)
      throw new Error(
        "input has no parent element with selector: " +
        this.inputStateSelector);
  } else {
    // Если селектор индикатора валидности не указан, то используется
    // само поле для добавления класса
    throw new Error("inputStateSelector is not specified");
  }
  if (!this.invalidClassName)
    throw new Error("invalid class is not specified");

  // Вывести текст ошибки
  if (errorText && errorText.length) {
    $inputMessageBlock = $inputStateBlock.find(
      '.' + this.inputMessageClassName);
    if (!$inputMessageBlock || !$inputMessageBlock.length) {
      inputMessageBlock = document.createElement("div");
      inputMessageBlock.className = this.inputMessageClassName;
      $inputStateBlock.append(inputMessageBlock);
      $inputMessageBlock = $(inputMessageBlock);
    }
    if ($inputMessageBlock.is(":hidden"))
      $inputMessageBlock.show();
    $inputMessageBlock.html(errorText);
  }

  // Добавить класс ошибки
  if (!$inputStateBlock.hasClass(this.invalidClassName))
    $inputStateBlock.addClass(this.invalidClassName);
};

/**
 * Показать общие ошибки формы
 * @param string|object form селектор или объект формы
 * @param Array errors список ошибок
 */
FormHighligher.prototype.showCommonErrors = function (form, errors)
{
  var $form = $(form), mainMessageBlock;
  if (!$.isArray(errors))
    throw new Error("errors must be array");
  if (errors.length === 0)
    return;
  var $mainMessageBlock = $form.find('.' + this.mainMessageClassName);
  if (!$mainMessageBlock.length) {
    console.warn(
      "mainMessageBlock is not found. Creating it at end of the form");
    mainMessageBlock = document.createElement('div');
    mainMessageBlock.className = this.mainMessageClassName;
    $mainMessageBlock = $(mainMessageBlock);
    $form.append(mainMessageBlock);
  }
  var html = errors.join('<br>');
  $mainMessageBlock.html(html);
  if ($mainMessageBlock.is(":hidden"))
    $mainMessageBlock.show();
};

/**
 * Подстветить ошибки в форме
 * @param string|object form  объект формы или селектор
 * @param object errors ошибки, которые пришли в ответе от сервера
 */
FormHighligher.prototype.highlight = function(form, errors)
{
  var $form = $(form);
  this.clearForm($form);
  if (!$.isPlainObject(errors))
    throw new Error("errors must be plain object");
  if ($.isEmptyObject(errors))
    return;
  var _this = this, commonErrors = [], cnt = 0;
  $.each(errors, function (inputName, errorText) {
    if (!isNaN(Number(inputName))) {
      commonErrors.push(errorText);
    } else {
      _this.highlightInput($form, inputName, errorText);
      if (cnt === 0)
        $form[0][inputName].focus();
      cnt++;
    }
  });
  this.showCommonErrors($form, commonErrors);
};

g.FormHighligher = FormHighligher;

})(this, jQuery);
