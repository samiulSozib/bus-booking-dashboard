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
import TripCancellationPolicy from "./pages/tripCancellationPolicy/TripCancellationPolicy";
import AdminWallet from "./pages/adminWallet/AdminWallet";
import VendorWallet from "./pages/vendorWaller/vendorWallet";
import AddBooking from "./pages/Booking/AddBooking";
import TelecomOperators from "./pages/TelecomOperators/TelecomOperators";
import Settings from "./pages/Settings/Settings";
import VendorUser from "./pages/VendorUser/VendorUser";
import VendorUserRoles from "./pages/VendorUserRoles/VendorUserRoles";
import ExpenseCategory from "./pages/ExpenseCategory/ExpenseCategory";
import Expense from "./pages/Expense/Expense";
import Branch from "./pages/Branch/Branch";
import Vendor from "./pages/User/Vendor/Vendor";
import Admin from "./pages/User/Admin/Admin";
import Customer from "./pages/User/Customer/Customer";
import Agent from "./pages/User/Agent/Agent";
import AdminDriver from "./pages/User/Driver/AdminDriver";
import TripView from "./pages/Trip/ViewTrip";
import VendorView from "./pages/User/Vendor/VendorView";
import Recharge from "./pages/Recharge/Recharge";
import UserProfiles from "./pages/Profile/UserProfile";
import Pages from "./pages/Pages/Pages";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            {/* Location Routes */}
            <Route path="/location">
              <Route
                path="countries"
                element={
                  <ProtectedRoute>
                    <Country />
                  </ProtectedRoute>
                }
              />
              <Route
                path="provinces"
                element={
                  <ProtectedRoute>
                    <Province />
                  </ProtectedRoute>
                }
              />
              <Route
                path="cities"
                element={
                  <ProtectedRoute>
                    <City />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* User Management Routes */}
            <Route path="/users">
              <Route
                index
                element={
                  <ProtectedRoute>
                    <User />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vendor"
                element={
                  <ProtectedRoute>
                    <Vendor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vendor/:id"
                element={
                  <ProtectedRoute>
                    <VendorView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="driver"
                element={
                  <ProtectedRoute>
                    <AdminDriver />
                  </ProtectedRoute>
                }
              />
              <Route
                path="agent"
                element={
                  <ProtectedRoute>
                    <Agent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="customer"
                element={
                  <ProtectedRoute>
                    <Customer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="branch"
                element={
                  <ProtectedRoute>
                    <Branch />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route
              index
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              index
              path="/routes"
              element={
                <ProtectedRoute>
                  <BusRoute />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/stations"
              element={
                <ProtectedRoute>
                  <Station />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/users"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/buses"
              element={
                <ProtectedRoute>
                  <Bus />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/add-bus/:busId?"
              element={
                <ProtectedRoute>
                  <AddBus />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/drivers"
              element={
                <ProtectedRoute>
                  <Driver />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/trips"
              element={
                <ProtectedRoute>
                  <Trip />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/discounts"
              element={
                <ProtectedRoute>
                  <Discount />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/wallet-transactions"
              element={
                <ProtectedRoute>
                  <WalletTransaction />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Booking />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/add-booking"
              element={
                <ProtectedRoute>
                  <AddBooking />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/trip-cancellation-policy"
              element={
                <ProtectedRoute>
                  <TripCancellationPolicy />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/admin-wallet"
              element={
                <ProtectedRoute>
                  <AdminWallet />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/vendor-wallet"
              element={
                <ProtectedRoute>
                  <VendorWallet />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/telecom-operators"
              element={
                <ProtectedRoute>
                  <TelecomOperators />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/recharges"
              element={
                <ProtectedRoute>
                  <Recharge />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/vendor-users"
              element={
                <ProtectedRoute>
                  <VendorUser />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/vendor-users-roles"
              element={
                <ProtectedRoute>
                  <VendorUserRoles />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/expense-category"
              element={
                <ProtectedRoute>
                  <ExpenseCategory />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/expense"
              element={
                <ProtectedRoute>
                  <Expense />
                </ProtectedRoute>
              }
            />
            <Route
              index
              path="/branch"
              element={
                <ProtectedRoute>
                  <Branch />
                </ProtectedRoute>
              }
            />

            <Route
              index
              path="/trips/:id"
              element={
                <ProtectedRoute>
                  <TripView />
                </ProtectedRoute>
              }
            />

            <Route
              index
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfiles />
                </ProtectedRoute>
              }
            />

            <Route
              index
              path="/pages"
              element={
                <ProtectedRoute>
                  <Pages />
                </ProtectedRoute>
              }
            />

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
