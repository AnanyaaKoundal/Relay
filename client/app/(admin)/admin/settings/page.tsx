"use client";

import { useState, useEffect } from "react";
import { getSettings, updateSettings, type PlatformSettings } from "@/services/admin.service";
import { FilterSelect } from "@/components/shared/filter-select";
import { Loader2, Save, Plus, Trash2, Search } from "lucide-react";

const COUNTRY_NAMES: Record<string, string> = {
  IN: "India",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  AU: "Australia",
  SG: "Singapore",
  DE: "Germany",
  FR: "France",
  AE: "United Arab Emirates",
  JP: "Japan",
  CN: "China",
  BR: "Brazil",
  MX: "Mexico",
  ZA: "South Africa",
  NG: "Nigeria",
  KE: "Kenya",
  EG: "Egypt",
  SA: "Saudi Arabia",
  IT: "Italy",
  ES: "Spain",
  NL: "Netherlands",
  SE: "Sweden",
  NO: "Norway",
  FI: "Finland",
  PL: "Poland",
  PT: "Portugal",
  IE: "Ireland",
  NZ: "New Zealand",
  PH: "Philippines",
  TH: "Thailand",
  VN: "Vietnam",
  ID: "Indonesia",
  MY: "Malaysia",
  BD: "Bangladesh",
  PK: "Pakistan",
  LK: "Sri Lanka",
  NP: "Nepal",
};

type Tab = "general" | "commission" | "tax";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [success, setSuccess] = useState(false);

  // General settings
  const [currency, setCurrency] = useState("INR");

  // Commission settings
  const [commissionRate, setCommissionRate] = useState(10);

  // Tax rates
  const [taxRates, setTaxRates] = useState<Record<string, number>>({});
  const [taxSearch, setTaxSearch] = useState("");
  const [newCountry, setNewCountry] = useState("");
  const [newRate, setNewRate] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  async function loadSettings() {
    try {
      const data = await getSettings();
      setSettings(data);
      setCurrency(data.currency || "INR");
      setCommissionRate(data.commissionRate || 10);
      setTaxRates(data.taxRates || {});
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await updateSettings({
        commissionRate,
        currency,
        taxRates,
      });
      setSettings(updated);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  }

  function handleAddCountry() {
    if (!newCountry || !newRate) return;
    const code = newCountry.toUpperCase();
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    setTaxRates({ ...taxRates, [code]: rate });
    setNewCountry("");
    setNewRate("");
  }

  function handleRemoveCountry(code: string) {
    const updated = { ...taxRates };
    delete updated[code];
    setTaxRates(updated);
  }

  function handleUpdateRate(code: string, rate: number) {
    if (rate < 0 || rate > 100) return;
    setTaxRates({ ...taxRates, [code]: rate });
  }

  // Filter tax rates based on search
  const filteredTaxRates = Object.entries(taxRates).filter(([code, rate]) => {
    const searchLower = taxSearch.toLowerCase();
    const countryName = COUNTRY_NAMES[code] || code;
    return (
      code.toLowerCase().includes(searchLower) ||
      countryName.toLowerCase().includes(searchLower) ||
      String(rate).includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Platform Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save Changes
        </button>
      </div>

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Settings saved successfully
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border p-1">
        {(["general", "commission", "tax"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {tab === "general" ? "General" : tab === "commission" ? "Commission" : "Tax Rates"}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">Platform Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commission Tab */}
      {activeTab === "commission" && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">Commission Settings</h3>
            <div className="max-w-md">
              <label className="text-xs font-medium text-muted-foreground">
                Platform Commission Rate (%)
              </label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.5}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Platform takes {commissionRate}% of each course sale. Instructor receives {100 - commissionRate}%.
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4">Commission Preview</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Platform Fee</p>
                <p className="text-2xl font-bold">{commissionRate}%</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Instructor Share</p>
                <p className="text-2xl font-bold">{100 - commissionRate}%</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-xs text-muted-foreground">Example (₹1000 sale)</p>
                <p className="text-2xl font-bold">₹{Math.round(1000 * (100 - commissionRate) / 100)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Rates Tab */}
      {activeTab === "tax" && (
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Tax Rates by Country</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search countries..."
                    value={taxSearch}
                    onChange={(e) => setTaxSearch(e.target.value)}
                    className="w-64 rounded-lg border pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Add new country */}
            <div className="mb-4 flex items-center gap-2">
              <select
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-48 rounded-lg border px-3 py-2 text-sm"
              >
                <option value="">Add country...</option>
                {Object.entries(COUNTRY_NAMES)
                  .filter(([code]) => !taxRates[code])
                  .sort(([, a], [, b]) => a.localeCompare(b))
                  .map(([code, name]) => (
                    <option key={code} value={code}>
                      {name} ({code})
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Rate %"
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                min={0}
                max={100}
                className="w-24 rounded-lg border px-3 py-2 text-sm"
              />
              <button
                onClick={handleAddCountry}
                disabled={!newCountry || !newRate}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                <Plus className="size-4" /> Add
              </button>
            </div>

            {/* Tax rates table */}
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Country
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Tax Rate (%)
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaxRates.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {taxSearch ? "No countries match your search" : "No tax rates configured"}
                      </td>
                    </tr>
                  ) : (
                    filteredTaxRates.map(([code, rate]) => (
                      <tr key={code} className="border-b last:border-0">
                        <td className="px-4 py-3 text-sm font-medium">
                          {COUNTRY_NAMES[code] || code}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{code}</td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={rate}
                            onChange={(e) => handleUpdateRate(code, parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            step={0.5}
                            className="w-24 rounded-lg border px-3 py-1.5 text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveCountry(code)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Tax rates are applied based on the billing country provided during checkout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}