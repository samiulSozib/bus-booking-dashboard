import { Link } from "react-router-dom"; // Assuming you're using React Router
import { Home } from "../../icons";

const Breadcrumb = ({ paths }) => {
  return (
    <nav className="bg-gray-100 p-4 rounded-lg flex items-center space-x-3">
      {/* Home Icon */}
      <Link to="/" className="text-gray-500 hover:text-gray-700">
        <Home className="w-5 h-5" />
      </Link>

      {/* Dynamic Breadcrumb Items */}
      {paths.map((path, index) => (
        <div key={index} className="flex items-center space-x-3">
          <span className="text-gray-400">›</span>
          {index === paths.length - 1 ? (
            <span className="text-gray-700 font-semibold">{path.label}</span>
          ) : (
            <Link
              to={path.href}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              {path.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
