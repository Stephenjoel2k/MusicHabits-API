const format = (time) => {
  const timestamp = {
    year: '',
    month: '',
    date: '',
    hour: '',
    minutes: '',
    seconds: '',
    ms: ''
  }
  for(i=0;i<time.length;i++){
    if(i < 4){
      timestamp.year += time[i]
    }
    if(i > 4 && i < 7){
      timestamp.month += time[i]
    }
    if(i > 7 && i < 10){
      timestamp.date += time[i]
    }
    if(i > 10 && i < 13){
      timestamp.hour += time[i]
    }
    if(i > 13 && i < 16){
      timestamp.minutes += time[i]
    }
    if(i > 16 && i < 19){
      timestamp.seconds += time[i]
    }
    if(i > 19 && i < 23){
      timestamp.ms += time[i]
    }
  }
  return timestamp
}

const equals = (time1, time2) => {
  if(time1.date == time2.date
    && time1.hour == time2.hour
    && time1.minutes == time2.minutes
    && time1.seconds == time2.seconds){
      return true;
  }
  else{
    return false;
  }
}

//True if T1 < T2 || T2 > T1
//False if T1 > T2 && T2 < T1 || T1 == T2
const after = (time1, time2) => {
  if(time1.year < time2.year) return true;
  else if(time1.year == time2.year){
    if(time1.month < time2.month) return true;
    else if(time1.month == time2.month) {
      if(time1.date < time2.date) return true;
      else if(time1.date == time2.date){
        if(time1.hour < time2.hour) return true;
        else if(time1.hour == time2.hour){
          if(time1.minutes < time2.minutes) return true;
          else if(time1.minutes == time2.minutes){
            if(time1.seconds < time2.seconds) return true;
            else return false;
          }
        }
      }
    }
  }
  else return false;
}


const time = {
  format,
  equals,
  after
}

module.exports = { time }
