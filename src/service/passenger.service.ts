const ticket_submit_order = {
  ticket_type: {
    adult: '1',
    child: '2',
    student: '3',
    disability: '4',
  },
  ticket_type_name: {
    '1': '成人票',
    '2': '孩票',
    '3': '学生票',
    '4': '伤残军人票',
  },
  tour_flag: {
    dc: 'dc',
    wc: 'wc',
    fc: 'fc',
    gc: 'gc',
    lc: 'lc',
    lc1: 'l1',
    lc2: 'l2',
  },
  passenger_type: {
    adult: '1',
    child: '2',
    student: '3',
    disability: '4',
  },
  passenger_card_type: {
    two: '1',
    one: '2',
    tmp: '3',
    passport: 'B',
    work: 'H',
    hongkong_macau: 'C',
    taiwan: 'G',
  },
  request_flag: {
    isAsync: '1',
  },
  ticket_query_flag: {
    query_commom: '00',
    query_student: '0X00',
  },
  seatType: {
    yz_type: '1',
  },
  ref_res_rules: {
    '4': [
      {
        refund_rule: '20%',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '30%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '50%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '不允许',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
    '5': [
      {
        refund_rule: '10%',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '15%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '25%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '40%',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
    '6': [
      {
        refund_rule: '10%',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '15%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '25%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '40%',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
    '7': [
      {
        refund_rule: '5%',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '10%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '15%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '30%',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
    '8': [
      {
        refund_rule: '5%',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '10%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '15%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '30%',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
    '9': [
      {
        refund_rule: '免费',
        res_rule: '免费',
        title: 'bt_15d',
      },
      {
        refund_rule: '5%',
        res_rule: '5%',
        title: '48h_15d',
      },
      {
        refund_rule: '10%',
        res_rule: '10%',
        title: '24h_48H',
      },
      {
        refund_rule: '20%',
        res_rule: '20%',
        title: 'lt_24h',
      },
    ],
  },
  special_areas: {
    lso: 'LSO',
    dao: 'DAO',
    ado: 'ADO',
    nqo: 'NQO',
    tho: 'THO',
  },
}

const ticket_seat_codeMap = {
  '1': [
    {
      end_station_name: null,
      end_time: null,
      id: 'O',
      start_station_name: null,
      start_time: null,
      value: '二等座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'M',
      start_station_name: null,
      start_time: null,
      value: '一等座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: '9',
      start_station_name: null,
      start_time: null,
      value: '商务座',
    },
  ],
  '2': [
    {
      end_station_name: null,
      end_time: null,
      id: '9',
      start_station_name: null,
      start_time: null,
      value: '商务座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'M',
      start_station_name: null,
      start_time: null,
      value: '一等座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'O',
      start_station_name: null,
      start_time: null,
      value: '二等座',
    },
  ],
  '3': [
    {
      end_station_name: null,
      end_time: null,
      id: 'O',
      start_station_name: null,
      start_time: null,
      value: '二等座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'M',
      start_station_name: null,
      start_time: null,
      value: '一等座',
    },
  ],
  '4': [
    {
      end_station_name: null,
      end_time: null,
      id: '9',
      start_station_name: null,
      start_time: null,
      value: '商务座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'M',
      start_station_name: null,
      start_time: null,
      value: '一等座',
    },
    {
      end_station_name: null,
      end_time: null,
      id: 'O',
      start_station_name: null,
      start_time: null,
      value: '二等座',
    },
  ],
}

const D = [
  {
    end_station_name: null,
    end_time: null,
    id: '1',
    start_station_name: null,
    start_time: null,
    value: '成人票',
  },
  {
    end_station_name: null,
    end_time: null,
    id: '2',
    start_station_name: null,
    start_time: null,
    value: '儿童票',
  },
  {
    end_station_name: null,
    end_time: null,
    id: '3',
    start_station_name: null,
    start_time: null,
    value: '学生票',
  },
  {
    end_station_name: null,
    end_time: null,
    id: '4',
    start_station_name: null,
    start_time: null,
    value: '残军票',
  },
]

const init_cardTypes = [
  {
    end_station_name: null,
    end_time: null,
    id: '1',
    start_station_name: null,
    start_time: null,
    value: '居民身份证',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'K',
    start_station_name: null,
    start_time: null,
    value: '港澳居民居住证',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'P',
    start_station_name: null,
    start_time: null,
    value: '台湾居民居住证',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'H',
    start_station_name: null,
    start_time: null,
    value: '外国人永久居留身份证',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'A',
    start_station_name: null,
    start_time: null,
    value: '外国护照',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'B',
    start_station_name: null,
    start_time: null,
    value: '中国护照',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'C',
    start_station_name: null,
    start_time: null,
    value: '港澳居民来往内地通行证',
  },
  {
    end_station_name: null,
    end_time: null,
    id: 'G',
    start_station_name: null,
    start_time: null,
    value: '台湾居民来往大陆通行证',
  },
]

const V = {
  '1': 97,
  '2': 96,
  '3': 98,
  '4': 95,
  '6': 90,
  '7': 94,
  '8': 93,
  '9': 92,
  O: 100,
  M: 99,
  P: 91,
  F: 89,
  A: 88,
  H: 87,
}

class Ticket {
  // 将原函数的参数列表直接迁移到 constructor 中
  only_id: string
  seat_type: string
  seat_type_name: string
  ticket_type: string
  ticket_type_name: string
  name: string
  id_type: string
  id_type_name: string
  id_no: string
  allEncStr: string

  // --- 2. 补全缺失的属性 (根据 constructor 中的赋值推断) ---
  phone_no: string
  passenger_type: any // 可能是 string 或 number
  seatTypes: any[] // 这是一个数组，且调用了 sort
  ticketTypes: any // 引用了外部变量 D
  cardTypes: any // 引用了外部变量 init_cardTypes
  save_status: any
  tour_flag: any
  isDisabled: boolean
  isDefaultUsed: boolean
  checkboxStatus: any
  isAccompanyChild: any
  gat_born_date: string
  born_date: string // 会被赋值为 "Y2", "Y3", "N"
  // @ts-ignore
  constructor(aE, aB, aJ, aG, aH, aT, aP, aM, aI, aS, aK, aR, aA, aL, aC, aQ, aD, aO, aF) {
    // --- 原有逻辑处理 ---
    // 这里的逻辑保持不变，仅为了可读性优化了局部变量名
    let birthDateStr = aO.replace('-', '').replace('-', '')
    var age = Ticket.jsGetAge(birthDateStr, window.ticketInfo.queryLeftTicketRequestDTO.train_date)

    // --- 属性赋值 ---
    this.only_id = aE
    this.seat_type = aB
    this.seat_type_name = aJ
    this.ticket_type = aG
    this.ticket_type_name = aH
    this.name = aT
    this.id_type = aP
    this.id_type_name = aM
    this.id_no = aI
    this.allEncStr = aS
    this.phone_no = aK
    this.passenger_type = aC

    // 依赖外部全局变量的逻辑保持不变
    this.seatTypes =
      // @ts-ignore
      ticket_seat_codeMap[
        this.ticket_type == '' ? ticket_submit_order.ticket_type.adult : this.ticket_type
      ]
    this.seatTypes.sort(Ticket.ah)
    this.ticketTypes = D
    this.cardTypes = init_cardTypes

    this.save_status = aR
    this.tour_flag = aA
    this.isDisabled = aC == ticket_submit_order.ticket_type.student ? true : aL
    this.isDefaultUsed = false
    this.checkboxStatus = aQ

    // --- 条件逻辑与属性设置 ---
    if (aD) {
      this.isAccompanyChild = aD
    } else {
      // 注意：原代码中这里给局部变量 aD 赋值，对外部无影响，此处保留逻辑
      aD = false
    }

    this.gat_born_date = aO
    this.born_date = aF

    // 复杂的日期类型判断逻辑
    if (age >= 14 && age <= 28 && aC == 1 && aP != 'B' && aP != 'A') {
      this.born_date = 'Y2'
    } else {
      if (age >= 60 && aP != 'B' && aP != 'A') {
        this.born_date = 'Y3'
      } else {
        this.born_date = 'N'
      }
    }
  }

  // --- 方法定义 ---
  // 将原来的 this.toString = function() {...} 提取为类的方法
  toString() {
    return this.name + '_' + this.id_type + '_' + this.id_no + '_' + this.phone_no
  }

  // @ts-ignore
  static jsGetAge(d, j) {
    var a
    var l = d.substring(0, 4)
    var e = d.substring(4, 6)
    var k = d.substring(6, 8)
    var b = j.substring(0, 4)
    var c = j.substring(4, 6)
    var i = j.substring(6, 8)
    if (b == l) {
      a = 0
    } else {
      var g = b - l
      if (g > 0) {
        if (c == e) {
          var f = i - k
          if (f <= 0) {
            a = g - 1
          } else {
            a = g
          }
        } else {
          var h = c - e
          if (h < 0) {
            a = g - 1
          } else {
            a = g
          }
        }
      } else {
        a = -1
      }
    }
    return a
  }

  // @ts-ignore
  n(aD, aB, aA) {
    var aC = this.ab(aD, aB, aA)
    return aC
  }

  // @ts-ignore
  ab(aD, aC, aA) {
    var aB = Ticket.b(aD)
    if (window.ticketInfo.purpose_codes == ticket_submit_order.ticket_query_flag.query_student) {
      return ticket_submit_order.ticket_type.student
    } else {
      if (aD == ticket_submit_order.passenger_type.disability) {
        var aE = '1'
        if (
          aE != ticket_submit_order.passenger_card_type.two ||
          aC != ticket_submit_order.passenger_card_type.two
        ) {
          return ticket_submit_order.ticket_type.adult
        } else {
          return aB
        }
      } else {
        return aB == '' ? (aA == '' ? ticket_submit_order.ticket_type.adult : aA) : aB
      }
    }
  }

  // @ts-ignore
  static b(aA) {
    if (aA == ticket_submit_order.passenger_type.adult) {
      return ticket_submit_order.passenger_type.adult
    } else {
      if (aA == ticket_submit_order.passenger_type.child) {
        return ticket_submit_order.passenger_type.child
      } else {
        if (aA == ticket_submit_order.passenger_type.student) {
          return ticket_submit_order.passenger_type.student
        } else {
          if (aA == ticket_submit_order.passenger_type.disability) {
            return ticket_submit_order.passenger_type.disability
          } else {
            return ''
          }
        }
      }
    }
  }

  // @ts-ignore
  static ah(aD, aC) {
    // @ts-ignore
    var aB = V[aD.id]
    // @ts-ignore
    var aA = V[aC.id]
    if (!aB) {
      aB = 0
    }
    if (!aA) {
      aA = 0
    }
    if (aB < aA) {
      return 1
    } else {
      return -1
    }
  }

  // @ts-ignore
  static af(aB, aD, aA) {
    if ('1' == aD) {
      var aC = aB.substring(0, 2)
      if (aC == '81' || aC == '82') {
        return '港澳居民居住证'
      } else {
        if (!aA) {
          aA = ''
        } else {
          if (aC == '83') {
            return '台湾居民居住证'
          }
        }
      }
    } else {
      if ('A' == aD) {
        return '外国护照'
      } else {
        if ('B' == aD) {
          return '中国护照'
        }
      }
    }
    return aA
  }

  /**
   * 构建乘客票据字符串
   * 格式: seat_type,0,ticket_type,name,id_type,id_no,mobile,N,allEncStr
   * 多个乘客用 _ 分隔
   */
  getpassengerTickets(limit_tickets: any) {
    const ticketList: string[] = []
    for (const passenger of limit_tickets) {
      const seatType = passenger.seat_type || 'O'
      const ticketType = passenger.ticket_type || '1'
      const name = passenger.name || ''
      const idType = passenger.id_type || ''
      const idNo = passenger.id_no || ''
      const mobile = passenger.phone_no || ''
      const allEnc = passenger.allEncStr || ''

      // 格式: seat_type,0,ticket_type,name,id_type,id_no,mobile,N,allEncStr
      const fields = [seatType, '0', ticketType, name, idType, idNo, mobile, 'N']
      if (allEnc) {
        fields.push(allEnc)
      }
      ticketList.push(fields.join(','))
    }
    return ticketList.join('_')
  }

  /**
   * 构建老乘客字符串
   * 格式: name,id_type,id_no,ticket_type_
   * 多个乘客直接连接（无分隔符）
   */
  getOldPassengers(limit_tickets: any, passengers: any[], tour_flag: string = 'dc') {
    const oldPassengerList: string[] = []

    for (const passenger of limit_tickets) {
      if (tour_flag === 'fc' || tour_flag === 'gc') {
        // 往返程格式
        const str = `${passenger.name},${passenger.id_type},${passenger.id_no},${passenger.passenger_type}_`
        oldPassengerList.push(str)
      } else {
        // 单程格式
        if (passenger.only_id && passenger.only_id.indexOf('djPassenger_') > -1) {
          // 常用联系人跳过
          continue
        } else if (passenger.only_id && passenger.only_id.indexOf('normalPassenger_') > -1) {
          const index = passenger.only_id.split('_')[1]
          const p = passengers[index]
          if (p) {
            const str = `${p.passenger_name},${p.passenger_id_type_code},${p.passenger_id_no},${p.passenger_type}_`
            oldPassengerList.push(str)
          }
        } else {
          // 新乘客，格式为 "_ "
          oldPassengerList.push('_ ')
        }
      }
    }

    return oldPassengerList.join('')
  }
}

interface Passenger {
  passenger_name: string
  sex_code: string
  sex_name: string
  born_date: string
  country_code: string
  passenger_id_type_code: string
  passenger_id_type_name: string
  passenger_id_no: string
  passenger_type: string
  passenger_type_name: string
  mobile_no: string
  phone_no: string
  email: string
  address: string
  postalcode: string
  first_letter: string
  recordCount: string
  isUserSelf: string
  total_times: string
  index_id: string
  allEncStr: string
  isAdult: string
  isYongThan10: string
  isYongThan14: string
  isOldThan60: string
  if_receive: string
  is_active: string
  is_buy_ticket: string
  last_time: string
  passenger_uuid: string
  if_preferential: string
  mobile_code: string
  temporay_age60: string
  gat_born_date: string
  gat_valid_date_start: string
  gat_valid_date_end: string
  gat_version: string
}
interface Cache {
  oldPassengers: {
    [key: string]: string
  }
  passengerTickets: string
}
class PassengerManager {
  passengers: Passenger[] = []
  limitTickets: Ticket[] = []
  ticketInfo: any

  cache: Cache = {
    passengerTickets: '',
    oldPassengers: {
      fc: '',
      gc: '',
      dc: '',
    },
  }

  ticketTypes: Record<string, string> = {
    '1': '成人票',
    '2': '儿童票',
    '3': '学生票',
    '4': '残疾人票',
  }

  setPassengers(passengers: Passenger[]) {
    this.passengers = passengers
  }

  setTicketInfo(ticketInfo: any) {
    this.ticketInfo = ticketInfo
    window.ticketInfo = ticketInfo
  }

  pushPassenger(index: number, seatType: string = 'O', ticketType: number) {
    if (
      this.limitTickets.find((passenger) => passenger.name == this.passengers[index].passenger_name)
    )
      return
    var aI: string = `normalPassenger_${index}`
    var aH = this.limitTickets.length
    if (aH >= 19) {
      return
    }
    // @ts-ignore
    var aO = this.passengers[aI.split('_')[1]]
    var aK = new Ticket(
      aI,
      seatType, // 设置座位类型
      '',
      ticketType,
      this.ticketTypes[ticketType],
      aO.passenger_name,
      aO.passenger_id_type_code,
      Ticket.af(aO.passenger_id_no, aO.passenger_id_type_code, aO.passenger_id_type_name),
      aO.passenger_id_no,
      aO.allEncStr,
      aO.mobile_no,
      '',
      window.ticketInfo.tour_flag,
      true,
      aO.passenger_type,
      false,
      '',
      aO.gat_born_date,
      aO.born_date,
    )
    console.log(aK)
    this.limitTickets.push(aK)
    this.cache = {
      passengerTickets: '',
      oldPassengers: {
        fc: '',
        gc: '',
        dc: '',
      },
    }
  }

  /**
   * 构建乘客票据字符串
   * 格式: seat_type,0,ticket_type,name,id_type,id_no,mobile,N,allEncStr
   * 多个乘客用 _ 分隔
   */
  getpassengerTickets() {
    if (this.cache.passengerTickets) {
      return this.cache.passengerTickets
    }
    const ticketList: string[] = []
    for (const passenger of this.limitTickets) {
      const seatType = passenger.seat_type || 'O'
      const ticketType = passenger.ticket_type || '1'
      const name = passenger.name || ''
      const idType = passenger.id_type || ''
      const idNo = passenger.id_no || ''
      const mobile = passenger.phone_no || ''
      const allEnc = passenger.allEncStr || ''

      // 格式: seat_type,0,ticket_type,name,id_type,id_no,mobile,N,allEncStr
      const fields = [seatType, '0', ticketType, name, idType, idNo, mobile, 'N']
      if (allEnc) {
        fields.push(allEnc)
      }
      ticketList.push(fields.join(','))
    }
    const passengerTickets = ticketList.join('_')
    this.cache.passengerTickets = passengerTickets
    return passengerTickets
  }

  /**
   * 构建老乘客字符串
   * 格式: name,id_type,id_no,ticket_type_
   * 多个乘客直接连接（无分隔符）
   */
  getOldPassengers(tour_flag: string = 'dc') {
    // 缓存,tour_flag
    if (this.cache.oldPassengers[tour_flag]) {
      return this.cache.oldPassengers[tour_flag]
    }
    const oldPassengerList: string[] = []

    for (const passenger of this.limitTickets) {
      if (tour_flag === 'fc' || tour_flag === 'gc') {
        // 往返程格式
        const str = `${passenger.name},${passenger.id_type},${passenger.id_no},${passenger.passenger_type}_`
        oldPassengerList.push(str)
      } else {
        // 单程格式
        if (passenger.only_id && passenger.only_id.indexOf('djPassenger_') > -1) {
          // 常用联系人跳过
          continue
        } else if (passenger.only_id && passenger.only_id.indexOf('normalPassenger_') > -1) {
          const index = Number(passenger.only_id.split('_')[1])
          const p = this.passengers[index]
          if (p) {
            const str = `${p.passenger_name},${p.passenger_id_type_code},${p.passenger_id_no},${p.passenger_type}_`
            oldPassengerList.push(str)
          }
        } else {
          // 新乘客，格式为 "_ "
          oldPassengerList.push('_ ')
        }
      }
    }
    const oldPassenger = oldPassengerList.join('')
    this.cache.oldPassengers[tour_flag] = oldPassenger

    return oldPassenger
  }
}

export { PassengerManager, type Passenger, Ticket, ticket_submit_order }
