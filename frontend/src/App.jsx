import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ScanWaste from "./pages/ScanWaste";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/scan"
          element={<ScanWaste />}
        />

        <Route
          path="/history"
          element={<History />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;