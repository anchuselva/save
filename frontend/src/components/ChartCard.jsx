export default function ChartCard({ title, children }) {
  return (
    <div className="app-card p-3 h-100">
      <h5 className="mb-3">{title}</h5>
      {children}
    </div>
  );
}
