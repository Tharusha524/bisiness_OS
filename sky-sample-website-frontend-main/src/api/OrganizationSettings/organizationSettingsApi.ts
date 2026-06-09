import api from "../../utils/api";
import { z } from "zod";
import { StorageFileSchema } from "../../utils/StorageFiles.util";

export const ColorPalletSchema = z.object({
  palletId: z.number(),
  primaryColor: z.string(),
  secondaryColor: z.string(),
  buttonColor: z.string(),
});
export type ColorPallet = z.infer<typeof ColorPalletSchema>;

export const OrganizationSchema = z.object({
  id: z.number(),
  organizationName: z.string(),
  organizationFactoryName: z.string(),
  logoUrl: z.array(z.union([z.instanceof(File), StorageFileSchema])).optional(),
  insightDescription: z.string(),
  colorPallet: z.array(ColorPalletSchema),
  insightImage: z
    .array(z.union([z.instanceof(File), StorageFileSchema]))
    .optional(),
  created_at: z.date().optional(),
  companyWebsite: z.string().optional().nullable(),
  supportEmail: z.string().optional().nullable(),
  defaultCurrency: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  dateFormat: z.string().optional().nullable(),
  headquartersAddress: z.string().optional().nullable(),
  taxId: z.string().optional().nullable(),
  financialYearStart: z.string().optional().nullable(),
  sessionTimeout: z.number().optional().nullable(),
  enforce2fa: z.boolean().optional().nullable(),
  globalAlertEmails: z.string().optional().nullable(),
  enableAutomatedReports: z.boolean().optional().nullable(),
  companyPhone: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  passwordMinLength: z.number().optional().nullable(),
  passwordRequireUppercase: z.boolean().optional().nullable(),
  passwordRequireNumbers: z.boolean().optional().nullable(),
  passwordRequireSymbols: z.boolean().optional().nullable(),
  passwordExpiryDays: z.number().optional().nullable(),
  allowedEmailDomains: z.array(z.string()).optional().nullable(),
  allowSelfRegistration: z.boolean().optional().nullable(),
  workingDays: z.array(z.string()).optional().nullable(),
  enabledModules: z.array(z.string()).optional().nullable(),
  kpiWarningThresholdYellow: z.number().optional().nullable(),
  kpiWarningThresholdRed: z.number().optional().nullable(),
  reportHeader: z.string().optional().nullable(),
  reportFooter: z.string().optional().nullable(),
  reportPrimaryColor: z.string().optional().nullable(),
  maintenanceMode: z.boolean().optional().nullable(),
  maintenanceMessage: z.string().optional().nullable(),
  auditLogRetentionDays: z.number().optional().nullable(),
  defaultExportFormat: z.string().optional().nullable(),
  passwordPolicy: z.string().optional().nullable(),
  historicalDataGracePeriod: z.number().optional().nullable(),
  dataEntryDeadlineTime: z.string().optional().nullable(),
  workingHoursStart: z.string().optional().nullable(),
  workingHoursEnd: z.string().optional().nullable(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export async function getOrganization() {
  const res = await api.get(`/organizations`);
  return res.data;
}

export const updateOrganization = async (organization: Organization) => {
  if (!organization.id) {
    throw new Error("Org must have an ID for an update.");
  }

  const formData = new FormData();

  // Explicitly handle logoUrl
  if (Array.isArray(organization.logoUrl)) {
    const logo = organization.logoUrl[0];
    if (logo instanceof File) {
      formData.append("logoUrl", logo);
    }
  }

  // Explicitly handle insightImage
  if (Array.isArray(organization.insightImage)) {
    const insight = organization.insightImage[0];
    if (insight instanceof File) {
      formData.append("insightImage", insight);
    }
  }

  // Handle all other fields
  Object.keys(organization).forEach((key) => {
    const value = organization[key as keyof Organization];

    if (key === "logoUrl" || key === "insightImage") return;

    if (Array.isArray(value)) {
      if (key === 'allowedEmailDomains' || key === 'workingDays' || key === 'enabledModules') {
         value.forEach((item, index) => {
           formData.append(`${key}[${index}]`, typeof item === 'object' ? JSON.stringify(item) : String(item));
         });
      } else if (key === 'colorPallet') {
         (value as ColorPallet[]).forEach((item: ColorPallet, index: number) => {
           Object.keys(item).forEach(subKey => {
             formData.append(`${key}[${index}][${subKey}]`, String(item[subKey as keyof ColorPallet]));
           });
         });
      } else {
         (value as object[]).forEach((item: object, index: number) => {
           formData.append(`${key}[${index}]`, JSON.stringify(item));
         });
      }
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (typeof value === "boolean") {
      formData.append(key, value ? "1" : "0");
    } else if (value !== null && value !== undefined) {
      formData.append(key, value.toString());
    }
  });
  try {
    const response = await api.post(
      `/organizations/${organization.id}/update`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating Org:", error);
    throw error;
  }
};
