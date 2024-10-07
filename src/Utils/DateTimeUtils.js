import { Timestamp } from "firebase/firestore";
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



export const formatFirebaseDates = (date) => {
  // Check if date is a Firestore Timestamp, and convert it to a JavaScript Date
  if (date instanceof Timestamp) {
    date = date.toDate();
  } else if (typeof date === 'number') {
    // If it's a timestamp (number), convert to Date
    date = new Date(date);
  } else if (typeof date === 'string') {
    // Check if the string can be parsed into a valid date
    const parsedDate = Date.parse(date);
    if (!isNaN(parsedDate)) {
      date = new Date(parsedDate);
    } else {
      date = null; // Handle invalid date strings
    }
  }

  // Check if 'date' is a valid Date object, otherwise handle it as an invalid date
  const isValidDate = date instanceof Date && !isNaN(date.getTime());

  // Only pass a valid date to gregorianToJalali, otherwise display an error or fallback
  const jalaliDate = isValidDate
    ? shamsi.gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate()).join('/')
    : 'Invalid Date';

  return jalaliDate
}

export const convertFirebaseDatesToDate = (date) => {
  // Check if date is a Firestore Timestamp, and convert it to a JavaScript Date
  if (date instanceof Timestamp) {
    date = date.toDate();
  } else if (typeof date === 'number') {
    // If it's a timestamp (number), convert to Date
    date = new Date(date);
  } else if (typeof date === 'string') {
    // Check if the string can be parsed into a valid date
    const parsedDate = Date.parse(date);
    if (!isNaN(parsedDate)) {
      date = new Date(parsedDate);
    } else {
      date = null; // Handle invalid date strings
    }
  }
  return date
}






export function getTotalMonthsBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();

  // Calculate total months
  let totalMonths = (yearsDiff * 12) + monthsDiff;

  // Adjust if the end day is before the start day
  if (end.getDate() < start.getDate()) {
    totalMonths -= 1;
  }

  return totalMonths;
}


export function getMonthsBetweenDates(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const result = [];

  // Create a loop to iterate through months
  let current = new Date(start);

  while (current <= end) {
    result.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1, // Months are zero-based in JS, so add 1,
      day: current.getDate()
    });

    // Move to the next month
    current.setMonth(current.getMonth() + 1);
  }

  return result;
}




