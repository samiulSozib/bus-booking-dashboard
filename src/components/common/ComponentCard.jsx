import { useTranslation } from "react-i18next";
import {
  Bus,
} from "../../icons";
const ComponentCard = ({
  title,
  className = "",
  value = "",
  icon: Icon = Bus,
  bgClass = "bg-white dark:bg-white/[0.03]" // default
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-800 ${bgClass} ${className} sm:h-[120px] h-[90px]`}
    >
      <div className="flex items-center justify-between px-6 py-5">
        <div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            {t(title)}
          </h3>
          {value && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {value}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
};


export default ComponentCard;