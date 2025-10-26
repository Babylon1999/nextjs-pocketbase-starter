import React from "react";
import type { IconBaseProps } from "react-icons";
import { SiPocketbase } from "react-icons/si";

interface PocketBaseIconProps {
  className?: string;
}

export const PocketBaseIcon: React.FC<PocketBaseIconProps> = ({
  className,
}) => {
  const Icon = SiPocketbase as React.ComponentType<IconBaseProps>;
  return <Icon className={className} />;
};
