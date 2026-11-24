// Common shared components — Root Master Barrel Export (Flat Architecture)

// 1. Cards Suite (Flatten, Stats, Ribbon, Accent & Charts)
export {
  default as FlattenStatCard,
  FlattenStatCard as AppFlattenStatCard,
  FlattenProjectStatCard,
  FlattenCryptoStatCard,
  FlattenStatsGrid,
} from './FlattenStatCard'
export type {
  FlattenStatCardProps,
  FlattenStatsGridProps,
  FlattenStatColor,
  FlattenStatVariant,
  FlattenTrendProps,
} from './FlattenStatCard'

export {
  default as FlattenCard,
  FlattenCard as AppFlattenCard,
  FlattenUserItem,
  FlattenFileItem,
  FlattenChatItem,
  FlattenApplicationItem,
  FlattenTaskItem,
  FlattenTransactionItem,
  FlattenCryptoTxItem,
  FlattenPerformanceItem,
  FlattenActivityHistoryItem,
  FlattenTaskListCard,
  FlattenRecentTransactionsCard,
  FlattenLatestCryptoTxCard,
  FlattenTopPerformanceCard,
  FlattenTransactionHistoryCard,
} from './FlattenCard'
export type {
  FlattenCardProps,
  FlattenUserItemProps,
  FlattenFileItemProps,
  FlattenChatItemProps,
  FlattenApplicationItemProps,
  FlattenTaskItemProps,
  FlattenTransactionItemProps,
  FlattenCryptoTxItemProps,
  FlattenPerformanceItemProps,
  FlattenActivityHistoryItemProps,
  FlattenTaskListCardProps,
  FlattenRecentTransactionsCardProps,
  FlattenLatestCryptoTxCardProps,
  FlattenTopPerformanceCardProps,
  FlattenTransactionHistoryCardProps,
} from './FlattenCard'

export {
  FlattenRadialProgressCard,
  FlattenIncomeAnalyticsCard,
  FlattenTaskSummaryCard,
  FlattenMarketOverviewCard,
  FlattenCryptoStatsCard,
} from './FlattenChartCards'
export type {
  FlattenRadialProgressCardProps,
  RadialRingData,
  FlattenIncomeAnalyticsCardProps,
  AnalyticsSegment,
  FlattenTaskSummaryCardProps,
  FlattenMarketOverviewCardProps,
  FlattenCryptoStatsCardProps,
} from './FlattenChartCards'

export {
  default as StatsCard,
  StatsCard as EnterpriseStatsCard,
  StatsCard as GlobalStatsCard,
  MiniStatsCard,
  MiniStatsCard as EnterpriseMiniStatsCard,
  StatsGrid,
  StatsGrid as EnterpriseStatsGrid,
  CircularProgressRing,
} from './StatsCard'
export type {
  StatsCardProps,
  MiniStatsCardProps,
  StatsGridProps,
  StatsCardProps as EnterpriseStatsCardProps,
  MiniStatsCardProps as EnterpriseMiniStatsCardProps,
  StatsGridProps as EnterpriseStatsGridProps,
  CircularProgressRingProps,
  StatsCardVariant,
} from './StatsCard'

export {
  default as RibbonStatsCard,
  RibbonStatsCard as WaveStatsCard,
  RibbonStatsCard as EnterpriseWaveCard,
  RibbonStatsGrid,
  RibbonStatsGrid as WaveStatsGrid,
  RibbonStatsGrid as EnterpriseWaveGrid,
} from './RibbonStatsCard'
export type {
  RibbonStatsCardProps,
  RibbonStatsGridProps,
  RibbonStatsVariant,
  RibbonStatsTrend,
  RibbonStatsCardProps as WaveStatsCardProps,
  RibbonStatsGridProps as WaveStatsGridProps,
} from './RibbonStatsCard'

export {
  default as AccentStatCard,
  AccentStatCard as StripeStatCard,
  AccentStatGrid,
  StockSummaryCards,
} from './AccentStatCard'
export type {
  AccentStatCardProps,
  AccentStatGridProps,
  AccentCardVariant,
  StockCounts,
  StockSummaryCardsProps,
} from './AccentStatCard'

export {
  default as StockAlertOverviewCards,
  StockAlertOverviewCards as GlobalStockAlertCards,
} from './StockAlertOverviewCards'
export type {
  StockAlertOverviewCardsProps,
  StockFilterTab,
  StockAlertCounts,
  StockAlertConfig,
} from './StockAlertOverviewCards'

// 2. Badges & Indicators
export { default as StatusBadge } from './StatusBadge'
export type { StatusBadgeProps } from './StatusBadge'

export { default as PercentBadge } from './PercentBadge'
export type { PercentBadgeProps, PercentBadgeVariant } from './PercentBadge'

// 3. Buttons & Action Groups
export {
  HeaderActionsGroup,
  AddButton,
  ActionButton,
  SecondaryButton,
  ExportButton,
  ImportButton,
  QrKioskButton,
  SaveButton,
  CancelButton,
  FilterButton,
  RefreshButton,
  ResetButton,
  RowActionGroup,
  RowActionButton,
  ViewRowButton,
  EditRowButton,
  DeleteRowButton,
  CopyRowButton,
  PrintRowButton,
} from './GlobalActionButtons'
export type {
  HeaderActionsGroupProps,
  AddButtonProps,
  ActionButtonProps,
  ExportButtonProps,
  ImportButtonProps,
  QrKioskButtonProps,
  SaveButtonProps,
  CancelButtonProps,
  FilterButtonProps,
  RefreshButtonProps,
  ResetButtonProps,
  RowActionGroupProps,
  RowActionButtonProps,
  RowActionVariant,
  RowActionColor,
  EditRowButtonProps,
} from './GlobalActionButtons'

export { default as CloseButton } from './CloseButton'
export type { CloseButtonProps, CloseButtonVariant, CloseButtonSize } from './CloseButton'

// 4. Feedback, Loading & Error State
export {
  default as EmptyState,
  EmptyState as GlobalEmptyState,
  TableEmptyState,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from './EmptyState'
export type { EmptyStateProps, EmptyStateAction } from './EmptyState'

export { default as LoadingSpinner } from './LoadingSpinner'
export type { LoadingSpinnerProps } from './LoadingSpinner'

export { default as ErrorBoundary } from './ErrorBoundary'
export type { ErrorBoundaryProps } from './ErrorBoundary'

// 5. Forms & Inputs Suite
export {
  default as FormLayout,
  FormLayout as GlobalFormLayout,
  FormContent,
  FormCard,
  FormSection,
} from './FormLayout'
export type {
  FormLayoutProps,
  FormContentProps,
  FormCardProps,
  FormSectionProps,
  FormCardIconVariant,
  FormMaxWidth,
} from './FormLayout'

export { default as FormHeader, FormHeaderButton } from './FormHeader'
export type { FormHeaderProps, FormHeaderButtonProps } from './FormHeader'

export { default as FormFooter } from './FormFooter'
export type { FormFooterProps } from './FormFooter'

export { default as FormDrawer } from './FormDrawer'
export type { FormDrawerProps } from './FormDrawer'

export { default as FormField, FieldError, FieldLabel, getFieldClass } from './FormField'
export type { FormFieldProps, FieldErrorProps, FieldLabelProps } from './FormField'

export { default as Input, Input as AppInput, EnterpriseInput } from './Input'
export type { InputProps } from './Input'

export { default as Textarea, Textarea as AppTextarea, EnterpriseTextarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { default as Select, Select as AppSelect, EnterpriseSelect } from './Select'
export type { EnterpriseSelectOption, EnterpriseSelectProps, SelectOption, SelectProps } from './Select'

export {
  default as DatePicker,
  DatePicker as AppDatePicker,
  MonthPicker,
  MonthPicker as AppMonthPicker,
  TimePicker,
  TimePicker as AppTimePicker,
  DateTimePicker,
  DateTimePicker as AppDateTimePicker,
  EnterpriseDatePicker,
  EnterpriseMonthPicker,
  EnterpriseTimePicker,
  EnterpriseDateTimePicker,
  MuiDatePicker,
  MuiMonthPicker,
  MuiTimePicker,
  MuiDateTimePicker,
} from './DatePicker'
export type {
  DatePickerProps,
  DatePickerProps as AppDatePickerProps,
  MonthPickerProps,
  MonthPickerProps as AppMonthPickerProps,
  TimePickerProps,
  TimePickerProps as AppTimePickerProps,
  DateTimePickerProps,
  DateTimePickerProps as AppDateTimePickerProps,
  EnterpriseDatePickerProps,
  EnterpriseMonthPickerProps,
  EnterpriseTimePickerProps,
  EnterpriseDateTimePickerProps,
} from './DatePicker'

export { default as DateNavigator, DateNavigator as AppDateNavigator } from './DateNavigator'
export type { DateNavigatorProps } from './DateNavigator'

export { default as ToggleSwitch } from './ToggleSwitch'
export type { ToggleSwitchProps } from './ToggleSwitch'

export { default as FileUpload } from './FileUpload'
export type { FileUploadProps } from './FileUpload'

export { default as CountryPhoneInput, SUPPORTED_PHONE_COUNTRIES } from './CountryPhoneInput'
export type { CountryPhoneInputProps, CountryPhoneConfig } from './CountryPhoneInput'

export { default as RichTextEditor } from './RichTextEditor'
export type { RichTextEditorProps } from './RichTextEditor'

export { default as IconColorPicker } from './IconColorPicker'
export type { IconColorPickerProps } from './IconColorPicker'

// 6. Media, Avatars & Visuals
export { default as UserAvatar } from './UserAvatar'
export type { UserAvatarProps } from './UserAvatar'

export { default as AvatarImage } from './AvatarImage'
export type { AvatarImageProps } from './AvatarImage'

export { default as AppImage } from './AppImage'
export type { AppImageProps } from './AppImage'

export { default as BrandLogo } from './BrandLogo'

export { default as SupplierLogo } from './SupplierLogo'
export type { SupplierLogoProps } from './SupplierLogo'

export { CATEGORY_ICONS_MAP, CATEGORY_COLORS, resolveCategoryVisual } from './categoryIconConstants'
export type { ColorDef } from './categoryIconConstants'

// 7. Modals, Drawers & Dialogs
export { default as Modal, Modal as AppModal, EnterpriseModal } from './Modal'
export type { EnterpriseModalProps, ModalProps, ModalSize } from './Modal'

export { default as ModalHeader } from './ModalHeader'
export type { ModalHeaderProps, ModalHeaderIconVariant } from './ModalHeader'

export { default as ModalFooter } from './ModalFooter'
export type { ModalFooterProps } from './ModalFooter'

export { default as ConfirmModal } from './ConfirmModal'
export type { ConfirmVariant, ConfirmModalProps } from './ConfirmModal'

export { default as DeleteConfirmDialog } from './DeleteConfirmDialog'
export type { DeleteConfirmDialogProps } from './DeleteConfirmDialog'

export { default as RejectConfirmDialog, RejectConfirmDialog as RejectConfirmModal } from './RejectConfirmDialog'
export type { RejectConfirmDialogProps } from './RejectConfirmDialog'

export {
  default as DetailDrawer,
  DetailDrawerHeader,
  DetailDrawerTabNav,
  DetailDrawerBody,
  DetailDrawerFooter,
  DetailDrawerCard,
  DetailDrawerRow,
} from './DetailDrawer'
export type {
  DetailDrawerProps,
  DetailDrawerSize,
  DetailDrawerIconVariant,
  DetailDrawerHeaderProps,
  DetailDrawerTabItem,
  DetailDrawerTabNavProps,
  DetailDrawerBodyProps,
  DetailDrawerFooterProps,
  DetailDrawerCardProps,
  DetailDrawerRowProps,
} from './DetailDrawer'

export { default as FilterDrawerShell, FilterSection, FilterField } from '@/components/shared/FilterDrawerShell'
export type { FilterDrawerShellProps } from '@/components/shared/FilterDrawerShell'

// 8. Navigation
export { default as PageHeader } from './PageHeader'
export type { PageHeaderProps } from './PageHeader'

export { default as Breadcrumb } from './Breadcrumb'
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb'

// 9. Showcase & Demo Playground
export { default as FlattenShowcase, FlattenShowcase as FlutterFlattenShowcase } from './FlattenShowcase'

// 10. Tables & Toolbars
export { default as DataTable } from './DataTable'
export type { Column, DataTableProps } from './DataTable'

export {
  default as TableToolbar,
  TableToolbar as GlobalTableToolbar,
  TableFilterToolbar,
  DataTableToolbar,
  SearchFilterToolbar,
} from './TableToolbar'
export type { TableToolbarProps } from './TableToolbar'

export { default as SearchFilter } from './SearchFilter'
export type { SearchFilterProps } from './SearchFilter'

export { ExportDropdown, default as DefaultExportDropdown } from './ExportDropdown'
export type {
  ExportDropdownProps,
  ExportDateRange,
  ExportDropdownOption,
  ExportDropdownVariant,
  ExportDropdownSize,
} from './ExportDropdown'

export { InlineFilterSelect, default as DefaultInlineFilterSelect } from './InlineFilterSelect'
export type { InlineFilterSelectProps, InlineFilterOption } from './InlineFilterSelect'

export { FilterPopover, default as DefaultFilterPopover } from './FilterPopover'
export type { FilterPopoverProps } from './FilterPopover'

export { ActiveFilterChips, default as DefaultActiveFilterChips } from './ActiveFilterChips'
export type { ActiveFilterChipsProps, ActiveFilterItem } from './ActiveFilterChips'

// 11. Shared Cross-component Re-exports (preserves existing imports)
export { default as ModernSelect } from '../shared/ModernSelect'
export type { ModernSelectProps, Option as ModernSelectOption } from '../shared/ModernSelect'
export { default as TableActionMenu } from '../shared/TableActionMenu'
export type { TableActionItem } from '../shared/TableActionMenu'
export { AdminRowActions, AdminActionButton, AdminDeleteButton, default as DefaultAdminRowActions } from '../admin/AdminRowActions'
export type { AdminRowActionsProps, AdminActionButtonProps, AdminActionSize, AdminActionVariant, ExtraActionItem } from '../admin/AdminRowActions'
export { default as SearchInput } from '../shared/SearchInput'
export type { SearchInputProps } from '../shared/SearchInput'
export { default as ColumnSettingsPopover } from '../shared/ColumnSettingsPopover'
export type { ColumnOption } from '../shared/ColumnSettingsPopover'
export { default as ConfirmDialog } from '../shared/ConfirmDialog'
export type { ConfirmDialogProps } from '../shared/ConfirmDialog'
export { default as BulkSelectionBanner } from '../shared/BulkSelectionBanner'
export type { BulkSelectionBannerProps } from '../shared/BulkSelectionBanner'
export { default as TableWrapper } from '../shared/TableWrapper'
export type { TableWrapperProps } from '../shared/TableWrapper'
export { default as WorkspaceTabs } from '../shared/WorkspaceTabs'
export type { WorkspaceTabItem, WorkspaceTabsProps } from '../shared/WorkspaceTabs'
export { default as LoadingSkeleton } from '../shared/LoadingSkeleton'
export { default as ProductThumbnail } from '@/pages/products/components/ProductThumbnail'
export type { ProductThumbnailProps } from '@/pages/products/components/ProductThumbnail'
export { AnimatedCounter } from '../shared/AnimatedCounter'

// Global Print & Official Document Standard Components
export { 
  GlobalPrintContainer, 
  GlobalPrintHeader, 
  GlobalPrintFooter,
  GlobalPrintContainer as PrintContainer,
  GlobalPrintHeader as PrintHeader,
  GlobalPrintFooter as PrintFooter,
} from '../shared/GlobalPrint'
export type { 
  GlobalPrintContainerProps,
  GlobalPrintHeaderProps, 
  CompanyPrintInfo,
  GlobalPrintFooterProps, 
  PrintSignatureRole 
} from '../shared/GlobalPrint'
