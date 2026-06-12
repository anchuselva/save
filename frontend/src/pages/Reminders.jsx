import CrudPage from "./shared/CrudPage";

export default function Reminders() {
  return <CrudPage title="Bill Reminders" endpoint="/reminders" reminderMode fields={[["bill_type", "Bill type", "select", ["Water bill", "Electricity bill", "Phone bill", "Internet bill", "Rent"]], ["amount", "Amount", "number"], ["due_date", "Due date", "date"], ["description", "Description", "text"], ["status", "Status", "select", ["Pending", "Paid"]]]} />;
}
