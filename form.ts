type Field =
  | PlainTextField
  | EmailTextField
  | BooleanField
  | SingleSelectField<unknown>
  | FileField

class Form {
  public formId: string;
  public fields: Field[];

  constructor(public title: string, public description?: string) { }

  public addField(field: Field) {
    field.form = this;
    this.fields.push(field);
  }

  public validate() { this.fields.forEach(f => f.validate()); }

  public get isValid() { return this.fields.every(f => f.isValid); }
}

class BaseField<TValue> {
  public fieldId: string;
  public form: Form;
  public value?: TValue;
  public errors: string[];
  public conditionalField: Field;
  public conditionalValue: Field['value'];

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

  public addConditional(otherField: Field, conditionalValue: Field['value']) {
    this.conditionalField = otherField;
    this.conditionalValue = conditionalValue;
  }

  public get visible() {
    return this.conditionalField.value === this.conditionalValue;
  }
}

class PlainTextField extends BaseField<string> {
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

class BooleanField extends BaseField<boolean> {
  constructor(public label: string, public value: boolean = false) {
    super(label);
  }
}

class SingleSelectField<TOption> extends BaseField<TOption> {
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

class FileField extends BaseField<File> {
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
