import CrudPage from "./shared/CrudPage";

export default function Income() {
  return <CrudPage title="Income Management" endpoint="/income" fields={[["amount", "Amount", "number"], ["source", "Source", "select", ["Salary", "Freelance", "Allowance", "Business income", "Other income"]], ["date", "Date", "date"], ["description", "Description", "text"]]} />;
}
