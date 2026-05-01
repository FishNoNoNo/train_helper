interface Seat {
  secondClass: string
  firstClass: string
  topGrade: string
  noSeat: string
  hardSeat: string
  hardSleeper: string
  softSleeper: string
}
export interface Shift {
  secretStr: string
  tip: string
  trainNo: string
  stationTrainCode: string
  startStationCode: string
  endStationCode: string
  fromStationCode: string
  toStationCode: string
  startTime: string
  endTime: string
  useTime: string
  leftTicketStr: string
  trainDate: string
  locationCode: string
  seatDiscountInfo: string
  fromPass: boolean
  toPass: boolean
  fromStation: string
  toStation: string
  seat: Seat
}
