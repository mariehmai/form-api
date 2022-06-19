

class Form {
  public formId: string;
  public fields: Field[];

  constructor(public title: string, public description?: string) {}

  public addField(field: Field) {
    this.fields.push(field)
  }
}

class Field {
  public fieldId: string;
}
