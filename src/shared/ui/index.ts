/**
 * EventHub Design System - Main Export File
 * Basado en DESIGN_SYSTEM.md oficial
 */

// Theme System
export * from './theme/colors';
export * from './theme/typography';
export * from './theme/spacing';
export * from './theme/shadows';
export * from './theme/glassmorphism';
export * from './theme/scrollbars';
export * from './theme/animations';
export * from './theme/zindex';
export * from './theme/responsive';
export * from './theme/accessibility';

// UI Components
export * from './components/Button/Button.component';
export * from './components/Input/Input.component';
export * from './components/Card/Card.component';
export * from './components/Modal/Modal.component';
export * from './components/Badge/Badge.component';
export * from './components/Alert/Alert.component';
export * from './components/Toast/Toast.component';
export * from './components/FollowOrganizerButton/FollowOrganizerButton.component';
export * from './components/FollowedOrganizersFeed/FollowedOrganizersFeed.component';

// Utils
export * from './utils/cn';

// Re-export common types
export type { ButtonProps, IconButtonProps, CriticalButtonProps } from './components/Button/Button.component';
export type { InputProps } from './components/Input/Input.component';
export type { CardProps, StatisticalCardProps, CardWithSectionsProps, MetricCardProps } from './components/Card/Card.component';
export type { ModalProps } from './components/Modal/Modal.component';
export type { BadgeProps, BadgeWithIconProps, StatusBadgeProps, RoleBadgeProps } from './components/Badge/Badge.component';
export type { AlertProps, AlertWithActionProps, DismissibleAlertProps } from './components/Alert/Alert.component';
export type { ToastProps, ToastContainerProps, ToastOptions } from './components/Toast/Toast.component';
// Follow components do not export types beyond props already inferred