# 适用场景

`fluth`适用于响应式编程场景，相比于响应式数据，用流的方式来组织代码具备以下优势：

- 更容易构建响应式的逻辑，降低业务复杂度
- 更加声明式的编程范式，能大量减少代码量
- 更加易于代码阅读，上下游关系一目了然

![image](/structure.drawio.svg)

## 构建响应式的逻辑

对于`vue`或者`react`的开发者来说，利用数据的响应式来触发视图的更新带来了开发效率的巨大提升，但是在逻辑层数据的响应式并没有发挥出应有的价值。

在业务逻辑中利用数据的响应式通常是利用`watch`来监听数据的变化（或者`useEffect`来监听数据的变化），然后通过数据的变化来触发逻辑的更新。但是这种方式存在以下问题：

- 语义差
- 数据流不清晰
- 时序问题难以管理

所以其使用场景比较有限，但是使用`fluth`的流式编程范式，可以将整个逻辑的构建在响应式中，从而实现开发效率的提升！

<!-- **以一个简单的例子来说明：**

### 命令式编程范式

假如有一个表单页面，会用到模块 A、模块 B、模块 C 的数据，表单绑定模块 A 的数据，点击后调用模块 A 的接口，返回结果后再调用模块 B 和 模块 C 的方法如下图所示：

![image](/traditional-code.drawio.svg)

其中`handleClick`方法既可以放在组件中实现，也可以在模块 A 实现:

- 需要手动管理数据的变化，并且需要手动管理后续逻辑的更新。页面和模块 A、模块 B、模块 C 之间耦合度较高，复用性较差。

### 响应式编程范式

使用`fluth`的流式响应式编程范式，可以将整个逻辑的构建在响应式中，如下所示：

![image](/stream-code.drawio.svg)

这样做有以下好处：

- 降低业务复杂度，模块 A、模块 B、模块 C 的逻辑通过流实现了响应式的串联，组件不用背负沉重的逻辑
- 依赖倒置：将模块 A 的流注入到模块 B、模块 C -->
