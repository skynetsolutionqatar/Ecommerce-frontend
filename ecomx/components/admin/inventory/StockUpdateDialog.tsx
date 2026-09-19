"use client";

import React from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormInput, FormNumberInput } from "@/components/admin/form";
import { colors } from "@/components/admin/utils/Colors";
import {
  setStockValidationSchema,
  toSetStockPayload,
} from "@/lib/admin/inventory-form";
import type { ApiResponse } from "@/types/api.types";
import type { SetStockPayload, StockProduct } from "@/types/inventory.types";

type SetStockResult = ApiResponse<{
  product: { stock: number };
  log: unknown;
  unchanged?: boolean;
}>;

interface StockUpdateDialogProps {
  product: StockProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onSubmit: (productId: string, payload: SetStockPayload) => Promise<SetStockResult>;
}

function StockUpdateDialog({
  product,
  open,
  onOpenChange,
  isPending = false,
  onSubmit,
}: StockUpdateDialogProps) {
  const form = useFormik({
    enableReinitialize: true,
    initialValues: {
      stock: product?.stock ?? ("" as number | ""),
      note: "",
    },
    validationSchema: setStockValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!product) return;

      try {
        const result = await onSubmit(product._id, toSetStockPayload(values));

        if (result.data?.unchanged && !result.data?.log) {
          toast.error(result.message || "Stock is already at this quantity");
          return;
        }

        toast.success(result.message || "Stock updated");
        resetForm();
        onOpenChange(false);
      } catch {
        toast.error("Failed to update stock");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Stock</DialogTitle>
        </DialogHeader>

        {product ? (
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Set the current stock for <span className="font-medium text-foreground">{product.name}</span>.
              Current stock: <span className="font-semibold text-foreground">{product.stock}</span>
            </p>

            <FormNumberInput
              label="New stock quantity"
              name="stock"
              value={form.values.stock}
              required
              min={0}
              step={1}
              blockNegative
              error={form.errors.stock}
              touched={form.touched.stock}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />

            <FormInput
              label="Note"
              name="note"
              value={form.values.note}
              placeholder="Reason for update (optional)"
              error={form.errors.note}
              touched={form.touched.note}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className={`${colors.mainColor} text-white`}
              >
                {isPending ? "Updating..." : "Update Stock"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default React.memo(StockUpdateDialog);
