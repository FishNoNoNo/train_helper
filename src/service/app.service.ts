import HttpClient from '@/utils/request'
import TrainService from './train.service'
import bus from '@/lib/utils/eventBus'
import type { Shift } from '@/types/train.d'
import { today } from '@/lib/utils/time'
import cookieJar from '@/utils/cookieJar'
import { PassengerManager } from './passenger.service'
import { Parser } from '@/utils/parse'
import { getTimestamp } from '@/utils/time'

class AppService {
  private baseUrl: string = 'https://kyfw.12306.cn'
  private baseHeaders = {
    'user-agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 Edg/147.0.0.0',
  }

  private buildUrl(path: string) {
    return `${this.baseUrl}${path}`
  }

  private passengerManager = new PassengerManager()
  private parser = new Parser()

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

  async checkLoginState() {
    const apptk = localStorage.getItem('apptk')
    if (!apptk) {
      bus.emit('user:logout')
      return
    }
    const url = this.buildUrl('/otn/index/initMy12306Api')
    const res = await HttpClient.get(url, {
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
        Cookie: HttpClient.buildCookies({
          tk: apptk,
        }),
      },
      authRequired: true,
    })
    console.log(res)
    const userName = res.data.user_name
    if (userName) {
      bus.emit('user:set', {
        type: 'user:set',
        data: {
          userName,
        },
      })
    }
    console.log(res)
    return res.data
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
    const res = await HttpClient.get(url, {
      params: params,
      headers: {
        ...this.baseHeaders,
        Referer: 'https://kyfw.12306.cn/otn/resources/login.html',
        Origin: 'https://kyfw.12306.cn',
        Host: 'kyfw.12306.cn',
      },
      authRequired: true,
    })
    // console.log(cookieJar.getAllCookies())
    console.log(res)
    return res.data
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
    const ticketInfo = this.parser.extractAndParseJsObject(resData, 'ticketInfoForPassengerForm')
    this.passengerManager.setTicketInfo(ticketInfo)
    return resData
  }

  async checkOrderInfo() {
    const url = this.buildUrl('/otn/confirmPassenger/checkOrderInfo')
    // console.log(cookieJar.getAllCookies())
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')

    // 构建请求参数，参考 12306FairTicket 项目格式
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
      throw new Error('checkOrderInfo失败')
    }
    return resData
  }

  async getQueueCount(shift: Shift, seatType: string) {
    const globalRepeatSubmitToken = localStorage.getItem('globalRepeatSubmitToken')
    const url = this.buildUrl('/otn/confirmPassenger/getQueueCount')
    const queryDto = this.passengerManager.ticketInfo.queryLeftTicketRequestDTO || {}
    const data = {
      train_date: this.parser.parseDateTime(shift.trainDate),
      train_no: queryDto.train_no || shift.trainNo,
      stationTrainCode: queryDto.station_train_code || shift.stationTrainCode,
      seatType: seatType,
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
      throw new Error('getQueueCount失败')
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
      choose_seats: '1C',
      seatDetailType: '000',
      is_jy: 'N',
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
      throw new Error('confirmSingleForQueue失败')
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
      return null
    }
    return resData
  }
}

const appService = new AppService()

export default appService
