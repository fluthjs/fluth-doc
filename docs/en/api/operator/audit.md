# audit

A trigger-based data auditing operator that emits the latest resolved value from the source stream only when the trigger is activated.

## Type Definition

```typescript
type audit = <T>(trigger$: Stream | Observable, shouldAwait?: boolean) => (observable$: Observable<T>) => Observable<T>;
```

## Parameters

- `trigger$` (Stream | Observable): The trigger stream that activates the audit operator to emit the latest resolved value from the source stream
- `shouldAwait` (boolean, optional): Whether to wait for the source stream's pending state to resolve, defaults to `true`

## Return Value

Returns a new Observable that emits the latest resolved value from the source stream only when the trigger is activated.

## Details

Core behaviors of the `audit` operator:

- **Trigger mechanism**: Only emits the source stream's current value when the trigger stream emits a value
- **Value filtering**: Only emits resolved values, ignoring rejected Promises
- **Latest value priority**: If the source stream emits multiple values quickly, only the latest resolved value is emitted
- **Await mechanism**: When `shouldAwait` is `true`, waits for pending state resolution before emitting

## Usage Scenarios

### Scenario 1: Basic Trigger Emission

```typescript
import { $, audit } from "fluth";

const source$ = $();
const trigger$ = $();

const audited$ = source$.pipe(audit(trigger$));

audited$.then((value) => {
  console.log("audited:", value);
});

// Set source stream values, but won't emit immediately
source$.next(1);
source$.next(2);
source$.next(3);

// Only emits latest value when trigger is activated
trigger$.next("trigger"); // Output: audited: 3
```

### Scenario 2: Handling Rapidly Changing Data

```typescript
import { $, audit } from "fluth";

const searchInput$ = $();
const searchTrigger$ = $();

const searchResults$ = searchInput$.pipe(audit(searchTrigger$));

searchResults$.then((keyword) => {
  console.log("Search keyword:", keyword);
});

// User types rapidly
searchInput$.next("a");
searchInput$.next("ap");
searchInput$.next("app");
searchInput$.next("apple");

// Only emits latest search term when triggered
searchTrigger$.next("search"); // Output: Search keyword: apple
```

### Scenario 3: Waiting for Async Values

```typescript
import { $, audit } from "fluth";

const source$ = $();
const trigger$ = $();

// shouldAwait is true (default)
const audited$ = source$.pipe(audit(trigger$, true));

audited$.then((value) => {
  console.log("audited:", value);
});

// Send a Promise that takes time to resolve
const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve("async result"), 1000);
});
source$.next(slowPromise);

// Trigger immediately, but will wait for Promise resolution
trigger$.next("trigger");
// Output after 1 second: audited: async result
```

### Scenario 4: Not Waiting for Async Values

```typescript
import { $, audit } from "fluth";

const source$ = $();
const trigger$ = $();

// shouldAwait is false
const audited$ = source$.pipe(audit(trigger$, false));

audited$.then((value) => {
  console.log("audited:", value);
});

const slowPromise = new Promise((resolve) => {
  setTimeout(() => resolve("async result"), 1000);
});
source$.next(slowPromise);

// Trigger immediately, won't wait for Promise resolution
trigger$.next("trigger"); // Output: audited: undefined
```

## Important Notes

1. **Rejected value handling**: The audit operator ignores rejected Promises and won't update the current value
2. **Trigger timing**: Only emits source stream values when the trigger stream emits
3. **Value overwriting**: If the source stream emits multiple values quickly, only the latest resolved value is emitted
4. **Initial state**: If triggered before the source stream has a value, emits `undefined`
5. **Completion handling**: When the trigger stream completes, the audit operator also completes

## Relationship with Other Operators

- Difference from `throttle`: `audit` is based on external triggers, `throttle` is based on time intervals
- Difference from `debounce`: `audit` emits immediately when triggered, `debounce` emits after a silence period
- Difference from `buffer`: `audit` only emits the latest value, `buffer` collects all values

## Complete Example

```typescript
import { $, audit } from "fluth";

// Create data stream and trigger
const dataStream$ = $();
const saveButton$ = $();

// Create audit stream that only emits latest data when save button is clicked
const auditedData$ = dataStream$.pipe(audit(saveButton$));

auditedData$.then((data) => {
  console.log("Saving data:", data);
  // Execute save logic
});

// User edits data
dataStream$.next({ name: "John" });
dataStream$.next({ name: "John", age: 25 });
dataStream$.next({ name: "John", age: 25, email: "john@example.com" });

// Click save button, only saves the latest complete data
saveButton$.next("save");
// Output: Saving data: { name: 'John', age: 25, email: 'john@example.com' }

// Continue editing
dataStream$.next({ name: "John Smith", age: 25, email: "john@example.com" });

// Save again
saveButton$.next("save");
// Output: Saving data: { name: 'John Smith', age: 25, email: 'john@example.com' }
```

## Error Handling Example

```typescript
import { $, audit } from "fluth";

const source$ = $();
const trigger$ = $();

const audited$ = source$.pipe(audit(trigger$));

audited$.then((value) => {
  console.log("Success:", value);
});

// Mix successful and failed values
source$.next("success1");
source$.next(Promise.reject("error1")); // Will be ignored
source$.next("success2");
source$.next(Promise.reject("error2")); // Will be ignored

// When triggered, only emits the latest successful value
trigger$.next("trigger"); // Output: Success: success2
```
