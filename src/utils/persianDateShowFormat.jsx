import React from "react";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";

const persian_dari = {
  name: "persian_dari",
  months: [
    ["حمل", "فروردین"],
    ["ثور", "اردیبهشت"],
    ["جوزا", "خرداد"],
    ["سرطان", "تیر"],
    ["اسد", "مرداد"],
    ["سنبله", "شهریور"],
    ["میزان", "مهر"],
    ["عقرب", "آبان"],
    ["قوس", "آذر"],
    ["جدی", "دی"],
    ["دلو", "بهمن"],
    ["حوت", "اسفند"],
  ],
  weekDays: [
    ["Sat", "شنبه"],
    ["Sun", "یک‌شنبه"],
    ["Mon", "دو‌شنبه"],
    ["Tue", "سه‌شنبه"],
    ["Wed", "چهار‌شنبه"],
    ["Thu", "پنج‌شنبه"],
    ["Fri", "جمعه"],
  ],
  digits: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
  meridiems: [
    ["ق.ظ", "قبل‌ازظهر"],
    ["ب.ظ", "بعد‌ازظهر"],
  ],
};

const PersianDateText = ({ value }) => {
  if (!value) return "-"; // handle null

  const dateObj = new DateObject({
    date: new Date(value),   // or value if already Date
    calendar: persian,
    locale: persian_dari,
  });

  return <span>{dateObj.format("YYYY-MM-DD HH:mm:ss")}</span>;
};

export default PersianDateText;
