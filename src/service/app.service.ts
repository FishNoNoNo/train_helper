import HttpClient, { raceSuccess } from '@/utils/request'
import TrainService from './train.service'
import bus from '@/lib/utils/eventBus'
import type { Shift } from '@/types/train.d'
import { today } from '@/lib/utils/time'
import cookieJar from '@/utils/cookieJar'
import { PassengerManager } from './passenger.service'
import { getTimestamp } from '@/utils/time'
import parser from '@/utils/parse'
import { notify } from './notification.service'

interface BookTicketOptions {
  maxWaitTime?: number
  retryTimes?: number
  onWait?: (waitedSeconds: number) => void
  onRetry?: (attempt: number, error: Error) => void
}

interface BookTicketResult {
  orderId: string
  waitedSeconds: number
  shift?: Shift
}

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

const getErrorMessage = (data: any, fallback: string) => {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return (
    data.messages?.join('; ') ||
    data.message ||
    data.data?.errMsg ||
    data.data?.errorMsg ||
    data.data?.msg ||
    fallback
  )
}

export class AppService {
  private baseUrl: string = 'https://kyfw.12306.cn'
  private baseHeaders = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0',
  }

  private buildUrl(path: string) {
    return `${this.baseUrl}${path}`
  }

  passengerManager = new PassengerManager()

  constructor() {
    cookieJar.setCookie({
      name: 'guidesStatus',
      value: 'off',
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: 'cursorStatus',
      value: 'off',
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: 'highContrastMode',
      value: 'defaltMode',
      domain: 'kyfw.12306.cn',
      path: '/',
    })
  }

  pushPassenger(index: number, seatType: string = 'O', ticketType: number) {
    this.passengerManager.pushPassenger(index, seatType, ticketType)
  }

  logined() {
    return !!localStorage.getItem('apptk')
  }

  getAppTk(): string {
    const apptk = localStorage.getItem('apptk')
    if (!apptk) {
      bus.emit('user:logout')
      throw new Error('未登录')
    }
    return apptk
  }

  async loginConfig() {
    const url = 'https://www.12306.cn/index/otn/login/conf'
    const res = await HttpClient.postX(url)
    console.log(res)
  }

  async uamtkStatic() {
    const url = this.buildUrl('/passport/web/auth/uamtk-static')
    const data = {
      appid: 'otn',
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://www.12306.cn/',
        Origin: 'https://www.12306.cn/',
        Host: 'kyfw.12306.cn',
      },
    })
    console.log(res)
  }

  async checkLoginState() {
    const apptk = localStorage.getItem('apptk')
    if (!apptk) {
      bus.emit('user:logout')
      return false
    }
    const url = this.buildUrl('/otn/login/checkUser')
    const data = {
      _json_att: '',
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (resData.data.flag) {
      return true
    }
    // const userName = res.data.data.user_name
    // if (userName) {
    //   bus.emit('user:set', {
    //     type: 'user:set',
    //     data: {
    //       userName,
    //     },
    //   })
    //   return true
    // }
    return false
  }

  async createQrcode() {
    const url = this.buildUrl('/passport/web/create-qr64')
    const data = {
      appid: 'otn',
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
    })
    return res.data
  }

  async checkQr(uuid: string) {
    const url = this.buildUrl('/passport/web/checkqr')
    const data = {
      uuid,
      appid: 'otn',
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
    })
    console.log(res)
    return res.data
  }

  async userLogin(step: number = 1) {
    const url = this.buildUrl('/otn/login/userLogin')
    const res = await HttpClient.get(url, {
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      redirect: step === 1 ? 'follow' : 'manual',
    })
    console.log(res)
    const setCookie = res.headers.getSetCookie()
    console.log(setCookie)
    res.headers.forEach((value, key) => {
      console.log(key, value)
    })
    if (step === 2) {
      // console.log(JSON.stringify(res.headers))
      const location = res.headers.get('location')

      if (location) {
        if (location !== 'https://kyfw.12306.cn/otn/view/index.html') {
          throw new Error('登录失败')
        }
      }
    }
    return res.data
  }

  async authUamtk() {
    const url = this.buildUrl('/passport/web/auth/uamtk')
    const data = {
      appid: 'otn',
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/passport?redirect=/otn/login/userLogin',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
    })
    console.log(res)
    const resData = res.data
    if (resData instanceof Object) {
      const apptk = resData.newapptk
      localStorage.setItem('apptk', apptk)
      cookieJar.setCookie({
        name: 'tk',
        value: apptk,
        domain: 'kyfw.12306.cn',
        path: '/',
      })
    }
    return resData
  }

  async uamauthclient() {
    const apptk = this.getAppTk()
    const url = this.buildUrl('/otn/uamauthclient')
    const data = {
      tk: apptk,
    }
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (resData.username) {
      bus.emit('user:set', {
        type: 'user:set',
        data: {
          userName: resData.username,
        },
      })
    }
    return res
  }
  setStationCookies(options: {
    to: string
    from: string
    toDate: string
    wf?: boolean
    student?: boolean
    gd?: boolean
  }) {
    const toCode = TrainService.nameToCode(options.to)
    const fromCode = TrainService.nameToCode(options.from)
    cookieJar.setCookie({
      name: '_jc_save_fromStation',
      value: encodeURIComponent(options.from + ',' + fromCode),
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: '_jc_save_toStation',
      value: encodeURIComponent(options.to + ',' + toCode),
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: '_jc_save_fromDate',
      value: options.toDate,
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: '_jc_save_wfdc_flag',
      value: options.wf ? 'wf' : 'dc',
      domain: 'kyfw.12306.cn',
      path: '/',
    })
    cookieJar.setCookie({
      name: '_jc_save_gdFlag_flag',
      value: options.gd ? '1' : '0',
      domain: 'kyfw.12306.cn',
      path: '/',
    })
  }

  buildStationCookie(options: {
    to: string
    from: string
    toDate: string
    wf?: boolean
    student?: boolean
    gd?: boolean
  }) {
    const toCode = TrainService.nameToCode(options.to)
    const fromCode = TrainService.nameToCode(options.from)
    return {
      _jc_save_fromStation: encodeURIComponent(options.from + ',' + fromCode),
      _jc_save_toStation: encodeURIComponent(options.to + ',' + toCode),
      _jc_save_fromDate: options.toDate,
      _jc_save_wfdc_flag: options.wf ? 'wf' : 'dc',
      _jc_save_gdFlag_flag: options.gd ? '1' : '0',
    }
  }

  async queryTickets(options: {
    to: string
    from: string
    toDate: string
    wf?: boolean
    student?: boolean
    gd?: boolean
  }) {
    const toCode = TrainService.nameToCode(options.to)
    const fromCode = TrainService.nameToCode(options.from)
    const url = this.buildUrl('/otn/leftTicket/queryG')
    const params = {
      'leftTicketDTO.train_date': options.toDate,
      'leftTicketDTO.from_station': fromCode,
      'leftTicketDTO.to_station': toCode,
      purpose_codes: options.student ? '0X00' : 'ADULT',
    }
    this.setStationCookies(options)
    let headers: any = {
      ...this.baseHeaders,
      Referer: 'https://kyfw.12306.cn/otn/leftTicket/init',
      Origin: 'https://kyfw.12306.cn',
      Host: 'kyfw.12306.cn',
    }
    if (!this.logined()) {
      headers = {
        ...headers,
        Cookie: HttpClient.buildCookies({
          JSESSIONID: 'F6E19C4C57B22F267C588A1CF8DEBB21',
        }),
      }
    }
    const res = await HttpClient.get(url, {
      params: params,
      headers: headers,
    })
    // console.log(cookieJar.getAllCookies())
    console.log(res)
    return TrainService.parseSearchResult(res.data)
  }

  async getPassengers(page: number, pageSize: number) {
    const url = this.buildUrl('/otn/passengers/query')
    const data = {
      pageIndex: page,
      pageSize: pageSize,
    }

    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/leftTicket/init',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    this.passengerManager.setPassengers(resData.data.datas)
    return resData
  }

  async submitOrderRequest(shift: Shift) {
    const url = this.buildUrl('/otn/leftTicket/submitOrderRequest')
    const data = `secretStr=${shift.secretStr}&train_date=${shift.trainDate}&back_train_date=${today()}&tour_flag=dc&purpose_codes=ADULT&query_from_station_name=${encodeURIComponent(shift.fromStation)}&query_to_station_name=${encodeURIComponent(shift.toStation)}&bed_level_info=&seat_discount_info=${shift.seatDiscountInfo}&undefined`
    const toCode = TrainService.nameToCode(shift.toStation)
    const fromCode = TrainService.nameToCode(shift.fromStation)
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: `https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=${encodeURIComponent(shift.fromStation + ',' + fromCode)}&ts=${encodeURIComponent(shift.toStation + ',' + toCode)}&date=${shift.trainDate}&flag=N,N,Y`,
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
        'Content-Length': data.length.toString(),
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (resData.status === 'false') {
      throw new Error('提交订单失败')
    }
    return resData
  }

  async initDc(shift: Shift) {
    const url = this.buildUrl('/otn/confirmPassenger/initDc?N')
    const data = {
      _json_att: '',
    }
    const toCode = TrainService.nameToCode(shift.toStation)
    const fromCode = TrainService.nameToCode(shift.fromStation)
    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: `https://kyfw.12306.cn/otn/leftTicket/init?linktypeid=dc&fs=${encodeURIComponent(shift.fromStation + ',' + fromCode)}&ts=${encodeURIComponent(shift.toStation + ',' + toCode)}&date=${shift.trainDate}&flag=N,N,Y`,
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
      returnType: 'text',
    })
    console.log(res)
    const resData = res.data
    const pattern = /globalRepeatSubmitToken = '(.+?)';/
    const match = resData.match(pattern)
    const globalRepeatSubmitToken = match ? match[1] : ''
    console.log(globalRepeatSubmitToken)
    localStorage.setItem('globalRepeatSubmitToken', globalRepeatSubmitToken)
    const ticketInfo = parser.extractAndParseJsObject(resData, 'ticketInfoForPassengerForm')
    this.passengerManager.setTicketInfo(ticketInfo)
    return resData
  }

  async checkOrderInfo() {
    const url = this.buildUrl('/otn/confirmPassenger/checkOrderInfo')
    // console.log(cookieJar.getAllCookies())
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')

    const data = {
      cancel_flag: '2',
      bed_level_order_num: '000000000000000000000000000000',
      passengerTicketStr: this.passengerManager.getpassengerTickets(),
      oldPassengerStr: this.passengerManager.getOldPassengers(),
      tour_flag: 'dc',
      randCode: '',
      whatsSelect: '1',
      sessionId: '',
      sig: '',
      scene: 'nc_login',
      _json_att: '',
      REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken || '',
    }

    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/confirmPassenger/initDc?N',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (!(resData.status && resData.data.submitStatus)) {
      throw new Error(getErrorMessage(resData, '订单检查失败'))
    }
    return resData
  }

  async getQueueCount(shift: Shift) {
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')
    const url = this.buildUrl('/otn/confirmPassenger/getQueueCount')
    const queryDto = this.passengerManager.ticketInfo.queryLeftTicketRequestDTO || {}
    const data = {
      train_date: parser.parseDateTime(shift.trainDate),
      train_no: queryDto.train_no || shift.trainNo,
      stationTrainCode: queryDto.station_train_code || shift.stationTrainCode,
      seatType: this.passengerManager.limitTickets[0].seat_type || 'O',
      fromStationTelecode: queryDto.from_station_telecode || shift.fromStationCode,
      toStationTelecode: queryDto.to_station_telecode || shift.toStationCode,
      leftTicket: this.passengerManager.ticketInfo.leftTicketStr || shift.leftTicketStr,
      purpose_codes: '00',
      train_location: this.passengerManager.ticketInfo.train_location || shift.locationCode,
      _json_att: '',
      REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken || '',
    }

    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/confirmPassenger/initDc?N',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (!resData.status) {
      throw new Error(getErrorMessage(resData, '排队信息获取失败'))
    }
    return resData
  }

  async confirmSingleForQueue() {
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')
    const url = this.buildUrl('/otn/confirmPassenger/confirmSingleForQueue')
    const data = {
      passengerTicketStr: this.passengerManager.getpassengerTickets(),
      oldPassengerStr: this.passengerManager.getOldPassengers(),
      randCode: '',
      purpose_codes: '00',
      key_check_isChange: this.passengerManager.ticketInfo.key_check_isChange || '',
      leftTicketStr: this.passengerManager.ticketInfo.leftTicketStr || '',
      train_location: this.passengerManager.ticketInfo.train_location || '',
      choose_seats: this.passengerManager.choiceSeats.join(''),
      seatDetailType: '000', // 涓嬩腑涓婇摵
      is_jy: 'N', // 闈欓煶杞﹀帰
      is_cj: 'N',
      encryptedData: '',
      whatsSelect: '1',
      roomType: '00',
      dwAll: 'N',
      _json_att: '',
      REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken || '',
    }

    const res = await HttpClient.postX(url, {
      body: data,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/confirmPassenger/initDc?N',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (!(resData.status && resData.data.submitStatus)) {
      throw new Error(getErrorMessage(resData, '提交队列失败'))
    }
    return resData
  }

  async queryOrderWaitTime() {
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')
    const url = this.buildUrl('/otn/confirmPassenger/queryOrderWaitTime')
    const params = {
      random: getTimestamp(),
      tourFlag: 'dc',
      _json_att: '',
      REPEAT_SUBMIT_TOKEN: globalRepeatSubmitToken,
    }

    const res = await HttpClient.get(url, {
      params,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/confirmPassenger/initDc?N',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    console.log(res)
    const resData = res.data
    if (!resData.status) {
      throw new Error(getErrorMessage(resData, '等待订单结果失败'))
    }
    if (resData.data.errorcode !== undefined) {
      throw new Error(getErrorMessage(res.data, '等待订单结果失败'))
    }
    const orderId = resData?.data?.orderId || null
    return orderId
  }
}

const appService = new AppService()

export default appService

const passengerManager = appService.passengerManager
export { passengerManager }

const getSearchForm = () => {
  const res = {
    departure: '',
    destination: '',
    date: '',
  }
  const cookies = cookieJar.getAllCookies()
  cookies.forEach((cookie) => {
    if (cookie.name === '_jc_save_fromStation') {
      const formStattion = decodeURIComponent(cookie.value).split(',')[0]
      res.departure = formStattion
    } else if (cookie.name === '_jc_save_toStation') {
      // url瑙ｇ爜
      const toStattion = decodeURIComponent(cookie.value).split(',')[0]
      res.destination = toStattion
    } else if (cookie.name === '_jc_save_fromDate') {
      res.date = cookie.value
    }
  })
  return res
}

export { getSearchForm }

const parseTime = (trainDate: string, tip: string) => {
  let date = new Date(trainDate)
  if (tip.includes('月') || tip.includes('日')) {
    date = parser.getDateFromCn(tip)
  }
  const year = trainDate.split('-')[0]
  const month = date.getMonth() + 1 || parseInt(trainDate.split('-')[1])
  const day = date.getDate() || parseInt(trainDate.split('-')[2])
  date.setFullYear(parseInt(year))
  date.setMonth(month - 1)
  date.setDate(day)
  const time = parser.getTimeFromCn(tip)
  return parser.mergeTime(date, time)
}

const runBookTicketOnce = async (
  shift: Shift,
  options: Required<Pick<BookTicketOptions, 'maxWaitTime'>> & Pick<BookTicketOptions, 'onWait'>,
): Promise<BookTicketResult> => {
  if (appService.passengerManager.passengerDatas.length === 0) {
    throw new Error('请先选择乘车人')
  }

  if (shift.tip.includes('起售')) {
    const bookTime = parseTime(shift.trainDate, shift.tip).getTime()

    await sleep(Math.max(bookTime - Date.now() - 1000, 0))

    const searchForm = getSearchForm()
    for (let i = 0; i < options.maxWaitTime; i++) {
      const newShift = await appService.queryTickets({
        to: searchForm.destination,
        from: searchForm.departure,
        toDate: searchForm.date,
      })

      const targetShift = newShift.find((item) => item.trainNo === shift.trainNo)
      if (targetShift && !targetShift.tip.includes('起售')) {
        return runBookTicketOnce(targetShift, options)
      }

      await sleep(100)
    }

    throw new Error('未等到车票开始发售')
  }

  await appService.submitOrderRequest(shift)
  await appService.initDc(shift)

  appService.passengerManager.limitTickets = []
  appService.passengerManager.clearCache()
  passengerManager.passengerDatas.forEach((config) => {
    appService.pushPassenger(config.index, config.seatType, config.ticketType)
  })

  await appService.checkOrderInfo()
  await appService.getQueueCount(shift)
  await appService.confirmSingleForQueue()

  for (let waitedSeconds = 1; waitedSeconds <= options.maxWaitTime; waitedSeconds++) {
    await sleep(1000)

    const orderId = await appService.queryOrderWaitTime()

    if (orderId) {
      console.log('抢票成功,订单号', orderId)
      return {
        orderId,
        waitedSeconds,
      }
    }
  }

  throw new Error('等待订单结果超时')
}

const bookTicket = async (
  shift: Shift,
  maxWaitTimeOrOptions: number | BookTicketOptions = 60,
): Promise<BookTicketResult> => {
  const options: BookTicketOptions =
    typeof maxWaitTimeOrOptions === 'number'
      ? { maxWaitTime: maxWaitTimeOrOptions }
      : maxWaitTimeOrOptions

  const maxWaitTime = options.maxWaitTime ?? 60
  const retryTimes = options.retryTimes ?? 1
  let lastError: Error | null = null

  let waitedSeconds = 0
  const timer = setInterval(() => {
    options.onWait?.(waitedSeconds)
    waitedSeconds++
  }, 1000)
  for (let attempt = 1; attempt <= retryTimes + 1; attempt++) {
    try {
      return await runBookTicketOnce(shift, {
        maxWaitTime,
        onWait: options.onWait,
      })
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt > retryTimes) {
        throw lastError
      }

      options.onRetry?.(attempt, lastError)
      appService.passengerManager.limitTickets = []
      appService.passengerManager.clearCache()
      await sleep(1000)
    }
  }

  clearInterval(timer)

  throw lastError ?? new Error('预定失败')
}

const waitToSubmitOrder = async (shift: Shift, options: BookTicketOptions) => {
  try {
    if (shift.tip.includes('起售')) {
      const bookTime = parseTime(shift.trainDate, shift.tip).getTime()

      await sleep(Math.max(bookTime - Date.now() - 1000, 0))

      const searchForm = getSearchForm()
      options.maxWaitTime = options.maxWaitTime ?? 60
      for (let i = 0; i < options.maxWaitTime; i++) {
        const newShift = await appService.queryTickets({
          to: searchForm.destination,
          from: searchForm.departure,
          toDate: searchForm.date,
        })

        const targetShift = newShift.find((item) => item.trainNo === shift.trainNo)
        if (targetShift && !targetShift.tip.includes('起售')) {
          throw new Error('success')
        }

        await sleep(100)
      }

      throw new Error('未等到车票开始发售')
    } else {
      return await appService.submitOrderRequest(shift)
    }
  } catch (e: any) {
    if (e.message === 'success') {
      return await appService.submitOrderRequest(shift)
    }
    throw e
  }
}

const runBookTicket = async (
  shift: Shift,
  options: Required<Pick<BookTicketOptions, 'maxWaitTime'>> & Pick<BookTicketOptions, 'onWait'>,
): Promise<BookTicketResult> => {
  await appService.initDc(shift)

  appService.passengerManager.limitTickets = []
  appService.passengerManager.clearCache()
  passengerManager.passengerDatas.forEach((config) => {
    appService.pushPassenger(config.index, config.seatType, config.ticketType)
  })

  await appService.checkOrderInfo()
  await appService.getQueueCount(shift)
  await appService.confirmSingleForQueue()

  for (let waitedSeconds = 1; waitedSeconds <= options.maxWaitTime; waitedSeconds++) {
    await sleep(1000)

    const orderId = await appService.queryOrderWaitTime()

    if (orderId) {
      console.log('抢票成功,订单号', orderId)
      return {
        orderId,
        waitedSeconds,
      }
    }
  }

  throw new Error('等待订单结果超时')
}

const bookTicketBatch = async (
  shifts: Shift[],
  maxWaitTimeOrOptions: number | BookTicketOptions = 60,
) => {
  if (appService.passengerManager.passengerDatas.length === 0) {
    throw new Error('请先选择乘车人')
  }
  const options: BookTicketOptions =
    typeof maxWaitTimeOrOptions === 'number'
      ? { maxWaitTime: maxWaitTimeOrOptions }
      : maxWaitTimeOrOptions

  const maxWaitTime = options.maxWaitTime ?? 60
  const retryTimes = options.retryTimes ?? 1
  let lastError: Error | null = null
  let waitedSeconds = 0
  let timer: number | null = null

  const startTimer = () => {
    if (timer) clearInterval(timer)
    timer = window.setInterval(() => {
      options.onWait?.(waitedSeconds)
      waitedSeconds++
    }, 1000)
  }

  const stopTimer = () => {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  startTimer()
  let attempt = 1
  try {
    for (; attempt <= retryTimes; attempt++) {
      const requests = shifts.map((shift) =>
        waitToSubmitOrder(shift, options)
          .then((res) => {
            return {
              success: true,
              data: res,
              shift: shift,
            }
          })
          .catch((error) => Promise.reject({ shift, error })),
      )
      try {
        const result = await raceSuccess<{
          success: boolean
          data: any
          shift: Shift
        }>(requests)
        bus.emit('shift:start:book', {
          type: 'shift:start:book',
          data: result.shift,
        })
        const bookResult = await runBookTicket(result.shift, {
          maxWaitTime,
          onWait: options.onWait,
        })
        await notify('抢票成功', '订单号:' + bookResult.orderId)
        return {
          ...bookResult,
          shift: result.shift,
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        if (attempt > retryTimes) {
          throw lastError
        }

        options.onRetry?.(attempt, lastError)
        appService.passengerManager.limitTickets = []
        appService.passengerManager.clearCache()
        await sleep(1000)
      }
    }
  } catch (error) {
    lastError = error instanceof Error ? error : new Error(String(error))
    console.log(`第 ${attempt} 次尝试失败:`, lastError.message)

    if (attempt > retryTimes) {
      throw lastError
    }

    // 重试前的清理
    options.onRetry?.(attempt, lastError)
    appService.passengerManager.limitTickets = []
    appService.passengerManager.clearCache()

    // 重置状态
    waitedSeconds = 0
    startTimer()

    await sleep(1000)
  } finally {
    stopTimer()
  }

  throw lastError ?? new Error('预定失败')
}

export { bookTicket, bookTicketBatch }

const isLogin = async () => {
  const res = await appService.checkLoginState()
  return res
}

const logout = () => {
  localStorage.removeItem('apptk')
  bus.emit('user:logout')
}

export { isLogin, logout }

const init = async () => {
  await appService.loginConfig()
  // await appService.uamtkStatic()
}

export { init }
