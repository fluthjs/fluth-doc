# createStream

- 类型

  ```typescript
  function createStream<P extends Plugin[]>(
    ...plugins: P
  ): {
    <T>(): Stream<T, false, ChainReturn<P, T, object>> & ChainReturn<P, T, object>;
    <T>(data: T): Stream<T, true, ChainReturn<P, T, object>> & ChainReturn<P, T, object>;
  };
  ```

  其中`Plugin`是一个类型详细见[use](/cn/api/stream.md#use)

- 详情

`createStream`返回一个`Stream`的工厂函数，由这个工厂函数创建的流会默认带上传入的插件

- 示例

```typescript
import { createStream, delay, throttle, debounce } from "fluth";

// 创建带默认插件的流工厂函数
const new$ = createStream(delay, throttle, debounce);
// 不用use直接使用插件
const promise$ = new$(1).delay(1000);
```
