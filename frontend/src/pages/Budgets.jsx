import CrudPage from "./shared/CrudPage";
import { categories } from "../utils/budgetUtils";

export default function Budgets() {
  return <CrudPage title="Budget Planning" endpoint="/budgets" budgetMode fields={[["category", "Category", "select", categories], ["month", "Month", "month"], ["allocated_budget", "Allocated budget", "number"]]} />;
}
