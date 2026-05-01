import stations from '@/data/station'
import { Shift } from '@/types/train'

class TrainService {
  static nameToCode(name: string) {
    return stations[name].threeCode
  }

  parseSearchResult(res: any): Shift[] {
    try {
      const datas = res.data.result
      const map = res.data.map
      const result = []
      for (const item of datas) {
        const infos = (item as string).split('|')
        console.log(infos)
        const secretStr = infos[0]
        const tip = infos[1]
        const trainNo = infos[2]
        const stationTrainCode = infos[3]
        const startStationCode = infos[4]
        const endStationCode = infos[5]
        const fromStationCode = infos[6]
        const toStationCode = infos[7]
        const startTime = infos[8]
        const endTime = infos[9]
        const useTime = infos[10]
        const leftTicketStr = infos[12]
        const trainDate =
          infos[13].slice(0, 4) + '-' + infos[13].slice(4, 6) + '-' + infos[13].slice(6, 8)
        const locationCode = infos[15]
        const noSeat = infos[26]
        const hardSleeper = infos[28]
        const hardSeat = infos[29]
        const secondClass = infos[30]
        const firstClass = infos[31]
        const topGrade = infos[32]
        const softSleeper = infos[23]
        const seatDiscountInfo = infos[54]
          ? infos[13].slice(0, 4) + '-' + infos[13].slice(4, 6) + '-' + infos[13].slice(6, 8)
          : ''
        const dit = {
          secretStr: secretStr,
          tip: tip,
          trainNo: trainNo,
          stationTrainCode: stationTrainCode,
          startStationCode: startStationCode,
          endStationCode: endStationCode,
          fromStationCode: fromStationCode,
          toStationCode: toStationCode,
          startTime: startTime,
          endTime: endTime,
          useTime: useTime,
          leftTicketStr: leftTicketStr,
          trainDate: trainDate,
          locationCode: locationCode,
          seatDiscountInfo: seatDiscountInfo,
          fromPass: startStationCode !== fromStationCode,
          toPass: endStationCode !== toStationCode,
          fromStation: map[fromStationCode],
          toStation: map[toStationCode],
          seat: {
            noSeat: noSeat,
            hardSleeper: hardSleeper,
            hardSeat: hardSeat,
            secondClass: secondClass,
            firstClass: firstClass,
            topGrade: topGrade,
            softSleeper: softSleeper,
          },
        }
        result.push(dit)
      }
      return result
    } catch (error) {
      console.log(error)
      return []
    }
  }
}

const trainService = new TrainService()
export { trainService }

export default TrainService
