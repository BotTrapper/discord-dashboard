import { getVersion } from "../lib/version";

export default function Footer() {
  const version = getVersion();
  const currentYear = new Date().getFullYear();

  return (
    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
      {/* Version and Copyright - stacked for sidebar */}
      <div className="text-center sm:text-left">
        <div className="hidden sm:block">Version {version}</div>
        <div className="hidden sm:block">© {currentYear} Julscha</div>
        {/* Mobile: More compact display */}
        <div className="sm:hidden">
          v{version} • © {currentYear} Julscha
        </div>
      </div>
    </div>
  );
}
