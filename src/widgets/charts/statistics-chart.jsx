import PropTypes from "prop-types";
import Chart from "react-apexcharts";

export function StatisticsChart({ color, chart, title, description, footer }) {
  return (
    <div className="flex flex-col bg-white rounded-2xl border border-blue-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Title block — sits ABOVE the chart */}
      <div className="px-6 pt-5 pb-3 border-b border-blue-gray-50">
        <p className="text-sm font-bold text-blue-gray-800">{title}</p>
        <p className="text-xs text-blue-gray-400 mt-0.5 font-normal">{description}</p>
      </div>

      {/* Chart */}
      <div className="px-2 pt-2">
        <Chart {...chart} />
      </div>

      {/* Footer */}
      {footer && (
        <div className="border-t border-blue-gray-50 px-6 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

StatisticsChart.defaultProps = {
  color: "white",
  footer: null,
};

StatisticsChart.propTypes = {
  color: PropTypes.string,
  chart: PropTypes.object.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsChart.displayName = "/src/widgets/charts/statistics-chart.jsx";

export default StatisticsChart;
