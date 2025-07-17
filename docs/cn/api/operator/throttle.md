# throttle

节流操作符，限制数据推送的频率，确保在指定时间间隔内只推送最后一次数据。

## 类型定义

```typescript
type throttle = (throttleTime: number) => (observable$: Observable) => Observable
```

## 详情

- 接收一个节流时间参数（毫秒）
- 最后一次数据会推送出来

## 示例

```typescript
import { $, throttle } from 'fluth'

const stream$ = $(1)

// 使用 throttle 操作符，节流时间 300ms
const throttled$ = stream$.pipe(throttle(300))

throttled$.then((value) => {
  console.log('节流后的值:', value)
})

// 快速连续推送数据
stream$.next(2)
stream$.next(3)
stream$.next(4)
stream$.next(5)

// 输出：只输出最后一次推送的值
// 节流后的值: 5
```
