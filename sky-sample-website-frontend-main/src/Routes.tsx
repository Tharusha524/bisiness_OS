import React, { Suspense, useMemo } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import MainLayout from "./components/Layout/MainLayout";
import PageLoader from "./components/PageLoader";
import useCurrentUser from "./hooks/useCurrentUser";
import { PermissionKeys } from "./views/Administration/SectionList";
import PermissionDenied from "./components/PermissionDenied";
import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "./api/userApi";

//Login Page
const LoginPage = React.lazy(() => import("./views/LoginPage/LoginPage"));

//Register Page
const RegistrationPage = React.lazy(
  () => import("./views/RegistrationPage/RegistrationPage")
);

//Pending Access Page
const PendingAccessPage = React.lazy(
  () => import("./views/PendingAccessPage/PendingAccessPage")
);

//Insight Page
const InsightsPage = React.lazy(() => import("./views/Insights/Insight"));

//Custom Page
const CustomPage = React.lazy(() => import("./views/CustomPage/CustomPage"));

//Administration
const UserTable = React.lazy(() => import("./views/Administration/UserTable"));
const AccessManagementTable = React.lazy(
  () => import("./views/Administration/AccessManagementTable")
);

//Design - Components
const AccordionAndDividers = React.lazy(
  () => import("./views/Components/AccordionAndDividers")
);
const ImageDesigns = React.lazy(
  () => import("./views/Components/ImageDesigns")
);
const TabPanel = React.lazy(() => import("./views/Components/TabPanel"));
const UnderDevelopment = React.lazy(
  () => import("./components/UnderDevelopment")
);

//Design - Input Fields
const TextField = React.lazy(() => import("./views/Components/TextField"));
const DatePickers = React.lazy(() => import("./views/Components/DatePickers"));
const OtherInputs = React.lazy(() => import("./views/Components/OtherInputs"));

//Sample CRUD - Chemical management
const ChemicalRequestTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalRequestTable")
);
const ChemicalPurchaseInventoryTable = React.lazy(
  () => import("./views/ChemicalMng/ChemicalPurchaseInventoryTable")
);
const ChemicalTransactionTable = React.lazy(
  () => import("./views/ChemicalMng/TransactionTable")
);
const ChemicalDashboard = React.lazy(
  () => import("./views/ChemicalMng/Dashboard")
);

const Autocomplete = React.lazy(
  () => import("./views/Components/Autocomplete")
);

// Sky Smart Dashboard Views
const Dashboard = React.lazy(() => import("./views/SystemDashboard/Dashboard"));
const SystemSetup = React.lazy(() => import("./views/SystemDashboard/SystemSetup"));
const SystemMetrics = React.lazy(() => import("./views/SystemDashboard/SystemMetrics"));
const BankBalance = React.lazy(() => import("./views/SystemDashboard/BankBalance"));
const SystemDetails = React.lazy(() => import("./views/SystemDashboard/SystemDetails"));
const KpiForm = React.lazy(() => import("./views/SystemDashboard/KpiForm"));
const MetricDetails = React.lazy(() => import("./views/SystemDashboard/MetricDetails"));
const Report = React.lazy(() => import("./views/SystemDashboard/Report"));
const UserSetting = React.lazy(() => import("./views/UserSetting/UserSetting"));
const CompanySetting = React.lazy(() => import("./views/CompanySetting/CompanySetting"));

const UserInputSystems = React.lazy(() => import("./views/UserInput/UserInputSystems"));
const UserInputMetrics = React.lazy(() => import("./views/UserInput/UserInputMetrics"));
const UserInputForm = React.lazy(() => import("./views/UserInput/UserInputForm"));

function withLayout(Layout: any, Component: any, restrictAccess = false) {
  return (
    <Layout>
      <Suspense
        fallback={
          <>
            <PageLoader />
          </>
        }
      >
        {restrictAccess ? <PermissionDenied /> : <Component />}
      </Suspense>
    </Layout>
  );
}

const UserLayout = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  return <MainLayout>{children}</MainLayout>;
};

function withoutLayout(Component: React.LazyExoticComponent<any>) {
  return (
    <Suspense
      fallback={
        <>
          <PageLoader />
        </>
      }
    >
      <Component />
    </Suspense>
  );
}

const ProtectedRoute = () => {
  const { user, status, isFetching } = useCurrentUser();

  if (
    status === "loading" ||
    status === "idle" ||
    status === "pending" ||
    (isFetching && !user)
  ) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if ((user as any).userType?.id === 2) {
    return <Navigate to="/pending-access" />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const hasToken = !!localStorage.getItem("token");

  const { data: user } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
    enabled: hasToken,
  });

  const userPermissionObject = useMemo(() => {
    if (user && user?.permissionObject) {
      return user?.permissionObject;
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/" element={withoutLayout(LoginPage)} />
      <Route path="/register" element={withoutLayout(RegistrationPage)} />
      <Route path="/pending-access" element={withoutLayout(PendingAccessPage)} />
      <Route element={<ProtectedRoute />}>
        {/* Insight */}
        <Route
          path="/home"
          element={withLayout(
            MainLayout,
            InsightsPage,
            !userPermissionObject?.[PermissionKeys.INSIGHT_VIEW]
          )}
        />

        {/* Custom Page */}
        <Route
          path="/custom-page"
          element={withLayout(
            MainLayout,
            CustomPage,
            !userPermissionObject?.[PermissionKeys.CUSTOM_PAGE_VIEW]
          )}
        />

        {/* Admin Controller */}
        <Route
          path="/admin/users"
          element={withLayout(
            MainLayout,
            UserTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_USERS_VIEW]
          )}
        />
        <Route
          path="/admin/access-management"
          element={withLayout(
            MainLayout,
            AccessManagementTable,
            !userPermissionObject?.[PermissionKeys.ADMIN_ACCESS_MNG_VIEW]
          )}
        />

        {/* Design - Components (no permission gate — internal dev pages) */}
        <Route
          path="/components/accordion-divider"
          element={withLayout(MainLayout, AccordionAndDividers)}
        />
        <Route
          path="/components/image-designs"
          element={withLayout(MainLayout, ImageDesigns)}
        />
        <Route
          path="/components/tab-panels"
          element={withLayout(MainLayout, TabPanel)}
        />
        <Route
          path="/components/under-development"
          element={withLayout(MainLayout, UnderDevelopment)}
        />

        {/* Design - Input Fields (no permission gate — internal dev pages) */}
        <Route
          path="/input-fields/autocomplete"
          element={withLayout(MainLayout, Autocomplete)}
        />
        <Route
          path="/input-fields/textfield"
          element={withLayout(MainLayout, TextField)}
        />
        <Route
          path="/input-fields/date-pickers"
          element={withLayout(MainLayout, DatePickers)}
        />
        <Route
          path="/input-fields/other-inputs"
          element={withLayout(MainLayout, OtherInputs)}
        />

        {/* Chemical management (no permission gate — legacy module) */}
        <Route
          path="/chemical-mng/dashboard"
          element={withLayout(MainLayout, ChemicalDashboard)}
        />
        <Route
          path="/chemical-mng/chemical-requests"
          element={withLayout(MainLayout, ChemicalRequestTable)}
        />
        <Route
          path="/chemical-mng/purchase-inventory"
          element={withLayout(MainLayout, ChemicalPurchaseInventoryTable)}
        />
        <Route
          path="/chemical-mng/transaction"
          element={withLayout(MainLayout, ChemicalTransactionTable)}
        />
        <Route
          path="/chemical-mng/assigned-tasks"
          element={withLayout(MainLayout, () => {
            return <ChemicalRequestTable isAssignedTasks={true} />;
          })}
        />

        {/* Sky Smart Dashboard Routes */}
        <Route
          path="/dashboard"
          element={withLayout(
            MainLayout,
            Dashboard,
            !userPermissionObject?.[PermissionKeys.DASHBOARD_VIEW]
          )}
        />
        <Route
          path="/system-setup"
          element={withLayout(
            MainLayout,
            SystemSetup,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_VIEW]
          )}
        />
        <Route
          path="/system-setup/:id"
          element={withLayout(
            MainLayout,
            SystemMetrics,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_VIEW]
          )}
        />
        <Route
          path="/system-setup/:id/metrics/create"
          element={withLayout(
            MainLayout,
            KpiForm,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_EDIT]
          )}
        />
        <Route
          path="/system-setup/:id/metrics/:metricId/edit"
          element={withLayout(
            MainLayout,
            KpiForm,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_EDIT]
          )}
        />
        <Route
          path="/system-setup/:id/metrics/:metricId/details"
          element={withLayout(
            MainLayout,
            MetricDetails,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_VIEW]
          )}
        />
        <Route
          path="/system-setup/:systemId/bank-balance"
          element={withLayout(
            MainLayout,
            BankBalance,
            !userPermissionObject?.[PermissionKeys.SYSTEM_SETUP_VIEW]
          )}
        />
        <Route
          path="/system-details/:id"
          element={withLayout(
            MainLayout,
            SystemDetails,
            false // allow access, SystemDetails will handle specific permissions internally
          )}
        />
        <Route
          path="/report"
          element={withLayout(
            MainLayout,
            Report,
            !userPermissionObject?.[PermissionKeys.REPORT_VIEW]
          )}
        />
        <Route
          path="/user-setting"
          element={withLayout(
            MainLayout,
            UserSetting,
            !userPermissionObject?.[PermissionKeys.USER_SETTING_VIEW]
          )}
        />
        <Route
          path="/company-setting"
          element={withLayout(
            MainLayout,
            CompanySetting,
            !userPermissionObject?.[PermissionKeys.COMPANY_SETTING_VIEW]
          )}
        />

        {/* Normal User Dashboard Routes */}
        <Route
          path="/user-dashboard"
          element={withLayout(
            UserLayout,
            Dashboard,
            !userPermissionObject?.[PermissionKeys.DASHBOARD_VIEW]
          )}
        />
        <Route
          path="/user-report"
          element={withLayout(
            UserLayout,
            Report,
            !userPermissionObject?.[PermissionKeys.REPORT_VIEW]
          )}
        />
        <Route
          path="/user-input"
          element={withLayout(
            UserLayout,
            UserInputSystems,
            !userPermissionObject?.[PermissionKeys.INPUT_PAGE_VIEW]
          )}
        />
        <Route
          path="/user-input/:systemId"
          element={withLayout(
            UserLayout,
            UserInputMetrics,
            !userPermissionObject?.[PermissionKeys.INPUT_PAGE_VIEW]
          )}
        />
        <Route
          path="/user-input/:systemId/metrics/:metricId/input"
          element={withLayout(
            UserLayout,
            UserInputForm,
            !userPermissionObject?.[PermissionKeys.INPUT_PAGE_EDIT]
          )}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
