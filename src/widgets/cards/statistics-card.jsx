import PropTypes from "prop-types";

// Map accentColor names to Tailwind-safe classes
const accentMap = {
  blue: {
    bar: "bg-blue-500",
    bubble: "bg-blue-50",
    icon: "text-blue-600",
  },
  indigo: {
    bar: "bg-indigo-500",
    bubble: "bg-indigo-50",
    icon: "text-indigo-600",
  },
  green: {
    bar: "bg-green-500",
    bubble: "bg-green-50",
    icon: "text-green-600",
  },
  amber: {
    bar: "bg-amber-500",
    bubble: "bg-amber-50",
    icon: "text-amber-600",
  },
  gray: {
    bar: "bg-blue-gray-400",
    bubble: "bg-blue-gray-50",
    icon: "text-blue-gray-500",
  },
};

export function StatisticsCard({ accentColor = "gray", icon, title, value, footer }) {
  const colors = accentMap[accentColor] || accentMap["gray"];

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${colors.bar} rounded-l-2xl`} />

      <div className="flex items-center gap-4 px-5 pt-5 pb-4 pl-6">
        {/* Icon bubble */}
        <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${colors.bubble} shrink-0`}>
          <span className={`${colors.icon} [&>svg]:w-5 [&>svg]:h-5`}>{icon}</span>
        </div>

        {/* Text */}
        <div className="flex flex-col min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-gray-400 truncate">
            {title}
          </p>
          <p className="text-3xl font-bold text-blue-gray-800 leading-tight mt-0.5">
            {value}
          </p>
        </div>
      </div>

      {footer && (
        <div className="border-t border-blue-gray-50 px-6 py-2.5">
          {footer}
        </div>
      )}
    </div>
  );
}

StatisticsCard.defaultProps = {
  accentColor: "gray",
  footer: null,
};

StatisticsCard.propTypes = {
  accentColor: PropTypes.oneOf(["blue", "indigo", "green", "amber", "gray"]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;
