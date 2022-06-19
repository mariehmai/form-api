type Field = PlainTextField

class Form {
  public formId: string;
  public fields: Field[];

  constructor(public title: string, public description?: string) {}

  public addField(field: Field) {
    field.form = this;
    this.fields.push(field);
  }
}

class BaseField {
  public fieldId: string;
  public form: Form;

  constructor(public label: string) {}
}

class PlainTextField extends BaseField {
  public minLength?: number;
  public maxLength?: number;
  public required: boolean;
  public errors: string[];

  constructor(public label, public value?: string) {
    super(label)
  }

  public validate() {
    if (this.required && !this.value) {
      this.errors.push('value cannot be empty')
    }

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
