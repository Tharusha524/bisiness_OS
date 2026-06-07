import { useQuery } from "@tanstack/react-query";
import { User, validateUser } from "../api/userApi";

interface UseCurrentUserResult {
  user: User | undefined;
  status: "idle" | "loading" | "error" | "success" | "pending";
  isFetching: boolean;
}

function useCurrentUser(): UseCurrentUserResult {
  const hasToken = !!localStorage.getItem("token");

  const { data, status, isFetching } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: validateUser,
    enabled: hasToken,
  });

  return { user: data, status, isFetching };
}

export default useCurrentUser;
