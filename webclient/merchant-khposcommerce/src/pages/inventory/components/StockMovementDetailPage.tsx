import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryService } from "@/services/inventoryService";
import { useTranslation } from "react-i18next";
import { useThemeStore } from "@/stores/themeStore";
import {
  LoadingSpinner,
  EnterpriseModal,
  ActionButton,
  CancelButton,
} from "@/components/common";
import { formatShortDate } from "@/utils/formatters";
import { ProductThumbnail } from "@/pages/products/components/ProductThumbnail";
import { cn } from "@/lib/utils";

interface StockMovementDetailPageProps {
  movementId: number;
  onClose: () => void;
  onOpenProductDetail?: (inventoryId: number) => void;
}

export const StockMovementDetailPage: React.FC<
  StockMovementDetailPageProps
> = ({ movementId, onClose, onOpenProductDetail }) => {
  const { t } = useTranslation(["inventory", "buttons", "common", "products"]);
  const { language } = useThemeStore();

  const {
    data: detail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stock-movement-detail", movementId],
    queryFn: () => inventoryService.getMovement(movementId),
    enabled: !!movementId,
  });

  const qty = Number(detail?.quantity ?? 0);
  const isPlus =
    qty > 0 ||
    detail?.type === "in" ||
    detail?.type === "stock_in" ||
    detail?.type === "transfer_in" ||
    detail?.type === "adjustment";
  const beforeQty = Number(detail?.quantity_before ?? 0);
  const afterQty = Number(detail?.quantity_after ?? 0);
  const unitCost = detail?.unit_cost ? Number(detail.unit_cost) : null;
  const totalCostImpact = unitCost !== null ? Math.abs(qty) * unitCost : null;

  const formatMovementTypeLabel = (type: string | undefined) => {
    if (!type) return "—";
    const lower = type.toLowerCase();
    if (lower === "opname")
      return language === "km" ? "ការត្រួតពិនិត្យស្តុក" : "Stock Opname";
    if (lower === "in" || lower === "stock_in")
      return language === "km" ? "ស្តុកចូល" : "Stock In";
    if (lower === "out" || lower === "stock_out")
      return language === "km" ? "ស្តុកចេញ" : "Stock Out";
    if (lower.includes("transfer"))
      return language === "km" ? "ការផ្ទេរស្តុក" : "Stock Transfer";
    if (lower === "adjustment")
      return language === "km"
        ? "ការកែសម្រួលស្តុក"
        : "Stock Adjustment";
    return type;
  };

  const formattedRef = detail?.reference_number
    ? `#${detail.reference_number}`
    : `#MOV-${movementId}`;

  const productImage =
    detail?.product?.primary_image ||
    (detail?.product as any)?.image ||
    (detail?.product as any)?.images?.[0] ||
    null;
  const hasProductImage = Boolean(productImage);

  return (
    <EnterpriseModal
      isOpen={Boolean(movementId)}
      onClose={onClose}
      size="3xl"
      className="bg-card dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-border/80 dark:border-slate-800"
      bodyClassName="p-0"
      showCloseButton={true}
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-base sm:text-lg text-foreground">
            {language === "km"
              ? "ព័ត៌មានលម្អិតចលនាស្តុក"
              : "Stock Movement Details"}
          </span>
          <span className="font-mono text-xs sm:text-sm font-bold text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            {formattedRef}
          </span>
        </div>
      }
      subtitle={
        <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
              isPlus
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
            )}
          >
            {formatMovementTypeLabel(detail?.type)}
          </span>
          {detail?.warehouse?.name && (
            <>
              <span>•</span>
              <span className="font-medium text-foreground">
                {detail.warehouse.name}
              </span>
            </>
          )}
          {detail?.created_at && (
            <>
              <span>•</span>
              <span>{formatShortDate(detail.created_at)}</span>
            </>
          )}
        </div>
      }
      footer={
        <div className="px-5 sm:px-6 py-3.5 border-t border-border/80 dark:border-slate-800 bg-muted/20 dark:bg-slate-900/50 flex items-center justify-between gap-3 w-full shrink-0">
          <div>
            {detail?.inventory_id && onOpenProductDetail ? (
              <ActionButton
                variant="secondary"
                size="md"
                onClick={() => {
                  onClose();
                  onOpenProductDetail(detail.inventory_id);
                }}
              >
                {language === "km"
                  ? "មើលប័ណ្ណស្តុកទំនិញ"
                  : t("inventory.viewInventoryCard", "View Inventory Card")}
              </ActionButton>
            ) : (
              <div />
            )}
          </div>

          <div>
            <CancelButton
              onClick={onClose}
              label={language === "km" ? "បិទ" : t("common.close", "Close")}
            />
          </div>
        </div>
      }
    >
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-14 space-y-3">
            <LoadingSpinner />
            <p className="text-xs text-muted-foreground font-medium">
              Loading movement record...
            </p>
          </div>
        ) : isError || !detail ? (
          <div className="flex flex-col items-center justify-center p-14 space-y-4 text-center">
            <div className="p-4 rounded-full bg-rose-500/10 text-rose-500">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Failed to load movement
              </h3>
              <p className="text-xs text-muted-foreground">
                The requested stock movement log could not be retrieved.
              </p>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-7 space-y-6">
            {/* ── 2-COLUMN MAIN CONTENT (LEFT: PRODUCT & STOCK, RIGHT: TRANSACTION INFO) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* ── LEFT COLUMN: PRODUCT & STOCK QUANTITY CHANGE ── */}
              <div className="space-y-5">
                {/* Product Card */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {language === "km" ? "ទំនិញ" : "PRODUCT ITEM"}
                  </span>
                  <div className="p-4 rounded-2xl bg-muted/30 dark:bg-slate-800/40 border border-border/70 flex items-center gap-3.5">
                    <ProductThumbnail
                      name={detail.product?.name || "Product"}
                      primaryImage={productImage}
                      categoryName={detail.product?.category?.name}
                      size="lg"
                      className="w-14 h-14 rounded-xl shadow-2xs shrink-0 border border-border bg-card overflow-hidden"
                      preview={hasProductImage}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm sm:text-base font-bold text-foreground truncate">
                        {detail.product?.name || "Product"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {detail.product?.sku || `SKU-${detail.product_id}`}
                        {detail.product?.category?.name &&
                          ` · ${detail.product.category.name}`}
                      </p>
                      {unitCost !== null && (
                        <p className="text-xs text-muted-foreground font-medium mt-1">
                          {language === "km" ? "ថ្លៃដើមឯកតា" : "Unit Cost"}:{" "}
                          <span className="font-bold text-foreground">
                            ${unitCost.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stock Quantity Change Flow */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    {language === "km"
                      ? "ការប្រែប្រួលបរិមាណស្តុក"
                      : "STOCK QUANTITY CHANGE"}
                  </span>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {/* Before */}
                    <div className="p-3.5 rounded-xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs">
                      <span className="text-xs text-muted-foreground block font-medium mb-1">
                        {language === "km" ? "ស្តុកមុន" : "Stock Before"}
                      </span>
                      <span className="font-bold text-foreground text-xl sm:text-2xl tabular-nums">
                        {beforeQty}
                      </span>
                    </div>

                    {/* Quantity Changed */}
                    <div
                      className={cn(
                        "p-3.5 rounded-xl border font-bold shadow-2xs",
                        isPlus
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400",
                      )}
                    >
                      <span className="text-xs block font-medium mb-1">
                        {language === "km"
                          ? "បរិមាណកែប្រែ"
                          : "Quantity Changed"}
                      </span>
                      <span className="text-xl sm:text-2xl tabular-nums font-black">
                        {isPlus ? `+${Math.abs(qty)}` : `-${Math.abs(qty)}`}
                      </span>
                    </div>

                    {/* After */}
                    <div className="p-3.5 rounded-xl bg-card dark:bg-slate-900 border border-border/80 shadow-2xs">
                      <span className="text-xs text-muted-foreground block font-medium mb-1">
                        {language === "km" ? "ស្តុកក្រោយ" : "Stock After"}
                      </span>
                      <span className="font-black text-primary text-xl sm:text-2xl tabular-nums">
                        {afterQty}
                      </span>
                    </div>
                  </div>

                  {/* Total Financial Value Impact */}
                  {unitCost !== null && totalCostImpact !== null && (
                    <div className="flex items-center justify-between pt-1 px-1 text-xs">
                      <span className="text-muted-foreground font-medium">
                        {language === "km"
                          ? "តម្លៃសរុបនៃចលនាស្តុក"
                          : "Total Financial Impact"}
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                        ${totalCostImpact.toFixed(2)}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          (${unitCost.toFixed(2)} × {Math.abs(qty)})
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT COLUMN: TRANSACTION INFORMATION ── */}
              <div className="space-y-4">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  {language === "km"
                    ? "ព័ត៌មានប្រតិបត្តិការ"
                    : "TRANSACTION DETAILS"}
                </span>

                <div className="p-4 rounded-2xl bg-muted/20 dark:bg-slate-800/30 border border-border/70 space-y-3.5 text-xs sm:text-sm">
                  {/* Movement Code */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km" ? "កូដចលនាស្តុក" : "Movement Code"}
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {formattedRef}
                    </span>
                  </div>

                  {/* Operation Type */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km"
                        ? "ប្រភេទប្រតិបត្តិការ"
                        : "Operation Type"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatMovementTypeLabel(detail?.type)}
                    </span>
                  </div>

                  {/* Warehouse */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km" ? "ទីតាំងឃ្លាំង" : "Warehouse"}
                    </span>
                    <span className="font-semibold text-foreground text-right truncate max-w-[200px]">
                      {detail.warehouse?.name || "Main Warehouse"}
                    </span>
                  </div>

                  {/* Reference Doc */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km" ? "ឯកសារយោង" : "Reference Document"}
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {detail.reference_type
                        ? `${detail.reference_type} #${detail.reference_id || ""}`
                        : "—"}
                    </span>
                  </div>

                  {/* Operator */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km" ? "អ្នកកត់ត្រា" : "Recorded By"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {detail.user?.name ||
                        (language === "km"
                          ? "ប្រព័ន្ធស្វ័យប្រវត្តិ"
                          : "System Auto")}
                    </span>
                  </div>

                  {/* Logged Date */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">
                      {language === "km" ? "កាលបរិច្ឆេទកត់ត្រា" : "Logged Date"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatShortDate(detail.created_at)}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">
                      {language === "km"
                        ? "បច្ចុប្បន្នភាពចុងក្រោយ"
                        : "Last Updated"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatShortDate(detail.updated_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. REASON & REMARKS (IF EXISTS, FULL WIDTH) ── */}
            {Boolean(detail.notes || detail.reason) && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                  {language === "km"
                    ? "មូលហេតុ និងកំណត់សម្គាល់"
                    : "REASON & REMARKS"}
                </span>
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs sm:text-sm text-foreground italic leading-relaxed">
                  "{detail.notes || detail.reason}"
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </EnterpriseModal>
  );
};

export { StockMovementDetailPage as StockMovementDetailModal };
export default StockMovementDetailPage;
