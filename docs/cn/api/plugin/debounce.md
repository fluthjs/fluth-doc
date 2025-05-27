# debounce

- 详情

  [chain](/cn/guide/plugin.html#chain-插件)插件， 当推流到订阅节点后会进行防抖后再将处理结果推给其子订阅节点。

- 示例

  ```typescript
  import { $, debounce } from "fluth";

  const promise$ = $().use(debounce);
  promise$.debounce(100).then((value) => {
    console.log(value);
  });
  promise$.next(1);
  promise$.next(2);
  promise$.next(3);
  promise$.next(4);
  promise$.next(5); // 打印 5
  ```
