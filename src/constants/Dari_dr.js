"use strict"; function e(e) { return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e }
var t = e({
    name: "persian_fa",
    months: [
        ["حمل", "حم"],  // Farvardin
        ["ثور", "ثو"],  // Ordibehesht
        ["جوزا", "جو"],  // Khordad
        ["سرطان", "سر"],  // Tir
        ["اسد", "اس"],  // Mordad
        ["سنبله", "سن"],  // Shahrivar
        ["میزان", "می"],  // Mehr
        ["عقرب", "عق"],  // Aban
        ["قوس", "قو"],  // Azar
        ["جدی", "جد"],  // Dey
        ["دلو", "دل"],  // Bahman
        ["حوت", "حو"]   // Esfand
    ],
    weekDays: [
        ["شنبه", "شن"],
        ["یکشنبه", "یک"],
        ["دوشنبه", "دو"],
        ["سه‌شنبه", "سه"],
        ["چهارشنبه", "چهار"],
        ["پنجشنبه", "پنج"],
        ["جمعه", "جم"]
    ],
    digits: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
    meridiems: [["قبل از ظهر", "ق.ظ"], ["بعد از ظهر", "ب.ظ"]]
});
module.exports = t;