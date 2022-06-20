# Form API prototype

## Run playground

```bash
tsc form.ts --target ES2016 && node form.js
```

## Most critical design decisions

### Object-oriented design

The prototyping of a form could follow different designs. I went with OO mainly as I saw some use case of inheritance, encapsulation, a good way to structure the form and field objects, and to hold some state.

After designing a few specific typed field, plain text, email text, some common properties started to be recurring and an abstraction could be extracted: the `Field` abstract class, which aim wouldn't be to be instantiated, instead the typed field would inherit from it. Having is abstract also allows to have some common logic extracted to it (see [validation](#form-and-field-validation)).

### Fields ordering within the form

When thinking of a form, a good to have is the ability to reorder/insert fields at specific index, so it adds some flexibility in building the form: `addFieldAtIndex` at the form level allows to do so, and the `order` getter at the field level indicates the order of the field within the form.

### Form and field validation

To make the product close to functional, form validation is a critical requirement. To make it happen, I grouped the common validation logic (e.g. `required` field) into the `Field.validate` method and then called `Field.validateValue`, that each class that extends `Field` can override.

### Conditional field and visibility

To handle the constraint of the conditional field and its visibility, I followed the path of adding 2 properties to the abstract `Field` class, so that any field extending that class could have the ability to add the conditional whenever needed.

**Note**: A limitation to that approach is the need to handle some extra logic like `if (!this.conditionalField) return true;`. This seems to be a good candidate for enhancement (see [abstraction of field](#abstraction-of-field-as-an-interface-to-separate-concerns))

## Limitations and considerations

### Abstraction of `Field` as an interface to separate concerns

At the moment `Field` is an abstract class, containing the common properties and method and logic (validation of `required` field). We could have instead `Field` as an interface, unaware of the implementation details.

- For the validation, the interface would define a `validate(): string[]` contract that each of the classes would have to implement could be a better solution, instead of the current overriding happening with `validateValue()`.
- We could also have two classes implementing that `Field` interface: 1. a `ConditionalField` would be composed with a "base" field, a "conditional" field and its value, 2. a `BaseField` that would have the common properties and methods and all the `FieldType` would extends `BaseField`. This way, we separate the concern of conditional field and visibility into separate entities.

### Missing interactions

This prototype implements the main interactions to be able to send a form with a set of fields, however we can think of missing important interaction to make it really functional:

- Some methods to update the form: remove a field, reset the form values, update a field value.

### Approach with functional design

Another approach to this challenge could be using functional design instead of object oriented. The implication would be:

- Mostly use of `types` instead of `classes`, and declaring typed objects.
- The interactions (add, remove field to form, etc.) would be only via functions.
- The fields validation would be chained functions (validate required, length, regex, etc.) returning an array of errors.
