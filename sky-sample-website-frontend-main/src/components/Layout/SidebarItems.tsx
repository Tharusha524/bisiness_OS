import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SpaIcon from "@mui/icons-material/Spa";
import ForestIcon from "@mui/icons-material/Forest";
import ScienceIcon from "@mui/icons-material/Science";
import EmergencyIcon from "@mui/icons-material/Emergency";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import FolderIcon from "@mui/icons-material/Folder";
import ConstructionIcon from "@mui/icons-material/Construction";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import PersonRemoveOutlinedIcon from "@mui/icons-material/PersonRemoveOutlined";
import DatasetLinkedOutlinedIcon from "@mui/icons-material/DatasetLinkedOutlined";
import SentimentSatisfiedAltOutlinedIcon from "@mui/icons-material/SentimentSatisfiedAltOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import KeyIcon from "@mui/icons-material/Key";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { PermissionKeys } from "../../views/Administration/SectionList";

export interface SidebarItem {
  title?: string;
  headline?: string;
  icon?: JSX.Element;
  open?: boolean;
  href?: string;
  disabled?: boolean;
  accessKey?: string;
  nestedItems?: {
    title: string;
    href: string;
    icon: JSX.Element;
    accessKey?: string;
    open?: boolean;
    disabled?: boolean;
    nestedItems?: {
      accessKey?: string;
      title: string;
      href: string;
      icon: JSX.Element;
      disabled?: boolean;
    }[];
  }[];
}

export const sidebarItems: Array<SidebarItem> = [
  {
    headline: "Main",
  },
  {
    title: "Insight",
    href: "/home",
    icon: <HomeIcon fontSize="small" />,
    accessKey: PermissionKeys.INSIGHT_VIEW,
  },
  {
    headline: "Sky Smart Dashboard",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.DASHBOARD_VIEW,
  },
  {
    title: "Custom Page",
    href: "/custom-page",
    icon: <LayersIcon fontSize="small" />,
    accessKey: PermissionKeys.CUSTOM_PAGE_VIEW,
  },
  {
    title: "System Setup",
    href: "/system-setup",
    icon: <SettingsOutlinedIcon fontSize="small" />,
    accessKey: PermissionKeys.SYSTEM_SETUP_VIEW,
  },
  {
    title: "Report",
    href: "/report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    accessKey: PermissionKeys.REPORT_VIEW,
  },
  {
    title: "Input Page",
    href: "/user-input",
    icon: <LayersIcon fontSize="small" />,
    accessKey: PermissionKeys.INPUT_PAGE_VIEW,
  },
  {
    title: "User Setting",
    href: "/user-setting",
    icon: <ManageAccountsOutlinedIcon fontSize="small" />,
    accessKey: PermissionKeys.USER_SETTING_VIEW,
  },
  {
    title: "Company Setting",
    href: "/company-setting",
    icon: <BusinessOutlinedIcon fontSize="small" />,
    accessKey: PermissionKeys.COMPANY_SETTING_VIEW,
  },

  {
    headline: "Administration",
  },
  {
    title: "Users",
    icon: <PeopleAltIcon fontSize="small" />,
    href: "/admin/users",
    accessKey: PermissionKeys.ADMIN_USERS_VIEW,
  },
  {
    title: "Access Management",
    icon: <KeyIcon fontSize="small" />,
    href: "/admin/access-management",
    accessKey: PermissionKeys.ADMIN_ACCESS_MNG_VIEW,
  },
];



