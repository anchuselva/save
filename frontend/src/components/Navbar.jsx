import { Link, NavLink } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "../i18n/LanguageContext";

export default function Navbar() {
  const { t } = useLanguage();
  const links = [
    [t("home"), "/"],
    [t("about"), "/about"],
    [t("features"), "/features"],
    [t("contact"), "/contact"]
  ];

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
      <div className="container">
        <Link className="navbar-brand brand-mark" to="/">SaveLKR</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
            {links.map(([label, path]) => (
              <NavLink key={path} className="nav-link" to={path}>{label}</NavLink>
            ))}
            <LanguageSwitcher />
            <NavLink className="btn btn-outline-primary btn-sm ms-lg-2" to="/login">{t("login")}</NavLink>
            <NavLink className="btn btn-primary btn-sm" to="/register">{t("register")}</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
