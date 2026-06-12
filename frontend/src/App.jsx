import { HashRouter, Route, Routes } from "react-router-dom";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Budgets from "./pages/Budgets";
import Scanner from "./pages/Scanner";
import Reminders from "./pages/Reminders";
import Reports from "./pages/Reports";
import VoiceSummary from "./pages/VoiceSummary";
import FinancialHealth from "./pages/FinancialHealth";
import BudgetBeforeBuy from "./pages/BudgetBeforeBuy";
import CashLeakage from "./pages/CashLeakage";
import DailyLimit from "./pages/DailyLimit";
import Profile from "./pages/Profile";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

function Public({ children }) {
  return <><Navbar />{children}<Footer /></>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Public><Home /></Public>} />
        <Route path="/about" element={<Public><About /></Public>} />
        <Route path="/features" element={<Public><Features /></Public>} />
        <Route path="/contact" element={<Public><Contact /></Public>} />
        <Route path="/login" element={<Public><Login /></Public>} />
        <Route path="/register" element={<Public><Register /></Public>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/voice-summary" element={<VoiceSummary />} />
          <Route path="/financial-health" element={<FinancialHealth />} />
          <Route path="/budget-before-buy" element={<BudgetBeforeBuy />} />
          <Route path="/cash-leakage" element={<CashLeakage />} />
          <Route path="/daily-limit" element={<DailyLimit />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
