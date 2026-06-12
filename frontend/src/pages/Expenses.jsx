import CrudPage from "./shared/CrudPage";
import { categories } from "../utils/budgetUtils";

export default function Expenses() {
  return <CrudPage title="Expense Management" endpoint="/expenses" fields={[["amount", "Amount", "number"], ["category", "Category", "select", categories], ["date", "Date", "date"], ["description", "Description", "text"], ["merchant", "Merchant", "text"], ["payment_method", "Payment method", "select", ["Cash", "Card", "Online", "Bank Transfer"]]]} />;
}
