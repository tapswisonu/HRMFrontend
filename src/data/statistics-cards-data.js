import {
  BanknotesIcon,
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "gray",
    icon: UsersIcon,
    title: "Total Employees",
    value: "...", // dynamic
    footer: {
      color: "text-green-500",
      value: "+5%",
      label: "than last month",
    },
  },
  {
    color: "gray",
    icon: UserPlusIcon,
    title: "Total Admins",
    value: "...", // dynamic
    footer: {
      color: "text-blue-500",
      value: "",
      label: "System Administrators",
    },
  },
  {
    color: "gray",
    icon: ChartBarIcon,
    title: "Avg Attendance",
    value: "92%",
    footer: {
      color: "text-green-500",
      value: "+2%",
      label: "than yesterday",
    },
  },
  {
    color: "gray",
    icon: BanknotesIcon,
    title: "Active Projects",
    value: "8",
    footer: {
      color: "text-green-500",
      value: "+1",
      label: "new this week",
    },
  },
];

export default statisticsCardsData;
