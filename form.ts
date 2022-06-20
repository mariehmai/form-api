type FieldType =
  | PlainTextField
  | EmailTextField
  | BooleanField
  | SingleSelectField<unknown>
  | FileField;

type FieldValueType = FieldType['value'];

class Form {
  public formId: string;
  public fields: Field<FieldValueType>[] = [];

  constructor(public title: string, public description?: string) { }

  public addField(field: Field<FieldValueType>) {
    field.form = this;
    this.fields.push(field);
  }

  public addFieldAtIndex(index: number, field: Field<FieldValueType>) {
    field.form = this
    this.fields.splice(index, 0, field)
  }

  public validate() { this.fields.forEach(f => f.validate()); }

  public get isValid() { return this.fields.every(f => f.isValid); }
}

abstract class Field<TValue> {
  public fieldId: string;
  public form: Form;
  public value?: TValue;
  public errors: string[] = [];
  public conditionalField: FieldType;
  public conditionalValue: FieldValueType;

  constructor(public label: string, public required: boolean = false) { }

  public validate() {
    this.errors = [];

    if (this.required && !this.value) {
      this.errors.push('value cannot be empty');
    }
    if (this.value) {
      this.validateValue(this.value);
    }
  }

  public validateValue(value: TValue) { }

  public get isValid() { return this.errors.length === 0; }

  public addConditional(otherField: FieldType, conditionalValue: FieldValueType) {
    this.conditionalField = otherField;
    this.conditionalValue = conditionalValue;
  }

  public get visible() {
    if (!this.conditionalField) return true;

    return this.conditionalField.value === this.conditionalValue;
  }

  public get order() {
    return this.form.fields.indexOf(this)
  }
}

class PlainTextField extends Field<string> {
  public minLength?: number;
  public maxLength?: number;
  public regex?: RegExp;

  constructor(public label: string, public value?: string) {
    super(label);
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
}

class EmailTextField extends PlainTextField {
  constructor(public label: string, public value?: string) {
    super(label);
    this.regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  }
}

class BooleanField extends Field<boolean> {
  constructor(public label: string, public value: boolean = false) {
    super(label);
  }
}

class SingleSelectField<TOption> extends Field<TOption> {
  public selected?: TOption;

  constructor(public label: string, public options: TOption[], defaultSelected?: TOption) {
    super(label);
    this.selected = defaultSelected;
  }

  public validateValue(value: TOption) {
    if (!this.options.indexOf(value)) {
      this.errors.push("value not in allowed choices");
    }
  }
}

class FileField extends Field<File> {
  public maxSize?: number;
  public allowedExtensions: string[];
  public fileNameRegex?: RegExp;

  constructor(public label: string, public value?: File) {
    super(label);
  }

  public addAllowedExtension(type: string) {
    this.allowedExtensions.push(type);
  }

  public validateValue(value: File) {
    if (this.fileNameRegex && !value.name.match(this.fileNameRegex)) {
      this.errors.push(`invalid file name`);
    }
    if (this.maxSize && value.size > this.maxSize) {
      this.errors.push(`file size must not exceeds ${this.maxSize} bytes`);
    }
  }
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
