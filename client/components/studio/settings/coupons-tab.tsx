"use client";

import { useEffect, useState } from "react";
import * as couponApi from "@/services/coupon.service";
import type { Coupon, CreateCouponInput } from "@/types/coupon.types";
import { Spinner } from "@/components/shared/spinner";
import { FilterSelect } from "@/components/shared/filter-select";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

interface Props {
  courseId: string;
}

export function CouponsTab({ courseId }: Props) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("0");
  const [isPublic, setIsPublic] = useState(false);
  const [label, setLabel] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    loadCoupons();
  }, [courseId]);

  async function loadCoupons() {
    setLoading(true);
    try {
      const data = await couponApi.listCoupons(courseId);
      setCoupons(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

  function generateCode() {
    const part = () =>
      Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
    setCode(`${part()}-${part()}`);
  }

  function resetForm() {
    setCode("");
    setType("PERCENTAGE");
    setValue("");
    setMaxUses("0");
    setIsPublic(false);
    setLabel("");
    setStartsAt("");
    setExpiresAt("");
    setEditing(null);
    setShowForm(false);
    setError("");
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setCode(coupon.code);
    setType(coupon.discountType);
    setValue(String(coupon.discountValue));
    setMaxUses(String(coupon.maxUses));
    setIsPublic(coupon.isPublic);
    setLabel(coupon.label ?? "");
    setStartsAt(coupon.startsAt ? coupon.startsAt.slice(0, 10) : "");
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!code.trim() || !value || Number(value) <= 0) return;

    if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
      setError("Start date must be before expiry date");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const data: CreateCouponInput = {
        code: code.trim().toUpperCase(),
        discountType: type,
        discountValue: Number(value),
        maxUses: Number(maxUses) || 0,
        isPublic,
        label: label.trim() || undefined,
        startsAt: startsAt || undefined,
        expiresAt: expiresAt || undefined,
      };

      if (editing) {
        await couponApi.updateCoupon(courseId, editing.id, data);
      } else {
        await couponApi.createCoupon(courseId, data);
      }

      resetForm();
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
    try {
      await couponApi.deleteCoupon(courseId, coupon.id);
      await loadCoupons();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete coupon");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">Coupons</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Add Coupon
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Coupon form */}
      {showForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Code</label>
                <button
                  type="button"
                  onClick={generateCode}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Generate
                </button>
              </div>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                placeholder="SUMMER50"
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <FilterSelect
                value={type}
                placeholder="Select type"
                onChange={(v) => setType(v as "PERCENTAGE" | "FIXED")}
                options={[
                  { label: "Percentage (%)", value: "PERCENTAGE" },
                  { label: "Fixed (₹)", value: "FIXED" },
                ]}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Value</label>
              <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "PERCENTAGE" ? "e.g. 20" : "e.g. 500"}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Max Uses (0 = unlimited)</label>
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Label (shown on course page)</label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Diwali offer"
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Starts At (blank = immediately)</label>
              <input
                type="date"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Expires At</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="mt-1 block w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300"
            />
            Public — automatically applied at checkout, shows on course page
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !code.trim() || !value}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/80 transition-colors disabled:opacity-50"
            >
              <Check className="size-3.5" />
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium hover:bg-muted transition-colors"
            >
              <X className="size-3.5" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Coupon list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
          <Spinner />
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No coupons yet. Create one to offer discounts.
        </p>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-semibold">{coupon.code}</span>
                  {coupon.isPublic && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">Public</span>
                  )}
                  {!coupon.isActive && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Inactive</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}% off` : `₹${coupon.discountValue} off`}
                  {coupon.label && ` — ${coupon.label}`}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Used {coupon.usedCount}/{coupon.maxUses === 0 ? "∞" : coupon.maxUses}
                  {coupon.startsAt && ` · Starts ${new Date(coupon.startsAt).toLocaleDateString()}`}
                  {coupon.expiresAt && ` · Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEdit(coupon)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(coupon)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
