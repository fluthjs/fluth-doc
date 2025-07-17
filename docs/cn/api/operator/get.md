# get

属性提取操作符，使用 getter 函数从源流中提取特定的值，只有当提取的值发生变化时才会发出新值。

## 类型定义

```typescript
type get = <T, F>(
  getter: (value: T | undefined) => F
) => (observable$: Observable<T>) => Observable<F>
```

## 参数说明

- `getter` (function): 提取函数，接收源流的值并返回需要提取的部分
  - 参数：`value: T | undefined` - 源流的当前值
  - 返回值：`F` - 提取的值

## 返回值

返回一个新的 `Observable<F>`，该 Observable 包含通过 getter 函数提取的值，只有当提取的值发生变化时才会发出新值。

## 详情

`get` 操作符的核心行为：

- **立即执行**：创建时会立即执行 getter 函数获取初始值
- **变化检测**：只有当 getter 返回的值发生变化时才会发出新值
- **深度提取**：支持深层嵌套属性的提取
- **值比较**：使用严格相等（===）比较提取的值是否发生变化

## 使用场景

### 场景 1：基础属性提取

```typescript
import { $, get } from 'fluth'

const source$ = $({ a: 1, b: { c: 2 } })
const b$ = source$.pipe(get((value) => value?.b))

b$.then((value) => {
  console.log('b changed:', value)
})

console.log(b$.value) // { c: 2 }

// 修改不相关的属性，不会触发
source$.set((value) => {
  value.a = 3
}) // 不输出

// 修改相关属性，会触发
source$.set((value) => {
  value.b.c = 3
}) // 输出: b changed: { c: 3 }
```

### 场景 2：深层嵌套属性提取

```typescript
import { $, get } from 'fluth'

const source$ = $({ user: { profile: { name: 'Alice', age: 25 } } })
const name$ = source$.pipe(get((value) => value?.user?.profile?.name))

name$.then((name) => {
  console.log('name:', name)
})

console.log(name$.value) // 'Alice'

source$.set((value) => {
  value.user.profile.name = 'Bob'
})
// 输出: name: Bob
```

### 场景 3：数组属性提取

```typescript
import { $, get } from 'fluth'

const source$ = $({ items: [1, 2, 3] })
const length$ = source$.pipe(get((value) => value?.items?.length))

length$.then((length) => {
  console.log('length:', length)
})

console.log(length$.value) // 3

source$.set((value) => {
  value.items.push(4)
})
// 输出: length: 4
```

### 场景 4：基本类型属性提取

```typescript
import { $, get } from 'fluth'

const source$ = $('hello world')
const length$ = source$.pipe(get((value) => value?.length))

length$.then((length) => {
  console.log('string length:', length)
})

console.log(length$.value) // 11

source$.next('hi')
// 输出: string length: 2
```

### 场景 5：复杂计算转换

```typescript
import { $, get } from 'fluth'

const source$ = $({ x: 3, y: 4 })
const distance$ = source$.pipe(
  get((value) => (value ? Math.sqrt(value.x * value.x + value.y * value.y) : 0))
)

distance$.then((distance) => {
  console.log('distance:', distance)
})

console.log(distance$.value) // 5

source$.set((value) => {
  value.x = 6
  value.y = 8
})
// 输出: distance: 10
```

### 场景 6：链式 get 操作

```typescript
import { $, get } from 'fluth'

const source$ = $({
  data: {
    users: [
      { name: 'Alice', settings: { theme: 'dark' } },
      { name: 'Bob', settings: { theme: 'light' } },
    ],
  },
})

const firstUserTheme$ = source$
  .pipe(get((value) => value?.data?.users))
  .pipe(get((users) => users?.[0]))
  .pipe(get((user) => user?.settings?.theme))

firstUserTheme$.then((theme) => {
  console.log('theme:', theme)
})

console.log(firstUserTheme$.value) // 'dark'

source$.set((value) => {
  value.data.users[0].settings.theme = 'light'
})
// 输出: theme: light
```

## 注意事项

1. **立即执行**：get 操作符会在创建时立即执行 getter 函数
2. **变化检测**：只有当 getter 返回的值发生变化时才会发出新值
3. **空值安全**：应该使用可选链操作符（?.）来安全访问属性
4. **值比较**：使用严格相等（===）比较值的变化
5. **性能考虑**：getter 函数应该尽量简单，避免复杂计算

## 与其他操作符的关系

- 与 `filter` 的区别：`get` 提取值，`filter` 过滤值
- 与 `then` 的区别：`get` 只在提取值变化时发出，`then` 在每次源值变化时都会执行
- 与 `change` 的区别：`get` 提取特定部分，`change` 检测整个值的变化
