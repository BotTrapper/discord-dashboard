import { Link } from "react-router-dom";
import { getVersion } from "../lib/version";

export default function Footer() {
  const version = getVersion();
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-2">
      {/* Legal Links */}
      <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-center sm:text-left">
        <Link 
          to="/tos" 
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Terms of Service
        </Link>
        <span>•</span>
        <Link 
          to="/dataprivacy" 
          className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Privacy Policy
        </Link>
      </div>
      
      {/* Version and Copyright - stacked for sidebar */}
      <div className="text-center sm:text-left">
        <div className="hidden sm:block">Version {version}</div>
        <div className="hidden sm:block">© {currentYear} BotTrapper</div>
        {/* Mobile: More compact display */}
        <div className="sm:hidden">
          v{version} • © {currentYear} BotTrapper
        </div>
      </div>
    </div>
  );
}
