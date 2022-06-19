# Form API prototype

## Run playground

```bash
tsc form.ts --target ES2016 && node form.js
```

## Most critical design decisions

- Specific typed fields inheritance from a base `Field` class. This allows to group common properties and logic. For instance, the validation of a required field is likely to be similar for any type of fields.
- Field validation at the form level and at the field level.
- Form fields addition at specific index and getting ordering via `order` getter.
- Field visibility depending on conditional.

## Future considerations

- Abstraction of `Field` as an interface.
- The conditional field could be a class implementing `Field` and composed with a "base" field, a "conditional" field.
- Addition of methods to remove fields from form.
