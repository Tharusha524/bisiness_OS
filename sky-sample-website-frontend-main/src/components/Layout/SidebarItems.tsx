import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LayersIcon from "@mui/icons-material/Layers";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import SpaIcon from "@mui/icons-material/Spa";
import ForestIcon from "@mui/icons-material/Forest";
import ScienceIcon from "@mui/icons-material/Science";
import EmergencyIcon from "@mui/icons-material/Emergency";
import ChangeHistoryIcon from "@mui/icons-material/ChangeHistory";
import ConstructionIcon from "@mui/icons-material/Construction";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import FactoryIcon from "@mui/icons-material/Factory";
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
    headline: "BizOS Dashboard",
  },
  {
    title: "Main Dashboard",
    href: "/dashboard",
    icon: <DashboardIcon fontSize="small" />,
    accessKey: PermissionKeys.DASHBOARD_VIEW,
  },
  {
    title: "Production Dashboard",
    href: "/production-dashboard",
    icon: <FactoryIcon fontSize="small" />,
    accessKey: PermissionKeys.PRODUCTION_DASHBOARD_VIEW,
  },
  {
    title: "Report",
    href: "/report",
    icon: <AssessmentOutlinedIcon fontSize="small" />,
    accessKey: PermissionKeys.REPORT_VIEW,
  },
  {
    title: "Input Data",
    icon: <DatasetLinkedOutlinedIcon fontSize="small" />,
    open: false,
    nestedItems: [
      {
        title: "Custom Page",
        href: "/custom-page",
        icon: <LayersIcon fontSize="small" />,
        accessKey: PermissionKeys.CUSTOM_PAGE_VIEW,
      },
      {
        title: "Input Page",
        href: "/user-input",
        icon: <SubdirectoryArrowRightIcon fontSize="small" />,
        accessKey: PermissionKeys.INPUT_PAGE_VIEW,
      },
    ],
  },
  {
    title: "Settings",
    icon: <SettingsOutlinedIcon fontSize="small" />,
    open: false,
    nestedItems: [
      {
        title: "System Setup",
        href: "/system-setup",
        icon: <ConstructionIcon fontSize="small" />,
        accessKey: PermissionKeys.SYSTEM_SETUP_VIEW,
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
    ],
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



