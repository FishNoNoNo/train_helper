# API 文档

本文档整理 `src/service/app.service.ts` 中与接口相关的方法。
只记录本项目实际会用到的请求参数和关键返回值，未用到的字段不展开。

## 概览

| 方法名                  | 描述                | URL                                           |
| ----------------------- | ------------------- | --------------------------------------------- |
| `loginConfig`           | 获取登录配置        | `https://www.12306.cn/index/otn/login/conf`   |
| `uamtkStatic`           | 获取静态鉴权信息    | `/passport/web/auth/uamtk-static`             |
| `checkLoginState`       | 检查当前是否已登录  | `/otn/login/checkUser`                        |
| `createQrcode`          | 创建二维码登录图片  | `/passport/web/create-qr64`                   |
| `checkQr`               | 查询二维码登录状态  | `/passport/web/checkqr`                       |
| `userLogin`             | 触发 12306 登录跳转 | `/otn/login/userLogin`                        |
| `authUamtk`             | 获取新的 `apptk`    | `/passport/web/auth/uamtk`                    |
| `uamauthclient`         | 完成登录态回写      | `/otn/uamauthclient`                          |
| `queryTickets`          | 查询车票            | `/otn/leftTicket/queryG`                      |
| `getPassengers`         | 获取乘车人列表      | `/otn/passengers/query`                       |
| `submitOrderRequest`    | 提交订单请求        | `/otn/leftTicket/submitOrderRequest`          |
| `initDc`                | 初始化确认订单页面  | `/otn/confirmPassenger/initDc?N`              |
| `checkOrderInfo`        | 校验订单信息        | `/otn/confirmPassenger/checkOrderInfo`        |
| `getQueueCount`         | 获取排队信息        | `/otn/confirmPassenger/getQueueCount`         |
| `confirmSingleForQueue` | 确认进入队列        | `/otn/confirmPassenger/confirmSingleForQueue` |
| `queryOrderWaitTime`    | 查询订单等待结果    | `/otn/confirmPassenger/queryOrderWaitTime`    |

---

## 1. `loginConfig`

**描述**：获取 12306 登录页相关配置(发现其实没用)。
**方法**：`POST`
**URL**：`https://www.12306.cn/index/otn/login/conf`

**入参**：无

---

## 2. `uamtkStatic`

**描述**：请求静态鉴权接口。
**方法**：`POST`
**URL**：`/passport/web/auth/uamtk-static`

**入参**

```json
{
  "appid": "otn"
}
```

---

## 3. `checkLoginState`

**描述**：检查当前是否已登录。
**方法**：`POST`
**URL**：`/otn/login/checkUser`

**入参**

```json
{
  "_json_att": ""
}
```

---

## 4. `createQrcode`

**描述**：创建二维码登录图像。
**方法**：`POST`
**URL**：`/passport/web/create-qr64`

**入参**

```json
{
  "appid": "otn"
}
```

---

## 5. `checkQr`

**描述**：轮询二维码登录状态。
**方法**：`POST`
**URL**：`/passport/web/checkqr`

**入参**

```json
{
  "uuid": "二维码 uuid",
  "appid": "otn"
}
```

---

## 6. `userLogin`

**描述**：触发 12306 登录跳转。
**方法**：`GET`
**URL**：`/otn/login/userLogin`

**入参**

- `step = 1` 时使用 `redirect: follow`
- `step = 2` 时使用 `redirect: manual`

**返回值**

- 原始响应体

**说明**

- `step = 2` 时会校验 `location` 是否为 `https://kyfw.12306.cn/otn/view/index.html`
- 若不是，视为登录失败

---

## 7. `authUamtk`

**描述**：获取新的 `apptk`。
**方法**：`POST`
**URL**：`/passport/web/auth/uamtk`

**入参**

```json
{
  "appid": "otn"
}
```

**返回值**

- `newapptk`: 新的登录票据

**说明**

- 返回后会写入 `localStorage.apptk`
- 同时写入 cookie `tk`

---

## 8. `uamauthclient`

**描述**：使用 `apptk` 完成登录态确认。
**方法**：`POST`
**URL**：`/otn/uamauthclient`

**入参**

```json
{
  "tk": "apptk"
}
```

**返回值**

- `username`: 登录用户名

**说明**

- 若返回 `username`，会触发 `user:set` 事件

---

## 9. `queryTickets`

**描述**：查询车票列表。
**方法**：`GET`
**URL**：`/otn/leftTicket/queryG`

**入参**

```json
{
  "to": "到达站",
  "from": "出发站",
  "toDate": "2026-05-03",
  "wf": false,
  "student": false,
  "gd": false
}
```

**实际请求参数**

```json
{
  "leftTicketDTO.train_date": "2026-05-03",
  "leftTicketDTO.from_station": "出发站代码",
  "leftTicketDTO.to_station": "到达站代码",
  "purpose_codes": "ADULT"
}
```

**返回值**

- `Shift[]`，由 `TrainService.parseSearchResult(res.data)` 解析得到

**说明**

- 当前代码里只有 `student` 会影响 `purpose_codes`
- `wf`、`gd` 会写入站点 cookie，但当前查询逻辑未继续展开使用

---

## 10. `getPassengers`

**描述**：获取乘车人列表(存在两个获取乘车人的接口,)。
**方法**：`POST`
**URL**：`/otn/passengers/query`

**入参**

```json
{
  "pageIndex": 1,
  "pageSize": 10
}
```

**返回值**

- `res.data.data.datas`: 乘车人列表

**说明**

- 接口返回后会同步写入 `passengerManager.passengers`

---

## 11. `submitOrderRequest`

**描述**：提交订单请求。
**方法**：`POST`
**URL**：`/otn/leftTicket/submitOrderRequest`

**入参**

- `shift: Shift`

**实际请求体**

```text
secretStr=...
&train_date=...
&back_train_date=...
&tour_flag=dc
&purpose_codes=ADULT
&query_from_station_name=...
&query_to_station_name=...
&bed_level_info=
&seat_discount_info=...
&undefined
```

**返回值**

- 原始响应体

**说明**

- 若 `res.data.status === 'false'`，会抛出 `提交订单失败`

---

## 12. `initDc`

**描述**：初始化确认订单页，提取提交队列所需 token。
**方法**：`POST`
**URL**：`/otn/confirmPassenger/initDc?N`

**入参**

- `shift: Shift`

**请求体**

```json
{
  "_json_att": ""
}
```

**返回值**

- 原始文本响应

**本项目实际提取**

- `globalRepeatSubmitToken`
- `ticketInfoForPassengerForm`

**说明**

- `globalRepeatSubmitToken` 会写入 `localStorage`
- `ticketInfoForPassengerForm` 会写入 `passengerManager.ticketInfo`

---

## 13. `checkOrderInfo`

**描述**：校验乘车人、票种、座位等订单信息。
**方法**：`POST`
**URL**：`/otn/confirmPassenger/checkOrderInfo`

**入参**

```json
{
  "cancel_flag": "2",
  "bed_level_order_num": "000000000000000000000000000000",
  "passengerTicketStr": "乘车人票串",
  "oldPassengerStr": "乘车人旧信息串",
  "tour_flag": "dc",
  "randCode": "",
  "whatsSelect": "1",
  "sessionId": "",
  "sig": "",
  "scene": "nc_login",
  "_json_att": "",
  "REPEAT_SUBMIT_TOKEN": "token"
}
```

**返回值**

- `res.data.status`
- `res.data.data.submitStatus`

**说明**

- 两个字段同时为真才算校验通过
- 否则会抛出错误

---

## 14. `getQueueCount`

**描述**：获取当前排队信息。
**方法**：`POST`
**URL**：`/otn/confirmPassenger/getQueueCount`

**入参**

```json
{
  "train_date": "格式化后的时间",
  "train_no": "车次号",
  "stationTrainCode": "列车号",
  "seatType": "O",
  "fromStationTelecode": "出发站代码",
  "toStationTelecode": "到达站代码",
  "leftTicket": "leftTicketStr",
  "purpose_codes": "00",
  "train_location": "车厢位置码",
  "_json_att": "",
  "REPEAT_SUBMIT_TOKEN": "token"
}
```

**返回值**

- 原始响应体

**说明**

- 本项目只判断 `status`
- 若失败会抛出 `排队信息获取失败`

---

## 15. `confirmSingleForQueue`

**描述**：确认进入提交队列。
**方法**：`POST`
**URL**：`/otn/confirmPassenger/confirmSingleForQueue`

**入参**

```json
{
  "passengerTicketStr": "乘车人票串",
  "oldPassengerStr": "乘车人旧信息串",
  "randCode": "",
  "purpose_codes": "00",
  "key_check_isChange": "校验值",
  "leftTicketStr": "leftTicketStr",
  "train_location": "车厢位置码",
  "choose_seats": "A,B,C...",
  "seatDetailType": "000",
  "is_jy": "N",
  "is_cj": "N",
  "encryptedData": "",
  "whatsSelect": "1",
  "roomType": "00",
  "dwAll": "N",
  "_json_att": "",
  "REPEAT_SUBMIT_TOKEN": "token"
}
```

**返回值**

- `res.data.status`
- `res.data.data.submitStatus`

**说明**

- `choose_seats` 来自 `passengerManager.choiceSeats.join('')`
- 校验失败会抛出 `提交队列失败`

---

## 16. `queryOrderWaitTime`

**描述**：轮询订单等待结果。
**方法**：`GET`
**URL**：`/otn/confirmPassenger/queryOrderWaitTime`

**入参**

```json
{
  "random": 1700000000000,
  "tourFlag": "dc",
  "_json_att": "",
  "REPEAT_SUBMIT_TOKEN": "token"
}
```

**返回值**

- `orderId`: 成功时返回订单号
- `null`: 未拿到订单号时返回

**说明**

- 若 `status` 为 false，会抛出 `等待订单结果失败`
- 若返回中存在 `errorcode`，也视为失败

---

## 备注

1. `setStationCookies`、`buildStationCookie`、`logined`、`getAppTk` 等方法不是直接接口调用，但会影响接口请求上下文。
2. 订单链路中，真正关键的返回值只有：
   - `checkQr.result_code`
   - `authUamtk.newapptk`
   - `uamauthclient.username`
   - `queryTickets` 解析后的 `Shift[]`
   - `initDc` 提取的 `globalRepeatSubmitToken`
   - `checkOrderInfo.data.submitStatus`
   - `confirmSingleForQueue.data.submitStatus`
   - `queryOrderWaitTime.data.orderId`
