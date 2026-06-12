export default function FeatureCard({ title, text, icon = "LKR" }) {
  return (
    <div className="app-card h-100 p-4">
      <div className="feature-icon mb-3">{icon}</div>
      <h5>{title}</h5>
      <p className="text-secondary mb-0">{text}</p>
    </div>
  );
}
