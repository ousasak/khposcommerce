import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Building2, Network, Store, Warehouse } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";

interface OrgStructureTabProps {
  companies?: any[];
  branches?: any[];
  stores?: any[];
  warehouses?: any[];
  isLoading?: boolean;
}

export const OrgStructureTab: React.FC<OrgStructureTabProps> = ({
  companies = [],
  branches = [],
  stores = [],
  warehouses = [],
  isLoading = false,
}) => {
  const { t } = useTranslation(["company", "common"]);
  const currentUser = useAuthStore((s) => s.user);

  // Normalize data safely
  const toArray = (val: any): any[] => {
    if (Array.isArray(val)) return val;
    if (Array.isArray(val?.data)) return val.data;
    return [];
  };

  const branchesList = useMemo(() => toArray(branches), [branches]);
  const storesList = useMemo(() => toArray(stores), [stores]);
  const warehousesList = useMemo(() => toArray(warehouses), [warehouses]);

  // Dynamically resolve companies, falling back to authStore user company if API returns empty
  const effectiveCompanies = useMemo(() => {
    const list = toArray(companies);
    if (list.length > 0) return list;

    if (currentUser?.company) {
      return [
        {
          id: currentUser.company.id || currentUser.company_id || 1,
          name: currentUser.company.name,
          email: currentUser.company.email,
          tax_number: currentUser.company.tax_number,
          city: currentUser.company.city,
          address: currentUser.company.address,
        },
      ];
    }

    if (branchesList.length > 0) {
      return [
        {
          id: branchesList[0].company_id || 1,
          name: currentUser?.company?.name || "Enterprise Parent",
          email: currentUser?.email,
        },
      ];
    }

    return [];
  }, [companies, currentUser, branchesList]);

  return (
    <div className="bg-card border border-border p-6 rounded-2xl space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Network className="text-primary" size={20} />
            <span>
              {t("company.structureTitle", "Enterprise Hierarchy & Topology")}
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "company.structureSubtitle",
              "Visual breakdown of parent companies, active branches, POS stores, and inventory storage warehouses.",
            )}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading && effectiveCompanies.length === 0 ? (
          <div className="border border-border/80 rounded-2xl p-5 bg-muted/20 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-muted rounded-full" />
            </div>
            <div className="pl-6 border-l-2 border-primary/30 space-y-3 pt-2">
              <div className="h-3 w-36 bg-muted rounded" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-card p-3 rounded-xl border border-border space-y-2"
                  >
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-muted rounded" />
                      <div className="h-3 w-12 bg-muted rounded" />
                    </div>
                    <div className="h-2.5 w-32 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : effectiveCompanies.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            {t("company.noEntities", "No organizational entities registered.")}
          </p>
        ) : (
          effectiveCompanies.map((comp: any) => {
            const compId = Number(comp.id);
            const isSingleCompany = effectiveCompanies.length === 1;

            const compBranches = branchesList.filter((b: any) => {
              if (!b) return false;
              if (Number(b.company_id) === compId) return true;
              if (isSingleCompany && !b.company_id) return true;
              return false;
            });

            const compBranchIds = new Set(
              compBranches.map((b: any) => Number(b.id)).filter(Boolean),
            );

            const compStores = storesList.filter((s: any) => {
              if (!s) return false;
              if (Number(s.company_id) === compId) return true;
              if (s.branch_id && compBranchIds.has(Number(s.branch_id)))
                return true;
              if (isSingleCompany && !s.company_id) return true;
              return false;
            });

            const compWarehouses = warehousesList.filter((w: any) => {
              if (!w) return false;
              if (Number(w.company_id) === compId) return true;
              if (w.branch_id && compBranchIds.has(Number(w.branch_id)))
                return true;
              if (isSingleCompany && !w.company_id) return true;
              return false;
            });

            return (
              <motion.div
                key={comp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-border/80 rounded-2xl p-5 bg-muted/20 space-y-4"
              >
                {/* Parent Company Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-foreground text-base">
                        {comp.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono">
                        {comp.email ||
                          comp.tax_number ||
                          t("company.parentHq", "HQ Enterprise Parent")}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
                    {t("company.parentEntity", "Parent Entity")}
                  </span>
                </div>

                {/* Branches & Subsidiaries Grid */}
                <div className="pl-6 border-l-2 border-primary/30 space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t("company.branchesLocations", "Branches & Locations")} (
                    {compBranches.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {compBranches.map((br: any) => (
                      <div
                        key={br.id}
                        className="bg-card p-3 rounded-xl border border-border space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs">
                            {br.name}
                          </span>
                          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {br.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {br.city ||
                            br.address ||
                            t("company.localBranch", "Local Branch")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {/* Stores */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Store size={13} className="text-emerald-500" />
                        <span>
                          {t("company.retailStores", "Retail Stores")} (
                          {compStores.length})
                        </span>
                      </h4>
                      <div className="space-y-1.5">
                        {compStores.map((st: any) => (
                          <div
                            key={st.id}
                            className="bg-card p-2.5 rounded-xl border border-border text-xs flex justify-between items-center"
                          >
                            <span className="font-semibold text-foreground">
                              {st.name}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              {st.type || "Hybrid"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Warehouses */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Warehouse size={13} className="text-amber-500" />
                        <span>
                          {t("company.warehouseDepots", "Warehouses")} (
                          {compWarehouses.length})
                        </span>
                      </h4>
                      <div className="space-y-1.5">
                        {compWarehouses.map((wh: any) => (
                          <div
                            key={wh.id}
                            className="bg-card p-2.5 rounded-xl border border-border text-xs flex justify-between items-center"
                          >
                            <span className="font-semibold text-foreground">
                              {wh.name}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {wh.code}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrgStructureTab;
