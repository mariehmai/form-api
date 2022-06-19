type Field = PlainTextField | EmailTextField

class Form {
  public formId: string;
  public fields: Field[];

  constructor(public title: string, public description?: string) {}

  public addField(field: Field) {
    field.form = this;
    this.fields.push(field);
  }
}

class BaseField<TValue> {
  public fieldId: string;
  public form: Form;
  public value?: TValue;
  public errors: string[];

  constructor(public label: string, public required: boolean = false) {}

  public validate() {
    if (this.required && !this.value) {
      this.errors.push('value cannot be empty')
    }
  }
}

class PlainTextField extends BaseField<string> {
  public minLength?: number;
  public maxLength?: number;

  constructor(public label, public value?: string) {
    super(label)
  }

  public validate() {
    this.validate();

    if (!this.value) {
      return
    }

    if (this.minLength && this.value.length < this.minLength ) {
      this.errors.push(`value must be at least ${this.minLength} characters`)
    }

    if (this.maxLength && this.value.length > this.maxLength ) {
      this.errors.push(`value must be at most ${this.maxLength} characters`)
    }
  }
}

class EmailTextField extends BaseField<string> {
  public regex?: RegExp;

  constructor(public label, public value?: string) {
    super(label)
    this.regex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
  }

  public validate() {
    this.validate();

    if (!this.value) {
      return
    }

    if (this.regex && !this.value.match(this.regex)) {
      this.errors.push("invalid format")
    }
  }
}
