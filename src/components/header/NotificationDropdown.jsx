import { useState } from "react";
// import { Dropdown } from "../ui/dropdown/Dropdown";
// import { DropdownItem } from "../ui/dropdown/DropdownItem";
// import { Link } from "react-router";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  // function closeDropdown() {
  //   setIsOpen(false);
  // }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M27.6001 23.1667L29.1001 24.675C29.4853 25.0666 29.5985 25.6508 29.3877 26.1581C29.1768 26.6653 28.6827 26.9969 28.1334 27H25.3334V27.2834C25.2523 29.0448 23.7617 30.4087 22.0001 30.3334C20.2384 30.4087 18.7478 29.0448 18.6667 27.2834V27H15.8667C15.3174 26.9969 14.8233 26.6653 14.6125 26.1581C14.4016 25.6508 14.5149 25.0666 14.9001 24.675L16.4001 23.1667V19.275C16.403 17.6593 17.1016 16.1232 18.3173 15.059C19.5331 13.9948 21.1482 13.5057 22.7501 13.7167C25.5713 14.1491 27.6413 16.5961 27.6001 19.45V23.1667ZM22.0001 28.6667C22.8362 28.7257 23.5707 28.1161 23.6667 27.2834V27H20.3334V27.2834C20.4294 28.1161 21.1639 28.7257 22.0001 28.6667Z" fill="#637381"/>
        </svg>

      </button>
      
    </div>
  );
}
