import { z } from "zod";

export const PermissionSectionsMap: PermissionSection[] = [
  {
    mainSection: "Main",
    subSections: [
      {
        name: "Insight",
        key: "INSIGHT",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
    ],
  },
  {
    mainSection: "Administration",
    subSections: [
      {
        name: "Administration > Users",
        key: "ADMIN_USERS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: true,
          NOTE: false,
        },
      },
      {
        name: "Administration > Access Management",
        key: "ADMIN_ACCESS_MNG",
        permissionsExists: {
          VIEW: true,
          CREATE: true,
          EDIT: true,
          DELETE: true,
          NOTE: false,
        },
      },
    ],
  },
  {
    mainSection: "Sky Smart Dashboard",
    subSections: [
      {
        break: true,
        name: "System Management",
      },
      {
        name: "Main Dashboard",
        key: "DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "Production Dashboard",
        key: "PRODUCTION_DASHBOARD",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "Report",
        key: "REPORT",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        break: true,
        name: "Input Data",
      },
      {
        name: "Input Data",
        key: "INPUT_DATA",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "Custom Page (Daily KPI)",
        key: "CUSTOM_PAGE",
        parentPermission: "INPUT_DATA",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "Input Page",
        key: "INPUT_PAGE",
        parentPermission: "INPUT_DATA",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        break: true,
        name: "Settings",
      },
      {
        name: "Settings",
        key: "SETTINGS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "System Setup",
        key: "SYSTEM_SETUP",
        parentPermission: "SETTINGS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "User Setting",
        key: "USER_SETTING",
        parentPermission: "SETTINGS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: false,
          NOTE: false,
        },
      },
      {
        name: "Company Setting",
        key: "COMPANY_SETTING",
        parentPermission: "SETTINGS",
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: true,
          DELETE: false,
          NOTE: false,
        },
      },
    ],
  },
];

export const getDynamicPermissionSections = (systems: any[]): PermissionSection[] => {
  const dynamicSections = [...PermissionSectionsMap];
  
  if (systems && systems.length > 0) {
    // Add Dynamic Systems Section
    const dynamicSystemSection: PermissionSection = {
      mainSection: "Dashboard & Input Page Systems/KPIs",
      subSections: [],
    };

    systems.forEach((system) => {
      dynamicSystemSection.subSections.push({
        break: true,
        name: system.name,
      });

      dynamicSystemSection.subSections.push({
        name: "System Access",
        key: `SYSTEM_${system.id}`,
        permissionsExists: {
          VIEW: true,
          CREATE: false,
          EDIT: false,
          DELETE: false,
          NOTE: false,
        },
      });

      if (system.metrics && system.metrics.length > 0) {
        system.metrics.forEach((metric: any) => {
          dynamicSystemSection.subSections.push({
            name: metric.name,
            key: `KPI_${metric.id}`,
            permissionsExists: {
              VIEW: true,
              CREATE: false,
              EDIT: true,
              DELETE: false,
              NOTE: true,
            },
          });
        });
      }
    });

    dynamicSections.push(dynamicSystemSection);
  }

  return dynamicSections;
};

export interface PermissionSection {
  mainSection: string;
  subSections: SubSection[];
}

export interface SubSectionWithPermissions {
  name: string;
  key: string;
  permissionsExists: PermissionsExists;
  parentPermission?: string;
}

export interface SubSectionBreak {
  break: boolean;
  name: string;
}

export type SubSection = SubSectionWithPermissions | SubSectionBreak;

export interface PermissionsExists {
  VIEW: boolean;
  CREATE: boolean;
  EDIT: boolean;
  DELETE: boolean;
  NOTE: boolean;
}

export enum PermissionKeys {
  //Insight
  INSIGHT_VIEW = "INSIGHT_VIEW",
  // Administration
  ADMIN_USERS_VIEW = "ADMIN_USERS_VIEW",
  ADMIN_USERS_EDIT = "ADMIN_USERS_EDIT",
  ADMIN_USERS_DELETE = "ADMIN_USERS_DELETE",
  ADMIN_ACCESS_MNG_VIEW = "ADMIN_ACCESS_MNG_VIEW",
  ADMIN_ACCESS_MNG_CREATE = "ADMIN_ACCESS_MNG_CREATE",
  ADMIN_ACCESS_MNG_EDIT = "ADMIN_ACCESS_MNG_EDIT",
  ADMIN_ACCESS_MNG_DELETE = "ADMIN_ACCESS_MNG_DELETE",

  // Custom Page
  CUSTOM_PAGE_VIEW = "CUSTOM_PAGE_VIEW",
  CUSTOM_PAGE_EDIT = "CUSTOM_PAGE_EDIT",
  
  // Sky Smart Dashboard
  DASHBOARD_VIEW = "DASHBOARD_VIEW",
  PRODUCTION_DASHBOARD_VIEW = "PRODUCTION_DASHBOARD_VIEW",
  INPUT_DATA_VIEW = "INPUT_DATA_VIEW",
  SETTINGS_VIEW = "SETTINGS_VIEW",
  SYSTEM_SETUP_VIEW = "SYSTEM_SETUP_VIEW",
  SYSTEM_SETUP_EDIT = "SYSTEM_SETUP_EDIT",
  REPORT_VIEW = "REPORT_VIEW",
  USER_SETTING_VIEW = "USER_SETTING_VIEW",
  USER_SETTING_EDIT = "USER_SETTING_EDIT",
  COMPANY_SETTING_VIEW = "COMPANY_SETTING_VIEW",
  COMPANY_SETTING_EDIT = "COMPANY_SETTING_EDIT",

  INPUT_PAGE_VIEW = "INPUT_PAGE_VIEW",
  INPUT_PAGE_EDIT = "INPUT_PAGE_EDIT",

  // Chemical Mng
  CHEMICAL_MNG_REQUEST_REGISTER_CREATE = "CHEMICAL_MNG_REQUEST_REGISTER_CREATE",
  CHEMICAL_MNG_REQUEST_REGISTER_EDIT = "CHEMICAL_MNG_REQUEST_REGISTER_EDIT",
  CHEMICAL_MNG_REQUEST_REGISTER_DELETE = "CHEMICAL_MNG_REQUEST_REGISTER_DELETE",
  CHEMICAL_MNG_ASSIGNED_TASKS_CREATE = "CHEMICAL_MNG_ASSIGNED_TASKS_CREATE",
  CHEMICAL_MNG_ASSIGNED_TASKS_EDIT = "CHEMICAL_MNG_ASSIGNED_TASKS_EDIT",
  CHEMICAL_MNG_ASSIGNED_TASKS_DELETE = "CHEMICAL_MNG_ASSIGNED_TASKS_DELETE",
}

// Create the Zod schema using the enum values
export const PermissionKeysObjectSchema = z.object(
  Object.values(PermissionKeys).reduce((acc, key) => {
    acc[key] = z.boolean();
    return acc;
  }, {} as Record<string, z.ZodBoolean>)
).catchall(z.boolean());

// Infer the TypeScript type from the Zod schema
export type PermissionKeysObject = z.infer<typeof PermissionKeysObjectSchema>;

export const defaultAdminPermissions = Object.values(PermissionKeys).reduce(
  (acc, key) => {
    acc[key] = true;
    return acc;
  },
  {} as Record<PermissionKeys, boolean>
);

export const defaultViewerPermissions: PermissionKeysObject = {
  INSIGHT_VIEW: true,
  ADMIN_USERS_VIEW: false,
  ADMIN_USERS_EDIT: false,
  ADMIN_USERS_DELETE: false,
  ADMIN_ACCESS_MNG_VIEW: false,
  ADMIN_ACCESS_MNG_CREATE: false,
  ADMIN_ACCESS_MNG_EDIT: false,
  ADMIN_ACCESS_MNG_DELETE: false,

  CUSTOM_PAGE_VIEW: false,
  CUSTOM_PAGE_EDIT: false,
  
  DASHBOARD_VIEW: false,
  PRODUCTION_DASHBOARD_VIEW: false,
  INPUT_DATA_VIEW: false,
  SETTINGS_VIEW: false,
  SYSTEM_SETUP_VIEW: false,
  SYSTEM_SETUP_EDIT: false,
  REPORT_VIEW: false,
  USER_SETTING_VIEW: false,
  USER_SETTING_EDIT: false,
  COMPANY_SETTING_VIEW: false,
  COMPANY_SETTING_EDIT: false,

  INPUT_PAGE_VIEW: false,
  INPUT_PAGE_EDIT: false,

  CHEMICAL_MNG_REQUEST_REGISTER_CREATE: false,
  CHEMICAL_MNG_REQUEST_REGISTER_EDIT: false,
  CHEMICAL_MNG_REQUEST_REGISTER_DELETE: false,
  CHEMICAL_MNG_ASSIGNED_TASKS_CREATE: false,
  CHEMICAL_MNG_ASSIGNED_TASKS_EDIT: false,
  CHEMICAL_MNG_ASSIGNED_TASKS_DELETE: false,
};
