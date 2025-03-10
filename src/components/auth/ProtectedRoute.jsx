import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state)=>state.auth);
  const token = localStorage.getItem('token'); 


  if (!isAuthenticated || !token) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
