import { useQuery } from "@tanstack/react-query";
import { getOrganization } from "../api/OrganizationSettings/organizationSettingsApi";

export default function useOrganization() {
  const { data, isLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: getOrganization,
    staleTime: 5 * 60 * 1000,
  });

  const logoUrl: string | null = data?.logoUrl?.signedUrl ?? null;
  const organizationName: string | null = data?.organizationName ?? null;

  return { organization: data, logoUrl, organizationName, isLoading };
}
