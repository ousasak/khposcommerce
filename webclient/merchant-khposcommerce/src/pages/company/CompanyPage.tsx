import React, { useMemo, useRef } from "react";
import { Store, Warehouse, MapPin, Network, Building2 } from "lucide-react";
import {
  Breadcrumb,
  WorkspaceTabs,
  HeaderActionsGroup,
  ExportButton,
  AddButton,
} from "@/components/common";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/authStore";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { companyService } from "@/services/companyService";

import BranchesPage, { type CompanyTabHandle } from "./BranchesPage";
import StoresPage from "./StoresPage";
import WarehousesPage from "./WarehousesPage";
import OrgStructureTab from "./components/OrgStructureTab";
import type { TabType } from "./types/company.types";

interface CompanyPageProps {
  activeTab?: TabType;
}

const CompanyPage: React.FC<CompanyPageProps> = ({ activeTab: initialTab }) => {
  const { t } = useTranslation([
    "company",
    "settings",
    "common",
    "nav",
    "buttons",
  ]);
  const { hasPermission } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabRef = useRef<CompanyTabHandle>(null);

  const canViewBranch = hasPermission("branch.view");
  const canViewStore = hasPermission("store.view");
  const canViewWarehouse = hasPermission("warehouse.view");
  const canViewCompany = hasPermission("company.view");

  const availableTabs = useMemo(
    () => [
      ...(canViewBranch
        ? [
            {
              id: "branches",
              label: t("company.tabBranches", "Branches"),
              icon: MapPin,
            },
          ]
        : []),
      ...(canViewStore
        ? [
            {
              id: "stores",
              label: t("company.tabStores", "Stores & Outlets"),
              icon: Store,
            },
          ]
        : []),
      ...(canViewWarehouse
        ? [
            {
              id: "warehouses",
              label: t("company.tabWarehouses", "Warehouses"),
              icon: Warehouse,
            },
          ]
        : []),
      ...(canViewCompany || canViewBranch
        ? [
            {
              id: "structures",
              label: t("company.tabStructure", "Org Hierarchy"),
              icon: Network,
            },
          ]
        : []),
    ],
    [canViewBranch, canViewStore, canViewWarehouse, canViewCompany, t],
  );

  const defaultValidTab = useMemo<TabType>(() => {
    if (
      initialTab &&
      ["branches", "stores", "warehouses", "structures"].includes(initialTab)
    )
      return initialTab;
    if (canViewBranch) return "branches";
    if (canViewStore) return "stores";
    if (canViewWarehouse) return "warehouses";
    return "branches";
  }, [initialTab, canViewBranch, canViewStore, canViewWarehouse]);

  const urlTab = searchParams.get("tab") as TabType;
  const currentTab: TabType =
    urlTab &&
    ["branches", "stores", "warehouses", "structures"].includes(urlTab)
      ? urlTab
      : defaultValidTab;

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab });
  };

  // Active Tab Label for Breadcrumb
  const currentTabLabel = useMemo(() => {
    switch (currentTab) {
      case "stores":
        return t("company.tabStores", "Stores & Outlets");
      case "warehouses":
        return t("company.tabWarehouses", "Warehouses");
      case "structures":
        return t("company.tabStructure", "Org Hierarchy");
      case "branches":
      default:
        return t("company.tabBranches", "Branches");
    }
  }, [currentTab, t]);

  // Dynamic Add Button label based on active tab (matching ShippingPage pattern)
  const addLabel = useMemo(() => {
    switch (currentTab) {
      case "stores":
        return t("company.addStore", "Add Store");
      case "warehouses":
        return t("company.addWarehouse", "Add Warehouse");
      case "branches":
      default:
        return t("company.addBranch", "Add Branch");
    }
  }, [currentTab, t]);

  const handleExport = () => {
    activeTabRef.current?.exportCSV();
  };

  const handleCreate = () => {
    activeTabRef.current?.openCreate();
  };

  // Org Structure Data (Only fetched if structure tab is active)
  const isStructureActive = currentTab === "structures";
  const { data: companiesData, isLoading: isCompaniesLoading } = useQuery({
    queryKey: ["companies", "structure"],
    queryFn: () => companyService.getCompanies({ per_page: 100 }),
    enabled: isStructureActive,
  });
  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches", "structure"],
    queryFn: () => companyService.getBranches({ per_page: 100 }),
    enabled: isStructureActive,
  });
  const { data: storesData, isLoading: isStoresLoading } = useQuery({
    queryKey: ["stores", "structure"],
    queryFn: () => companyService.getStores({ per_page: 100 }),
    enabled: isStructureActive,
  });
  const { data: warehousesData, isLoading: isWarehousesLoading } = useQuery({
    queryKey: ["warehouses", "structure"],
    queryFn: () => companyService.getWarehouses({ per_page: 100 }),
    enabled: isStructureActive,
  });

  return (
    <div className="space-y-5 print:p-0">
      <Breadcrumb
        items={[
          {
            label: t("company.pageTitle", "Company Management"),
            path: "/company",
          },
          { label: currentTabLabel },
        ]}
      />

      {/* Frameless Hero Header - Matching Shipping & Logistics layout */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 py-1 print:hidden">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground break-words">
            {t("company.pageTitle", "Company Management")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {t(
              "company.pageSubtitle",
              "Manage enterprise hierarchy, branch coordinates, retail POS outlets, and central inventory warehouses from a unified dashboard.",
            )}
          </p>
        </div>

        {/* Action Buttons in Hero Header (Identical to ShippingPage) */}
        <HeaderActionsGroup>
          {currentTab !== "structures" && (
            <>
              <ExportButton
                onClick={handleExport}
                label={t("common.exportCsv", "Export CSV")}
              />
              <AddButton onClick={handleCreate} label={addLabel} />
            </>
          )}
        </HeaderActionsGroup>
      </div>

      {/* Sub-tabs Navigation (Global WorkspaceTabs) */}
      <WorkspaceTabs
        tabs={availableTabs}
        activeTab={currentTab}
        onChange={(tabId) => setActiveTab(tabId as TabType)}
        showIcons={true}
      />

      {/* Tab Content Routing */}
      {currentTab === "stores" ? (
        <StoresPage isTab ref={activeTabRef} />
      ) : currentTab === "warehouses" ? (
        <WarehousesPage isTab ref={activeTabRef} />
      ) : currentTab === "structures" ? (
        <OrgStructureTab
          companies={companiesData?.data ?? companiesData ?? []}
          branches={branchesData?.data ?? branchesData ?? []}
          stores={storesData?.data ?? storesData ?? []}
          warehouses={warehousesData?.data ?? warehousesData ?? []}
          isLoading={
            isCompaniesLoading ||
            isBranchesLoading ||
            isStoresLoading ||
            isWarehousesLoading
          }
        />
      ) : (
        <BranchesPage isTab ref={activeTabRef} />
      )}
    </div>
  );
};

export default CompanyPage;
