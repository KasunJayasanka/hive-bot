import { ExternalLink } from "lucide-react";

interface SourcesListProps {
  sources: string[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  // Extract domain name from URL for better display
  const getDomainName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  // Truncate long URLs for display
  const truncateUrl = (url: string, maxLength = 50): string => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength - 3) + "...";
  };

  return (
    <div className="mt-3 border-t border-gray-200 dark:border-gray-600 pt-3">
      <div className="flex items-center gap-2 mb-2">
        <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Sources
        </span>
      </div>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group"
          >
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-medium mt-0.5">
              {idx + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline break-all transition-colors">
                {getDomainName(source)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={source}>
                {truncateUrl(source)}
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-shrink-0 mt-1 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}
