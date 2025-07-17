# change

变更检测操作符，只有当 getter 函数的结果与上一次不同时才会触发后续操作。

## 类型定义

```typescript
change: <T>(getter: (value: T | undefined) => any) =>
  (observable$: Observable<T>) =>
    Observable<T>
```

## 参数说明

- `getter` (函数): 从源数据中提取用于比较的值的函数
  - 参数: `value: T | undefined` - 当前推流的数据
  - 返回值: `any` - 用于比较的值

## 返回值

返回一个新的 Observable，只有当 getter 函数的结果发生变化时才会推流数据。

## 核心行为

- **变更检测**: 使用严格相等比较 (===) 来检测 getter 函数结果的变化
- **首次执行**: 第一次推流时总是会触发（因为没有上一次的值进行比较）
- **值过滤**: 只有当 getter 结果不同时才会传递数据到下游
- **原始数据**: 传递的是原始的完整数据，而不是 getter 的结果

## 使用场景

### 场景 1：基础数值变更检测

```typescript
import { $ } from 'fluth'

const promise$ = $<{ num: number }>()
promise$.pipe(change((value) => value?.num)).then(() => console.log('数值变更'))

promise$.next({ num: 1 }) // 触发 - 首次推流
promise$.next({ num: 2 }) // 触发 - 数值从 1 变为 2
promise$.next({ num: 2 }) // 不触发 - 数值相同
promise$.next({ num: 1 }) // 触发 - 数值从 2 变为 1
```

### 场景 2：嵌套对象属性变更

```typescript
import { $ } from 'fluth'

const promise$ = $<{ user: { name: string; age: number } }>()
promise$.pipe(change((value) => value?.user.name)).then(() => console.log('用户名变更'))

promise$.next({ user: { name: 'Alice', age: 25 } }) // 触发
promise$.next({ user: { name: 'Bob', age: 25 } }) // 触发 - 名称变更
promise$.next({ user: { name: 'Bob', age: 30 } }) // 不触发 - 名称相同
promise$.next({ user: { name: 'Alice', age: 30 } }) // 触发 - 名称变更
```

### 场景 3：数组长度变更检测

```typescript
import { $ } from 'fluth'

const promise$ = $<{ items: number[] }>()
promise$.pipe(change((value) => value?.items?.length)).then(() => console.log('数组长度变更'))

promise$.next({ items: [1, 2] }) // 触发 - 长度为 2
promise$.next({ items: [1, 2, 3] }) // 触发 - 长度变为 3
promise$.next({ items: [1, 2, 3] }) // 不触发 - 长度相同
promise$.next({ items: [1] }) // 触发 - 长度变为 1
```

### 场景 4：原始类型变更

```typescript
import { $ } from 'fluth'

const promise$ = $<string>()
promise$.pipe(change((value) => value)).then(() => console.log('字符串变更'))

promise$.next('hello') // 触发
promise$.next('world') // 触发
promise$.next('world') // 不触发 - 相同值
promise$.next('hello') // 触发
```

### 场景 5：布尔值状态变更

```typescript
import { $ } from 'fluth'

const promise$ = $<{ active: boolean }>()
promise$.pipe(change((value) => value?.active)).then(() => console.log('状态变更'))

promise$.next({ active: false }) // 触发
promise$.next({ active: true }) // 触发
promise$.next({ active: true }) // 不触发 - 相同状态
promise$.next({ active: false }) // 触发
```

### 场景 6：复杂计算结果变更

```typescript
import { $ } from 'fluth'

const promise$ = $<{ x: number; y: number }>()
promise$
  .pipe(change((value) => (value ? value.x + value.y : 0)))
  .then(() => console.log('计算结果变更'))

promise$.next({ x: 1, y: 2 }) // 触发 - 和为 3
promise$.next({ x: 2, y: 1 }) // 不触发 - 和仍为 3
promise$.next({ x: 3, y: 2 }) // 触发 - 和变为 5
promise$.next({ x: 1, y: 4 }) // 不触发 - 和仍为 5
promise$.next({ x: 0, y: 0 }) // 触发 - 和变为 0
```

## 注意事项

1. **严格相等比较**: 使用 `===` 进行比较，对于对象和数组需要返回相同的引用才认为相等
2. **首次执行**: 第一次推流时总是会触发，因为没有上一次的值进行比较
3. **性能考虑**: getter 函数应该尽可能简单，避免复杂的计算
4. **内存管理**: 不会保存历史数据，只保存上一次 getter 的结果用于比较

## 与其他操作符的关系

- **vs filter**: `filter` 基于条件过滤数据，`change` 基于值变化过滤数据
- **vs get**: `get` 提取并监听属性变化，`change` 可以监听任意计算结果的变化
- **vs throttle/debounce**: 这些操作符基于时间控制，`change` 基于值变化控制
