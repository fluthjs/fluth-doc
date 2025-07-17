# Application Scenarios

`fluth` is suitable for reactive programming scenarios. Compared to reactive data, organizing code using streams has the following advantages:

- Easier to build reactive logic, reducing business complexity
- More declarative programming paradigm, significantly reducing code volume
- More readable code, with clear upstream and downstream relationships

![image](/structure.drawio.png)

## Building Reactive Logic

For `Vue` or `React` developers, using reactive data to trigger view updates has brought tremendous improvements in development efficiency. However, reactive data in the logic layer has not realized its full potential value.

In business logic, reactive data is typically used through `watch` to monitor data changes (or `useEffect` to monitor data changes), and then trigger logic updates based on data changes. However, this approach has the following problems:

- Poor semantics
- Unclear data flow
- Difficult to manage timing issues

Therefore, its use cases are relatively limited. However, using `fluth`'s stream-based programming paradigm, you can build entire logic within reactive patterns, thus achieving improved development efficiency!

**Using a complex real-world business scenario as an example:**

### Imperative Programming Paradigm

Suppose we need to implement an intelligent search function that requires:

1. Real-time search as users input keywords
2. Simultaneously fetch results from multiple data sources (products, users, articles)
3. Sort and filter results based on user preferences
4. Cache search results to avoid duplicate requests
5. Handle network errors and retry mechanisms
6. Debounce processing to avoid frequent requests

Traditional imperative programming implementation:

```javascript
class SearchManager {
  constructor() {
    this.cache = new Map();
    this.debounceTimer = null;
    this.currentRequests = [];
    this.isLoading = false;
    this.userPreferences = null;
  }

  async handleSearch(keyword) {
    // Clear previous timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Cancel previous requests
    this.currentRequests.forEach((req) => req.cancel());
    this.currentRequests = [];

    // Debounce processing
    this.debounceTimer = setTimeout(async () => {
      try {
        this.isLoading = true;
        this.updateUI();

        // Check cache
        const cacheKey = `${keyword}_${JSON.stringify(this.userPreferences)}`;
        if (this.cache.has(cacheKey)) {
          this.displayResults(this.cache.get(cacheKey));
          return;
        }

        // Get user preferences
        if (!this.userPreferences) {
          this.userPreferences = await this.fetchUserPreferences();
        }

        // Parallel requests to multiple data sources
        const [products, users, articles] = await Promise.allSettled([
          this.searchProducts(keyword),
          this.searchUsers(keyword),
          this.searchArticles(keyword),
        ]);

        // Process results
        const results = this.processResults(products, users, articles);
        const sortedResults = this.sortByPreference(results, this.userPreferences);

        // Cache results
        this.cache.set(cacheKey, sortedResults);

        this.displayResults(sortedResults);
      } catch (error) {
        this.handleError(error);
        // Retry mechanism
        if (error.retryable) {
          setTimeout(() => this.handleSearch(keyword), 1000);
        }
      } finally {
        this.isLoading = false;
        this.updateUI();
      }
    }, 300);
  }

  // Lots of state management and error handling code...
}
```

Problems with this approach:

- **Complex state management**: Need to manually manage multiple state variables
- **Scattered error handling**: Error handling logic is distributed everywhere
- **Timing issues**: Need to manually handle request cancellation, debouncing, etc.
- **Verbose code**: Lots of boilerplate code and state management
- **Hard to test**: Complex state dependencies are difficult to unit test
- **Hard to extend**: Adding new data sources or processing logic requires modifying multiple places

### Reactive Programming Paradigm

Using `fluth`'s stream-based reactive programming paradigm:

```javascript
import { $, debounce, combine, promiseAll, delay } from 'fluth';

// Create search stream
const searchKeyword$ = $('');

// User preferences stream (fetch only once)
const userPreferences$ = $().then(() => fetchUserPreferences());

// Search results stream
const searchResults$ = searchKeyword$
  .pipe(
    // Debounce processing
    debounce(300),
    // Filter empty values
    filter(keyword => keyword.trim().length > 0),
    // Combine user preferences
    combine(userPreferences$),
    // Check cache
    then(([keyword, preferences]) => {
      const cacheKey = `${keyword}_${JSON.stringify(preferences)}`;
      return cache.get(cacheKey) || { keyword, preferences, fromCache: false };
    }),
    // If no cache, parallel request multiple data sources
    then(async (data) => {
      if (data.fromCache) return data;

      const { keyword, preferences } = data;
      const results = await promiseAll([
        searchProducts(keyword),
        searchUsers(keyword),
        searchArticles(keyword)
      ]);

      return { keyword, preferences, results };
    }),
    // Process and sort results
    then(({ keyword, preferences, results }) => {
      const processed = processResults(results);
      const sorted = sortByPreference(processed, preferences);

      // Cache results
      const cacheKey = `${keyword}_${JSON.stringify(preferences)}`;
      cache.set(cacheKey, sorted);

      return sorted;
    }),
    // Error handling and retry
    catch((error) => {
      if (error.retryable) {
        return delay(1000).then(() => searchResults$);
      }
      throw error;
    })
  );

// Loading state stream
const isLoading$ = searchKeyword$
  .pipe(
    merge(searchResults$),
    then((data, source) => source === searchKeyword$)
  );

// Usage
searchKeyword$.push('phone');  // Trigger search
searchResults$.then(results => displayResults(results));
isLoading$.then(loading => updateLoadingState(loading));
```

Advantages of this approach:

- **Declarative programming**: Code describes "what to do" rather than "how to do it"
- **Automatic state management**: Streams automatically manage state changes without manual maintenance
- **Unified error handling**: Unified error handling through `catch` operators
- **Natural timing control**: Debouncing, caching, retry are naturally expressed through operators
- **Easy to test**: Each operator can be tested independently
- **Highly composable**: Can easily add new processing logic
- **Concise code**: Significantly reduces boilerplate code

### More Complex Scenario: Real-time Collaborative Editor

Another more complex example, real-time collaborative editor:

```javascript
// Traditional approach requires managing lots of state
class CollaborativeEditor {
  constructor() {
    this.document = '';
    this.users = [];
    this.operations = [];
    this.conflicts = [];
    this.connectionStatus = 'disconnected';
    this.syncTimer = null;
    this.retryCount = 0;
  }

  // Needs lots of state synchronization and conflict resolution code...
}

// Using fluth's reactive approach
const documentChanges$ = $('');
const userOperations$ = $([]);
const connectionStatus$ = $('disconnected');

const syncedDocument$ = documentChanges$
  .pipe(
    // Debounce batch processing
    debounce(500),
    // Combine user operations
    combine(userOperations$),
    // Conflict detection and resolution
    then(([doc, ops]) => resolveConflicts(doc, ops)),
    // Only sync when connected
    filter(() => connectionStatus$.value === 'connected'),
    // Sync to server
    then(syncToServer),
    // Error retry
    catch(error => delay(1000).then(() => syncedDocument$))
  );
```

This approach makes complex state management simple and intuitive, and the code's intent is much clearer.
