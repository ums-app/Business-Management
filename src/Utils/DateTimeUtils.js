import { t } from "i18next"
import * as shamsi from 'shamsi-date-converter';


export function timeSince(date) {
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)

  let interval = Math.floor(seconds / 31536000)
  if (interval >= 1) {
    return `${interval} ${t("passedYear")}`
  }

  interval = Math.floor(seconds / 2592000)
  if (interval >= 1) {
    return `${interval} ${t("passedMonth")}`
  }

  interval = Math.floor(seconds / 86400)
  if (interval >= 1) {
    return `${interval} ${t("passedDay")}`
  }

  interval = Math.floor(seconds / 3600)
  if (interval >= 1) {
    return `${interval} ${t("passedHour")}`
  }

  interval = Math.floor(seconds / 60)
  if (interval >= 1) {
    return `${interval} ${t("passedMinute")}`
  }

  return t("justNow")
}

export function getTheMonthDays(date) {
  const year = date.getFullYear() // gets the current year
  const month = date.getMonth() // gets the current month (0-11)
  const daysInMonth = new Date(year, month + 1, 0).getDate() // gets the number of days in the current month
  return daysInMonth
}

export function formatTime(time) {
  const hour = time.substring(0, 2);
  const minutes = time.substring(3, 5);
  let timesec = 'am';
  if (hour > 12) {
    timesec = 'pm';
    hour = hour - 12;
  }
  return `${hour}:${minutes} ${timesec}`
}

export function formatDate(date) {
  console.log(date)
  const year = date.getFullYear();
  let month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() returns month from 0-11
  let day = String(date.getDate()).padStart(2, '0');
  let formattedDate = `${year}-${Number.parseInt(month) < 10 ? '0' : ''}${Number.parseInt(month)}-${Number.parseInt(day) < 10 ? '0' : ''}${Number.parseInt(day)}`;
  console.log(formattedDate)
  return formattedDate;
}

export const WeekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

// this function takes a persian date string in 'yyyy-mm-dd' format and convert it to 
// Gregorian date with 'yyyy-mm-dd' format
export function persianDateToGregorian(date) {
  if (!date || date.length == 0) return;

  const dateSplit = date.split('-')
  const year = + dateSplit[0];
  const month = + dateSplit[1];
  const day = + dateSplit[2];
  const res = shamsi.jalaliToGregorian(year, month, day)
  res[1] = res[1] < 10 ? "0" + res[1] : res[1];
  res[2] = res[2] < 10 ? "0" + res[2] : res[2];

  return res.join('-');
}

shamsi.jalaliToGregorian()



