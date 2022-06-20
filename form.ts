type FieldType =
  | PlainTextField
  | EmailTextField
  | BooleanField
  | SingleSelectField<unknown>
  | FileField;

type FieldValueType = FieldType['value'];

class Form {
  private _formId: string;
  private _fields: Field<FieldValueType>[] = [];

  constructor(public title: string, public description?: string) { }

  public addField(field: Field<FieldValueType>) {
    field.form = this;
    this._fields.push(field);
  }

  public addFieldAtIndex(index: number, field: Field<FieldValueType>) {
    field.form = this
    this._fields.splice(index, 0, field)
  }

  public validate() { this._fields.forEach(f => f.validate()); }

  public get isValid() { return this._fields.every(f => f.isValid); }

  public get formId() { return this._formId; }

  public get fields() { return this._fields; }
}

abstract class Field<TValue> {
  private _fieldId: string;
  private _form: Form;
  public errors: string[] = [];
  private _conditionalField: FieldType;
  private _conditionalValue: FieldValueType;

  constructor(private _label: string, private _value?: TValue, private _required: boolean = false) { }

  public validate() {
    this.errors = [];

    if (this._required && !this.value) {
      this.errors.push('value cannot be empty');
    }
    if (this.value) {
      this.validateValue(this.value);
    }
  }

  public validateValue(value: TValue) { }

  public get isValid() { return this.errors.length === 0; }

  public addConditional(otherField: FieldType, conditionalValue: FieldValueType) {
    this._conditionalField = otherField;
    this._conditionalValue = conditionalValue;
  }

  public get visible() {
    if (!this.conditionalField) return true;

    return this.conditionalField.value === this._conditionalValue;
  }

  public get order() {
    return this._form.fields.indexOf(this)
  }

  public get form() { return this._form; }
  public set form(form: Form) { this._form = form; }

  public get label() { return this._label; }
  public set label(label: string) { this._label = label; }

  public get value() { return this._value; }
  public set value(value: TValue | undefined) { this._value = value; }

  public get required() { return this._required; }
  public set required(required: boolean) { this._required = required; }

  public get conditionalField() { return this._conditionalField; }
  public set conditionalField(field: FieldType) { this._conditionalField = field; }

  public get conditionalValue() { return this._conditionalValue; }
  public set conditionalValue(value: FieldValueType) { this._conditionalValue = value; }
}

class PlainTextField extends Field<string> {
  private _minLength?: number;
  private _maxLength?: number;

  constructor(label: string, value?: string, private _regex?: RegExp) {
    super(label, value);
  }

  public validateValue(value: string) {
    if (this.minLength && value.length < this.minLength) {
      this.errors.push(`value must be at least ${this.minLength} characters`);
    }
    if (this.maxLength && value.length > this.maxLength) {
      this.errors.push(`value must be at most ${this.maxLength} characters`);
    }
    if (this.regex && !value.match(this.regex)) {
      this.errors.push("invalid format");
    }
  }

  public get minLength() { return this._minLength; }
  public set minLength(length: number | undefined) { this._minLength = length; }

  public get maxLength() { return this._maxLength; }
  public set maxLength(length: number | undefined) { this._maxLength = length; }

  public get regex() { return this._regex; }
  public set setRegex(regex: RegExp) { this._regex = regex; }
}

class EmailTextField extends PlainTextField {
  constructor(label: string, value?: string) {
    const emailRegExp = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
    super(label, value, emailRegExp);
  }
}

class BooleanField extends Field<boolean> {
  constructor(label: string, value: boolean = false) {
    super(label, value);
  }
}

class SingleSelectField<TOption> extends Field<TOption> {
  private _selected?: TOption;

  constructor(label: string, private _options: TOption[], defaultSelected?: TOption) {
    super(label);
    this._selected = defaultSelected;
  }

  public validateValue(value: TOption) {
    if (!this._options.indexOf(value)) {
      this.errors.push("value not in allowed choices");
    }
  }

  public get options() { return this._options; }
  public set options(options: TOption[]) { this._options = options; }

  public get selected() { return this._options; }
  public set setSelected(option: TOption) { this._selected = option; }
}

class FileField extends Field<File> {
  private _maxSize?: number;
  private _allowedExtensions: string[];
  private _fileNameRegex?: RegExp;

  constructor(label: string, value?: File) {
    super(label, value);
  }

  public addAllowedExtension(type: string) {
    this._allowedExtensions.push(type);
  }

  public validateValue(value: File) {
    if (this._fileNameRegex && !value.name.match(this._fileNameRegex)) {
      this.errors.push(`invalid file name`);
    }
    if (this._maxSize && value.size > this._maxSize) {
      this.errors.push(`file size must not exceeds ${this._maxSize} bytes`);
    }
  }

  public get maxSize() { return this._maxSize; }
  public set maxSize(size: number | undefined) { this._maxSize = size; }

  public get allowedExtensions() { return this._allowedExtensions; }
  public set allowedExtensions(extensions: string[]) { this._allowedExtensions = extensions; }

  public get fileNameRegex() { return this._fileNameRegex; }
  public set fileNameRegex(regex: RegExp | undefined) { this._fileNameRegex = regex; }
}

const plainText = new PlainTextField("How long did this take?");
const emailText = new EmailTextField("Enter your email", "email@example.com");
const booleanField = new BooleanField("Do you like TypeScript?", true);
const selectField = new SingleSelectField("How much do you know about TS?", ["basic", "intermediate", "advanced"]);
const fileField = new FileField("Select a picture of yours");

const form = new Form("Form API prototype");
form.addField(plainText);
form.addField(emailText);
form.addField(booleanField);
form.addField(selectField);
// Will be after email field
form.addFieldAtIndex(2, fileField);

console.log("Without conditional, the field is visible by default", selectField.visible) // true
selectField.addConditional(booleanField, false)
console.log("With a conditional field not matching the value, the field is not visible", selectField.visible) // false
