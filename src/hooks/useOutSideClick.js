import { useEffect } from "react";

export default function useOutsideClick(ref, callback) {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            callback();
        };

        // Use capture phase to catch events before they bubble up
        document.addEventListener("mousedown", handleClickOutside, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside, true);
        };
    }, [ref, callback]);
}