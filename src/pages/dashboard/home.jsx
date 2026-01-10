import React, { useEffect } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
} from "@/data";
import { CheckCircleIcon, ClockIcon, UserPlusIcon, UsersIcon, ChartBarIcon, BanknotesIcon, BellIcon } from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import axios from "axios";
import { format } from "date-fns";
import { chartsConfig } from "@/configs";

export function Home() {
  const { token } = useSelector((state) => state.auth);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get("http://localhost:8000/api/admin/dashboard-stats", config);
        setStats(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  // --- Dynamic Data Preparation ---

  // 1. Cards
  const cardsData = [
    {
      color: "gray",
      icon: UsersIcon,
      title: "Total Employees",
      value: stats?.cards?.totalEmployees || 0,
      footer: {
        color: "text-green-500",
        value: "",
        label: "Registered Staff",
      },
    },
    {
      color: "gray",
      icon: UserPlusIcon,
      title: "Total Admins",
      value: stats?.cards?.totalAdmins || 0,
      footer: {
        color: "text-blue-500",
        value: "",
        label: "System Admins",
      },
    },
    {
      color: "gray",
      icon: ChartBarIcon,
      title: "Today's Presence",
      value: stats?.cards?.presenceToday || 0,
      footer: {
        color: "text-green-500",
        value: "Active",
        label: "Checked-in Today",
      },
    },
    {
      color: "gray",
      icon: BanknotesIcon,
      title: "Active Projects",
      value: "8", // Still static as requested (or from backend if available)
      footer: {
        color: "text-green-500",
        value: "+1",
        label: "new this week",
      },
    },
  ];

  // 2. Charts
  const attendanceChart = {
    type: "bar",
    height: 220,
    series: [{
      name: "Check-ins",
      data: stats?.charts?.attendanceTrends?.map(d => d.count) || [],
    }],
    options: {
      ...chartsConfig,
      colors: "#388e3c",
      plotOptions: {
        bar: {
          columnWidth: "16%",
          borderRadius: 5,
        },
      },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: stats?.charts?.attendanceTrends?.map(d => d.day) || [],
      },
    },
  };

  const joinersChart = {
    type: "line",
    height: 220,
    series: [{
      name: "New Joiners",
      data: stats?.charts?.newJoiners?.map(d => d.count) || [],
    }],
    options: {
      ...chartsConfig,
      colors: ["#0288d1"],
      stroke: { lineCap: "round" },
      markers: { size: 5 },
      xaxis: {
        ...chartsConfig.xaxis,
        categories: stats?.charts?.newJoiners?.map(d => d.month) || [],
      },
    },
  };

  const chartsData = [
    {
      color: "white",
      title: "Attendance Trends",
      description: "Daily Check-ins (Last 7 Days)",
      footer: "updated just now",
      chart: attendanceChart,
    },
    {
      color: "white",
      title: "New Joiners",
      description: "Monthly Recruitments",
      footer: "updated just now",
      chart: joinersChart,
    },
  ];

  if (loading) return <div className="p-4">Loading Dashboard...</div>;

  return (
    <div className="mt-12">
      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {cardsData.map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {chartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Projects Table (Keeping Static for now as per minimal changes, or can remove if desired) */}
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 flex items-center justify-between p-6"
          >
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Projects
              </Typography>
              <Typography
                variant="small"
                className="flex items-center gap-1 font-normal text-blue-gray-600"
              >
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>30 done</strong> this month
              </Typography>
            </div>
            {/* Menu removed for simplicity */}
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["companies", "members", "budget", "completion"].map(
                    (el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {projectsTableData.map(
                  ({ img, name, members, budget, completion }, key) => {
                    const className = `py-3 px-5 ${key === projectsTableData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                      }`;

                    return (
                      <tr key={name}>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar src={img} alt={name} size="sm" />
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-bold"
                            >
                              {name}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          {members.map(({ img, name }, key) => (
                            <Tooltip key={name} content={name}>
                              <Avatar
                                src={img}
                                alt={name}
                                size="xs"
                                variant="circular"
                                className={`cursor-pointer border-2 border-white ${key === 0 ? "" : "-ml-2.5"
                                  }`}
                              />
                            </Tooltip>
                          ))}
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className="text-xs font-medium text-blue-gray-600"
                          >
                            {budget}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="w-10/12">
                            <Typography
                              variant="small"
                              className="mb-1 block text-xs font-medium text-blue-gray-600"
                            >
                              {completion}%
                            </Typography>
                            <Progress
                              value={completion}
                              variant="gradient"
                              color={completion === 100 ? "green" : "blue"}
                              className="h-1"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        {/* Recent Activity (Dynamic Replacement for Orders) */}
        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader
            floated={false}
            shadow={false}
            color="transparent"
            className="m-0 p-6"
          >
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Recent Activity
            </Typography>
            <Typography
              variant="small"
              className="flex items-center gap-1 font-normal text-blue-gray-600"
            >
              <ArrowUpIcon
                strokeWidth={3}
                className="h-3.5 w-3.5 text-green-500"
              />
              <strong>Latest</strong> Check-ins
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {stats?.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, key) => (
                <div key={key} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${key === stats.recentActivity.length - 1 ? "after:h-0" : "after:h-4/6"
                      }`}
                  >
                    <BellIcon className="!w-5 !h-5 text-blue-gray-300" />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="block font-medium"
                    >
                      {activity.employee?.name || "Unknown User"} Checked In
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="text-xs font-medium text-blue-gray-500"
                    >
                      {format(new Date(activity.checkInTime), "dd MMM, hh:mm a")}
                    </Typography>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">No recent activity.</div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
