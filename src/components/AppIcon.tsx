import React from 'react';
import { Icon, type IconifyIcon } from '@iconify/react';
import { cn } from '../lib/utils';

interface AppIconProps {
  icon: string | IconifyIcon;
  className?: string;
  size?: number;
}

export const AppIcon: React.FC<AppIconProps> = ({ icon, className, size = 20 }) => {
  return <Icon icon={icon} width={size} height={size} className={cn('shrink-0', className)} aria-hidden="true" />;
};
