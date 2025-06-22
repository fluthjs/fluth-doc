# chainPlugin

- 详情

为流上所有的订阅节点添加链式方法，可以扩展 Observable 的功能。

- 类型

  ```typescript
  type ChainPluginFn<T extends Observable = Observable> = (observer: T) => Record<string, any>;

  interface ChainPlugin {
    chain: ChainPluginFn;
  }
  ```

- 示例

  基础用法：

  ```typescript
  import { Observable, $ } from "fluth";

  // 自定义chain插件, 为流添加链式方法
  const chainPlugin = {
    chain: (observer: Observable) => ({
      // 添加链式自定义方法，可链式调用
      customMethod: () => "current: " + observer.value,
    }),
  };

  const promise$ = $(1).use(chainPlugin);
  const observable$ = promise$.then((data) => data + 1);
  promise$.next(2);

  console.log(promise$.customMethod()); // 打印 current 2
  console.log(observable$.customMethod()); // 打印 current 3
  ```

  复杂链式方法示例：

  ```typescript
  import { Observable, $ } from "fluth";

  // 创建一个提供数据转换方法的chain插件
  const transformPlugin = {
    chain: (observer: Observable) => ({
      // 添加数据映射方法
      map: (fn: (value: any) => any) => {
        return observer.then(fn);
      },
      // 添加数据过滤方法
      filterValue: (condition: (value: any) => boolean) => {
        return observer.filter(condition);
      },
      // 添加获取当前值的方法
      getCurrentValue: () => observer.value,
    }),
  };

  const promise$ = $(10).use(transformPlugin);

  promise$
    .map((x) => x * 2)
    .filterValue((x) => x > 15)
    .then((value) => console.log("结果:", value));

  promise$.next(8); // 输出: 结果: 16
  promise$.next(5); // 不输出 (10 <= 15)
  ```
