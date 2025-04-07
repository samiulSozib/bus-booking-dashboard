import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Internet } from "../../icons";

export default function Language() {
  const [isOpen, setIsOpen] = useState(false);
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const languagesWithFlags = [
    { name: "پښتو", language_code: "ps", flag: "https://flagcdn.com/w40/af.png" }, // Pashto (Afghanistan)
    { name: "English", language_code: "en", flag: "https://flagcdn.com/w40/us.png" }, // English (USA)
    { name: "Bangladesh", language_code: "bn", flag: "https://flagcdn.com/w40/bd.png" }, // Bengali (Bangladesh)
    { name: "Arabic", language_code: "ar", flag: "https://flagcdn.com/w40/sa.png" }, // Arabic (Saudi Arabia)
    { name: "Turkey", language_code: "tr", flag: "https://flagcdn.com/w40/tr.png" }, // Turkish (Turkey)
    { name: "فارسی", language_code: "fa", flag: "https://flagcdn.com/w40/ir.png" }, // Persian (Iran)

  ];



  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function handleLanguageChange(lang) {
    i18n.changeLanguage(lang);
    setIsOpen(false);
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        <Internet className="w-[28px] h-[28px]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50 ${
            i18n.dir() === "rtl" ? "right-0" : "left-0" // Adjust positioning for RTL
          }`}
          style={{ direction: "ltr" }} // Ensure dropdown content is LTR
        >
          <ul className="py-2">
            {languagesWithFlags?.map((lang) => (
              <li
                key={lang.name}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleLanguageChange(lang.language_code)}
              >
                <div className="flex flex-row gap-3 justify-between">
                  <span>{lang.name}</span>
                  <img className="rounded-md w-8 h-6" src={lang.flag} alt="" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}