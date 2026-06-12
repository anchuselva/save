export default function AlertCard({ title, text, type = "warning" }) {
  return <div className={`alert alert-${type} mb-2`}><strong>{title}</strong><div>{text}</div></div>;
}
