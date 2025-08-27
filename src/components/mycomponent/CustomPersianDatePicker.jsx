import React from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
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

const CustomPersianDatePicker = ({ value, onChange }) => {
  return (
    <>
      <DatePicker
        value={value}
        onChange={onChange}
        calendar={persian}
        locale={persian_dari}
        format="YYYY-MM-DD HH:mm:ss a"
        plugins={[<TimePicker position="bottom" />]}
        renderMonth={(date) => persian_dari.months[date.month.index][1]} // full month name
        weekDayFormat={(dayIndex) => persian_dari.weekDays[dayIndex][1]} // full weekday names
        inputClass="w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        containerClass="w-full z-50"
      />
      <style jsx>{`
        /* Add gap between weekday names */
        .rmdp-week-day {
          text-align: center;
          margin: 0.7rem; /* horizontal gap */
        }
        .rmdp-container {
          display: block !important;
          width: 100% !important;
        }

        /* Make the actual input stretch */
        .rmdp-input {
          width: 100% !important;
        }

        /* Optional: bigger header */
      `}</style>
    </>
  );
};

export default CustomPersianDatePicker;
