<?php

use App\Http\Controllers\AdminControllers\AdminController;
use App\Http\Controllers\api\CalculationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CommonControllers\AssigneeLevelController;
use App\Http\Controllers\CommonControllers\ComPermissionController;
use App\Http\Controllers\CommonControllers\DepartmentController;
use App\Http\Controllers\CommonControllers\FactoryController;
use App\Http\Controllers\CommonControllers\JobPositionController;
use App\Http\Controllers\CommonControllers\OrganizationController;
use App\Http\Controllers\CommonControllers\PersonTypeController;
use App\Http\Controllers\CommonControllers\ResponsibleSectionController;
use App\Http\Controllers\CommonControllers\UserTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\AiAccidentCategoryController;
use App\Http\Controllers\HealthAndSaftyControllers\AiAccidentInjuryTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\AiAccidentRecordController;
use App\Http\Controllers\HealthAndSaftyControllers\AiAccidentTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\AiIncidentCircumstancesController;
use App\Http\Controllers\HealthAndSaftyControllers\AiIncidentFactorsController;
use App\Http\Controllers\HealthAndSaftyControllers\AiIncidentRecodeController;
use App\Http\Controllers\HealthAndSaftyControllers\AiIncidentTypeOfConcernController;
use App\Http\Controllers\HealthAndSaftyControllers\AiIncidentTypeOfNearMissController;
use App\Http\Controllers\HealthAndSaftyControllers\ClinicalSuiteRecodeController;
use App\Http\Controllers\HealthAndSaftyControllers\CsConsultingDoctorController;
use App\Http\Controllers\HealthAndSaftyControllers\CsDesignationController;
use App\Http\Controllers\HealthAndSaftyControllers\CsMedicineStockController;
use App\Http\Controllers\HealthAndSaftyControllers\DocumentDocumentTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\DocumentRecodeController;
use App\Http\Controllers\HealthAndSaftyControllers\HazardAndRiskController;
use App\Http\Controllers\HealthAndSaftyControllers\HrCategoryController;
use App\Http\Controllers\HealthAndSaftyControllers\HrDivisionController;
use App\Http\Controllers\HealthAndSaftyControllers\HsOcMrMdDocumentTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\OhMiPiMedicineInventoryController;
use App\Http\Controllers\HealthAndSaftyControllers\OhMiPiMiSupplierNameController;
use App\Http\Controllers\HealthAndSaftyControllers\OhMiPiMiSupplierTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\OhMrBeBenefitTypeController;
use App\Http\Controllers\HealthAndSaftyControllers\OhMrBenefitRequestController;
use App\Http\Controllers\HealthAndSaftyControllers\OsMiMedicineNameController;
use App\Http\Controllers\HealthAndSaftyControllers\OsMiMedicineNameFormController;
use App\Http\Controllers\HealthAndSaftyControllers\OsMiMedicineRequestController;
use App\Http\Controllers\HealthAndSaftyControllers\OsMiMedicineTypeController;
use App\Http\Controllers\ImageUploadController;
use App\Http\Controllers\SocialApps\SaArEmploymentClassificationController;
use App\Http\Controllers\SocialApps\SaArResignationTypeController;
use App\Http\Controllers\SocialApps\SaAttritionRecordController;
use App\Http\Controllers\SocialApps\SaGrCategoryController;
use App\Http\Controllers\SocialApps\SaGrChannelController;
use App\Http\Controllers\SocialApps\SaGrievanceRecodeController;
use App\Http\Controllers\SocialApps\SaGrSubmissionsController;
use App\Http\Controllers\SocialApps\SaGrTopicController;
use App\Http\Controllers\SocialApps\SaRagRecodeController;
use App\Http\Controllers\SocialApps\SaRrCategoryController;
use App\Http\Controllers\SocialApps\SaRrDesignationNameController;
use App\Http\Controllers\SocialApps\SaRrEmployeeTypeController;
use App\Http\Controllers\SocialApps\SaRrEmploymentTypeController;
use App\Http\Controllers\SocialApps\SaRrFunctionController;
use App\Http\Controllers\SocialApps\SaRrSourceOfHirngController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiExternalAuditCategoryController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiExternalAuditFirmController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiExternalAuditRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiExternalAuditStandardController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiExternalAuditTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaAuditTitleController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaAuditTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaContactPersonController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaInternalAuditeeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaProcessTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaQuestionRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiIaSuplierTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiInternalAuditFactoryController;
use App\Http\Controllers\SustainabilityAppsControllers\SaAiInternalAuditRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmChemicalFormTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmChemicalManagementRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmCmrCommercialNameController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmCmrHazardTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmCmrProductStandardController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmCmrUseOfPPEController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmCmrZdhcCategoryController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmPirPositiveListController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmPirSuplierNameController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmPirTestingLabController;
use App\Http\Controllers\SustainabilityAppsControllers\SaCmPurchaseInventoryRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaEmrConsumptionCategoryController;
use App\Http\Controllers\SustainabilityAppsControllers\SaEnvirementManagementRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaEnvirementTargetSettingRecodeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaETsCategoryController;
use App\Http\Controllers\SustainabilityAppsControllers\SaETsSourceController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrAdditionalSDGController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrAlignmentSDGController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrIdImpactTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrMaterialityIssuesController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrMaterialityTypeController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrPillarsController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrSDGController;
use App\Http\Controllers\SustainabilityAppsControllers\SaSrSDGReportingRecodeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CustomDashboardController;
use Illuminate\Support\Facades\Route;

Route::post('calculate', [CalculationController::class, 'store']);
Route::post('register', [RegisteredUserController::class, 'store']);

Route::get('all-users', [UserController::class, 'index']);
Route::get('users/search', [UserController::class, 'search']);

Route::post('login', [LoginController::class, 'login']);
Route::post('verify-2fa', [LoginController::class, 'verify2fa']);
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail']);
Route::post('reset-password', [ForgotPasswordController::class, 'otpVerifyFunction']);
Route::post('change-password', [ForgotPasswordController::class, 'changePassword']);
Route::get('organizations', [OrganizationController::class, 'index']);

Route::middleware('auth:sanctum')->get('user', [UserController::class, 'show']);
Route::middleware('auth:sanctum')->post('logout', [LogoutController::class, 'logout']);

Route::middleware('auth:sanctum')->group(function () {

    // ── Company Settings ──────────────────────────────────────────────────────
    Route::post('organizations/{id}/update', [OrganizationController::class, 'update'])
        ->middleware('permission:COMPANY_SETTING_EDIT');
    Route::delete('organizations/{id}/delete', [OrganizationController::class, 'destroy'])
        ->middleware('permission:COMPANY_SETTING_EDIT');

    // Company holidays – read open to all authenticated; write requires COMPANY_SETTING_EDIT
    Route::get('company-holidays', [\App\Http\Controllers\CommonControllers\CompanyHolidayController::class, 'index']);
    Route::get('company-holidays/{company_holiday}', [\App\Http\Controllers\CommonControllers\CompanyHolidayController::class, 'show']);
    Route::post('company-holidays', [\App\Http\Controllers\CommonControllers\CompanyHolidayController::class, 'store'])
        ->middleware('permission:COMPANY_SETTING_EDIT');
    Route::put('company-holidays/{company_holiday}', [\App\Http\Controllers\CommonControllers\CompanyHolidayController::class, 'update'])
        ->middleware('permission:COMPANY_SETTING_EDIT');
    Route::delete('company-holidays/{company_holiday}', [\App\Http\Controllers\CommonControllers\CompanyHolidayController::class, 'destroy'])
        ->middleware('permission:COMPANY_SETTING_EDIT');

    // ── User / Own Profile ────────────────────────────────────────────────────
    Route::get('users-assignee', [UserController::class, 'assignee']);
    Route::get('user/active-sessions', [UserController::class, 'activeSessions']);

    Route::post('user-change-password', [UserController::class, 'changePassword'])
        ->middleware('permission:USER_SETTING_EDIT');
    Route::post('user/{id}/profile-update', [UserController::class, 'profileUpdate'])
        ->middleware('permission:USER_SETTING_EDIT');
    Route::post('user/{id}/email-change', [UserController::class, 'emailChangeInitiate'])
        ->middleware('permission:USER_SETTING_EDIT');
    Route::post('user/{id}/email-change-verify', [UserController::class, 'emailChangeVerify'])
        ->middleware('permission:USER_SETTING_EDIT');
    Route::post('user/{id}/email-change-confirm', [UserController::class, 'emailChangeConfirm'])
        ->middleware('permission:USER_SETTING_EDIT');
    Route::delete('user/active-sessions/{tokenId}', [UserController::class, 'revokeSession'])
        ->middleware('permission:USER_SETTING_EDIT');

    Route::get('user/login-history', [UserController::class, 'loginHistory'])
        ->middleware('permission:USER_SETTING_VIEW');
    Route::get('user/export-data', [UserController::class, 'exportData'])
        ->middleware('permission:USER_SETTING_VIEW');

    // ── Administration – Users ────────────────────────────────────────────────
    Route::get('users', [AdminController::class, 'index'])
        ->middleware('permission:ADMIN_USERS_VIEW');
    Route::get('users-assignee-level', [AdminController::class, 'assigneeLevel'])
        ->middleware('permission:ADMIN_USERS_VIEW');
    Route::post('users/{id}/update', [AdminController::class, 'update'])
        ->middleware('permission:ADMIN_USERS_EDIT');
    Route::delete('users/{id}', [AdminController::class, 'destroy'])
        ->middleware('permission:ADMIN_USERS_EDIT');

    // ── Administration – Access Management ───────────────────────────────────
    Route::get('user-permissions', [ComPermissionController::class, 'index'])
        ->middleware('permission:ADMIN_ACCESS_MNG_VIEW');
    Route::get('user-permissions/{id}/show', [ComPermissionController::class, 'show'])
        ->middleware('permission:ADMIN_ACCESS_MNG_VIEW');
    Route::post('user-permissions', [ComPermissionController::class, 'store'])
        ->middleware('permission:ADMIN_ACCESS_MNG_CREATE');
    Route::post('user-permissions/{id}/update', [ComPermissionController::class, 'update'])
        ->middleware('permission:ADMIN_ACCESS_MNG_EDIT');
    Route::delete('user-permissions/{id}/delete', [ComPermissionController::class, 'destroy'])
        ->middleware('permission:ADMIN_ACCESS_MNG_DELETE');

    // ── Dashboard ─────────────────────────────────────────────────────────────
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])
        ->middleware('permission:DASHBOARD_VIEW');

    // ── Systems – read open (needed by dashboard, setup, input, access mgmt) ──
    Route::get('systems', [\App\Http\Controllers\SystemController::class, 'index']);
    Route::get('systems/{system}', [\App\Http\Controllers\SystemController::class, 'show']);

    // Systems – write requires SYSTEM_SETUP_EDIT
    Route::post('systems', [\App\Http\Controllers\SystemController::class, 'store'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::put('systems/{system}', [\App\Http\Controllers\SystemController::class, 'update'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::delete('systems/{system}', [\App\Http\Controllers\SystemController::class, 'destroy'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');

    // ── Metrics ───────────────────────────────────────────────────────────────
    // Read – open to all authenticated users
    Route::get('/systems/{system}/metrics', [\App\Http\Controllers\MetricController::class, 'index']);

    // Create / Delete – SYSTEM_SETUP_EDIT only
    Route::post('/systems/{system}/metrics', [\App\Http\Controllers\MetricController::class, 'store'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::delete('/metrics/{metric}', [\App\Http\Controllers\MetricController::class, 'destroy'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');

    // Update – SYSTEM_SETUP_EDIT (admin KPI config) OR INPUT_PAGE_EDIT (user data entry)
    Route::put('/metrics/{metric}', [\App\Http\Controllers\MetricController::class, 'update'])
        ->middleware('permission:SYSTEM_SETUP_EDIT,INPUT_PAGE_EDIT');

    // ── Banks ─────────────────────────────────────────────────────────────────
    Route::get('banks', [\App\Http\Controllers\BankController::class, 'index']);
    Route::get('banks/{bank}', [\App\Http\Controllers\BankController::class, 'show']);
    Route::post('banks', [\App\Http\Controllers\BankController::class, 'store'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::put('banks/{bank}', [\App\Http\Controllers\BankController::class, 'update'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::delete('banks/{bank}', [\App\Http\Controllers\BankController::class, 'destroy'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');

    // ── Metric Items ──────────────────────────────────────────────────────────
    // Read – open to all authenticated
    Route::get('/metrics/{metric}/items', [\App\Http\Controllers\MetricItemController::class, 'index']);

    // Create / Delete – SYSTEM_SETUP_EDIT only
    Route::post('/metrics/{metric}/items', [\App\Http\Controllers\MetricItemController::class, 'store'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');
    Route::delete('/metrics/{metric}/items/{item}', [\App\Http\Controllers\MetricItemController::class, 'destroy'])
        ->middleware('permission:SYSTEM_SETUP_EDIT');

    // Update – SYSTEM_SETUP_EDIT OR INPUT_PAGE_EDIT
    Route::put('/metrics/{metric}/items/{item}', [\App\Http\Controllers\MetricItemController::class, 'update'])
        ->middleware('permission:SYSTEM_SETUP_EDIT,INPUT_PAGE_EDIT');

    // ── AI Suggestions ────────────────────────────────────────────────────────
    Route::get('/metrics/{metric}/ai-suggestions', [\App\Http\Controllers\KpiSuggestionController::class, 'generate'])
        ->middleware('permission:SYSTEM_SETUP_VIEW');

    // ── Daily Historical Values ────────────────────────────────────────────────
    // READ: dashboard users also need this for the historical progress chart
    Route::get('/metrics/{metric}/daily-values', [\App\Http\Controllers\MetricDailyValueController::class, 'index'])
        ->middleware('permission:INPUT_PAGE_VIEW,DASHBOARD_VIEW');
    Route::get('/metrics/{metric}/daily-values/{date}', [\App\Http\Controllers\MetricDailyValueController::class, 'show'])
        ->middleware('permission:INPUT_PAGE_VIEW,DASHBOARD_VIEW');
    // WRITE: input page edit only
    Route::post('/metrics/{metric}/daily-values', [\App\Http\Controllers\MetricDailyValueController::class, 'store'])
        ->middleware('permission:INPUT_PAGE_EDIT');
        
    // ── Custom Page Dashboard ────────────────────────────────────────────────
    Route::get('/custom-dashboard/history', [CustomDashboardController::class, 'history'])
        ->middleware('permission:CUSTOM_PAGE_VIEW');
    Route::get('/custom-dashboard', [CustomDashboardController::class, 'index'])
        ->middleware('permission:CUSTOM_PAGE_VIEW');
    Route::post('/custom-dashboard', [CustomDashboardController::class, 'store'])
        ->middleware('permission:CUSTOM_PAGE_EDIT');
});

Route::middleware('auth:sanctum')->group(function () {


    Route::get('chemical-records', [SaCmChemicalManagementRecodeController::class, 'index']);
    Route::post('chemical-records', [SaCmChemicalManagementRecodeController::class, 'store']);
    Route::post('chemical-records/{id}/update', [SaCmChemicalManagementRecodeController::class, 'update']);
    Route::delete('chemical-records/{id}/delete', [SaCmChemicalManagementRecodeController::class, 'destroy']);
    Route::get('chemical-records-assignee', [SaCmChemicalManagementRecodeController::class, 'assignee']);
    Route::post('chemical-records/{id}/approve', [SaCmChemicalManagementRecodeController::class, 'approvedStatus']);

    Route::get('purchase-inventory-records', [SaCmPurchaseInventoryRecodeController::class, 'index']);
    Route::post('purchase-inventory-records/{id}/update', [SaCmPurchaseInventoryRecodeController::class, 'update']);
    Route::post('purchase-inventory-records/{id}/publish-update', [SaCmPurchaseInventoryRecodeController::class, 'publishStatus']);
    Route::delete('purchase-inventory-record/{id}/delete', [SaCmPurchaseInventoryRecodeController::class, 'destroy']);
    Route::get('chemical-transaction-published', [SaCmPurchaseInventoryRecodeController::class, 'getPublishedStatus']);
    Route::get('purchase-inventory-records-assign-task', [SaCmPurchaseInventoryRecodeController::class, 'assignTask']);
    Route::get('purchase-inventory-records-assign-task-approved', [SaCmPurchaseInventoryRecodeController::class, 'assignTaskApproved']);
    Route::post('purchase-inventory-records/{id}/approve', [SaCmPurchaseInventoryRecodeController::class, 'updateStatusToApproved']);

    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/stock-amount', [SaCmPurchaseInventoryRecodeController::class, 'getStockAmount']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/monthly-delivery', [SaCmPurchaseInventoryRecodeController::class, 'getMonthlyDelivery']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/latest-record', [SaCmPurchaseInventoryRecodeController::class, 'getLatestRecord']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/transaction-latest-record', [SaCmPurchaseInventoryRecodeController::class, 'getTransactionLatestRecord']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/stock-threshold', [SaCmPurchaseInventoryRecodeController::class, 'getStockThreshold']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/highest-stock', [SaCmPurchaseInventoryRecodeController::class, 'getHighestStock']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/status-summary', [SaCmPurchaseInventoryRecodeController::class, 'getStatusSummary']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/chemical-inventory-insights', [SaCmPurchaseInventoryRecodeController::class, 'getChemicalInventoryInsights']);
    Route::get('chemical-dashboard/{Year}/all-summary', [SaCmPurchaseInventoryRecodeController::class, 'getAllSummary']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/category-and-classification', [SaCmPurchaseInventoryRecodeController::class, 'getCategoryAndClassification']);
    Route::get('chemical-dashboard/{startDate}/{endDate}/{division}/do-you-have-msds', [SaCmPurchaseInventoryRecodeController::class, 'getDoYouHaveMsdsPercentage']);

});


Route::get('responsible-section', [ResponsibleSectionController::class, 'index']);
Route::post('responsible-section', [ResponsibleSectionController::class, 'store']);

Route::get('assignee-level', [AssigneeLevelController::class, 'index']);

Route::get('job-positions', [JobPositionController::class, 'index']);
Route::post('job-positions', [JobPositionController::class, 'store']);

Route::get('user-types', [UserTypeController::class, 'index']);
Route::post('user-types', [UserTypeController::class, 'store']);

Route::post('departments', [DepartmentController::class, 'store']);
Route::get('departments', [DepartmentController::class, 'index']);

Route::get('factory', [FactoryController::class, 'show']);
Route::post('factory', [FactoryController::class, 'store']);

Route::get('person-types', [PersonTypeController::class, 'index']);
Route::post('person-types', [PersonTypeController::class, 'store']);

Route::get('consumption-categories', [SaEmrConsumptionCategoryController::class, 'index']);
Route::post('consumption-categories', [SaEmrConsumptionCategoryController::class, 'store']);
Route::get('consumption-get-categories', [SaEmrConsumptionCategoryController::class, 'getcategories']);
Route::get('consumption-get/{categoryName}/units', [SaEmrConsumptionCategoryController::class, 'getUnit']);
Route::get('consumption-get/{categoryName}/sources', [SaEmrConsumptionCategoryController::class, 'getSource']);

Route::get('commercial-names', [SaCmCmrCommercialNameController::class, 'index']);
Route::post('commercial-names', [SaCmCmrCommercialNameController::class, 'store']);

Route::get('chemical-supplier-names', [SaCmPirSuplierNameController::class, 'index']);
Route::post('chemical-supplier-names', [SaCmPirSuplierNameController::class, 'store']);

Route::get('chemical-form-types', [SaCmChemicalFormTypeController::class, 'index']);
Route::post('chemical-form-types', [SaCmChemicalFormTypeController::class, 'store']);

Route::get('zdhc-categories', [SaCmCmrZdhcCategoryController::class, 'index']);
Route::post('zdhc-categories', [SaCmCmrZdhcCategoryController::class, 'store']);

Route::get('product-standard', [SaCmCmrProductStandardController::class, 'index']);
Route::post('product-standard', [SaCmCmrProductStandardController::class, 'store']);

Route::get('hazard-types', [SaCmCmrHazardTypeController::class, 'index']);
Route::post('hazard-types', [SaCmCmrHazardTypeController::class, 'store']);

Route::get('use-of-ppes', [SaCmCmrUseOfPPEController::class, 'index']);
Route::post('use-of-ppes', [SaCmCmrUseOfPPEController::class, 'store']);

Route::get('testing-labs', [SaCmPirTestingLabController::class, 'index']);
Route::post('testing-labs', [SaCmPirTestingLabController::class, 'store']);

Route::get('positive-list', [SaCmPirPositiveListController::class, 'index']);
Route::post('positive-list', [SaCmPirPositiveListController::class, 'store']);

Route::get('hr-divisions', [\App\Http\Controllers\DivisionController::class, 'index']);

Route::get('image/{imageId}', [ImageUploadController::class, 'getImage']);
Route::post('upload', [ImageUploadController::class, 'uploadImage']);
Route::delete('image/{imageId}', [ImageUploadController::class, 'deleteImage']);
Route::post('image/update/{imageId}', [ImageUploadController::class, 'updateImage']);
