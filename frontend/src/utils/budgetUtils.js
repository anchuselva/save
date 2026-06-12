export const categories = ["Food", "Transport", "Water", "Electricity", "Phone", "Rent", "Education", "Health", "Entertainment", "Shopping", "Miscellaneous"];

export function riskLevel(spending, allocated) {
  const usage = allocated ? (Number(spending) / Number(allocated)) * 100 : 0;
  if (usage >= 100) return { usage, label: "Overspent", className: "badge-over" };
  if (usage >= 90) return { usage, label: "High Risk", className: "badge-risk" };
  if (usage >= 70) return { usage, label: "Caution", className: "badge-caution" };
  return { usage, label: "Safe", className: "badge-safe" };
}

export function suggestCategory(text = "") {
  const value = text.toLowerCase();
  if (/(keells|cargills|food city)/.test(value)) return "Food";
  if (/ceb/.test(value)) return "Electricity";
  if (/water board|nwsdb/.test(value)) return "Water";
  if (/(dialog|mobitel|airtel|hutch)/.test(value)) return "Phone";
  if (/(pickme|uber)/.test(value)) return "Transport";
  return "Miscellaneous";
}
