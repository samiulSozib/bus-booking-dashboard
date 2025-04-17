import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import Country from "./pages/Location/Country/Country";
import Province from "./pages/Location/Province/Province";
import City from "./pages/Location/City/City";
import BusRoute from "./pages/Route/Route";
import Station from "./pages/Station/Station";
import User from "./pages/User/User";
import Bus from "./pages/Bus/Bus";
import AddBus from "./pages/Bus/AddBus";
import Driver from "./pages/Driver/Driver";
import Trip from "./pages/Trip/Trip";
import Discount from "./pages/Discount/Discount";
import WalletTransaction from "./pages/WalletTransaction/WalletTransaction";
import Booking from "./pages/Booking/Booking";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route index path="/location/countries" element={<ProtectedRoute><Country /></ProtectedRoute>} />
            <Route index path="/location/provinces" element={<ProtectedRoute><Province/></ProtectedRoute>}/>
            <Route index path="/location/cities" element={<ProtectedRoute><City/></ProtectedRoute>}/>
            <Route index path="/routes" element={<ProtectedRoute><BusRoute/></ProtectedRoute>}/>
            <Route index path="/stations" element={<ProtectedRoute><Station/></ProtectedRoute>}/>
            <Route index path="/users" element={<ProtectedRoute><User/></ProtectedRoute>}/>
            <Route index path="/buses" element={<ProtectedRoute><Bus/></ProtectedRoute>}/>
            <Route index path="/add-bus/:busId?" element={<ProtectedRoute><AddBus/></ProtectedRoute>}/>
            <Route index path="/drivers" element={<ProtectedRoute><Driver/></ProtectedRoute>}/>
            <Route index path="/trips" element={<ProtectedRoute><Trip/></ProtectedRoute>}/>
            <Route index path="/discounts" element={<ProtectedRoute><Discount/></ProtectedRoute>}/>
            <Route index path="/wallet-transactions" element={<ProtectedRoute><WalletTransaction/></ProtectedRoute>}/>
            <Route index path="/bookings" element={<ProtectedRoute><Booking/></ProtectedRoute>}/>









            {/* Others Page */}

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
        </Routes>
      </Router>
    </>
  );
}
