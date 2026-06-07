import React from "react";
import { PermissionKeys } from "../views/Administration/SectionList";
import useCurrentUser from "../hooks/useCurrentUser";

interface Props {
  accessKey: PermissionKeys;
  children: React.ReactNode;
}

const PermissionWrapper: React.FC<Props> = ({ accessKey, children }: Props) => {
  const { user } = useCurrentUser();

  if (!user?.permissionObject?.[accessKey]) {
    return null;
  }

  return children;
};

export default PermissionWrapper;
