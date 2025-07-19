# Application Scenarios

`fluth` is suitable for reactive programming scenarios. Compared to reactive data, organizing code with streams offers the following advantages:

- Easier to build reactive logic, reducing business complexity
- More declarative programming style, greatly reducing code volume
- Easier to read code, with clear upstream and downstream relationships

![image](/structure.drawio.svg)

## Building Reactive Logic

For developers using `vue` or `react`, using reactive data to trigger view updates greatly improves development efficiency. However, in the logic layer, the reactive nature of data is often underutilized.

In business logic, reactive data is usually monitored with `watch` (or `useEffect`) to listen for changes, and then logic updates are triggered by data changes. But this approach has the following problems:

- Poor semantics
- Unclear data flow
- Timing issues are hard to manage

So its application scenarios are limited. But with `fluth`'s stream programming paradigm, you can build the entire logic in a reactive way, thus achieving improved development efficiency!

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
