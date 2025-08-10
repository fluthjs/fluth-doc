# Scenarios

`fluth` is suitable for reactive programming scenarios. Compared to reactive data, organizing code with streams offers the following advantages:

- Easier to build reactive logic, reducing business complexity
- More declarative programming style, greatly reducing code volume
- Easier to read code, with clear upstream and downstream relationships

![image](/structure.drawio.svg)

## Build Reactive Logic

For vue or react developers, reactive updates in the view improve efficiency significantly, but the reactive value in the logic layer is often underutilized.

In business logic, we often use watch (or useEffect) to listen to changes and then update logic accordingly. This approach has these problems:

- Poor semantics
- Unclear data flow
- Timing issues are hard to manage

So the scenarios are limited. With fluth's stream paradigm, you can build the entire logic reactively and improve productivity!

<!-- **A simple example:**

### Imperative Programming

Suppose there is a form page that uses data from module A, module B, and module C. The form binds to module A's data, and after clicking, calls module A's API, then calls module B and C's methods as shown below:

![image](/traditional-code.drawio.svg)

The `handleClick` method can be implemented in the component or in module A:

- You need to manually manage data changes and manually update subsequent logic. The coupling between the page and modules A, B, and C is high, and reusability is poor.

### Reactive Programming

With `fluth`'s stream reactive programming, you can build the entire logic reactively, as shown below:

![image](/stream-code.drawio.svg)

This approach has the following benefits:

- Reduces business complexity; the logic of modules A, B, and C is connected reactively, and the component does not bear heavy logic
- Dependency inversion: inject module A's stream into modules B and C -->
