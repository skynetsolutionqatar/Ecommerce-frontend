"use client";

import React from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { FormInput, FormNumberInput, FormSection, FormSelect } from "@/components/admin/form";
import { INVENTORY_MOVEMENT_TYPE } from "@/lib/Constant";
import {
  addStockValidationSchema,
  defaultAddStockValues,
  defaultReduceStockValues,
  reduceStockValidationSchema,
  toAddStockPayload,
  toReduceStockPayload,
} from "@/lib/admin/inventory-form";
import type { AddStockPayload, ReduceStockPayload } from "@/types/inventory.types";

const reduceTypeOptions = [
  { label: "Adjustment", value: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT },
  { label: "Stock out", value: INVENTORY_MOVEMENT_TYPE.STOCK_OUT },
  { label: "Damage / write-off", value: INVENTORY_MOVEMENT_TYPE.DAMAGE },
];

interface StockAdjustFormsProps {
  isPending?: boolean;
  onAdd: (payload: AddStockPayload) => void | Promise<void>;
  onReduce: (payload: ReduceStockPayload) => void | Promise<void>;
}

function StockAdjustForms({ isPending = false, onAdd, onReduce }: StockAdjustFormsProps) {
  const addForm = useFormik({
    initialValues: defaultAddStockValues,
    validationSchema: addStockValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await onAdd(toAddStockPayload(values));
        resetForm();
        toast.success("Stock added");
      } catch {
        toast.error("Failed to add stock");
      }
    },
  });

  const reduceForm = useFormik({
    initialValues: defaultReduceStockValues,
    validationSchema: reduceStockValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await onReduce(toReduceStockPayload(values));
        resetForm();
        toast.success("Stock reduced");
      } catch {
        toast.error("Failed to reduce stock");
      }
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <FormSection id="add-stock" title="Add Stock">
        <form onSubmit={addForm.handleSubmit} className="space-y-4">
          <FormNumberInput
            label="Quantity"
            name="quantity"
            value={addForm.values.quantity}
            required
            min={1}
            step={1}
            blockNegative
            error={addForm.errors.quantity}
            touched={addForm.touched.quantity}
            onChange={addForm.handleChange}
            onBlur={addForm.handleBlur}
          />
          <FormInput
            label="Note"
            name="note"
            value={addForm.values.note}
            placeholder="Restock reason"
            error={addForm.errors.note}
            touched={addForm.touched.note}
            onChange={addForm.handleChange}
            onBlur={addForm.handleBlur}
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-emerald-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Adding..." : "Add Stock"}
          </button>
        </form>
      </FormSection>

      <FormSection id="reduce-stock" title="Reduce Stock">
        <form onSubmit={reduceForm.handleSubmit} className="space-y-4">
          <FormNumberInput
            label="Quantity"
            name="quantity"
            value={reduceForm.values.quantity}
            required
            min={1}
            step={1}
            blockNegative
            error={reduceForm.errors.quantity}
            touched={reduceForm.touched.quantity}
            onChange={reduceForm.handleChange}
            onBlur={reduceForm.handleBlur}
          />
          <FormSelect
            label="Type"
            name="type"
            value={reduceForm.values.type}
            options={reduceTypeOptions}
            onChange={reduceForm.handleChange}
            onBlur={reduceForm.handleBlur}
          />
          <FormInput
            label="Note"
            name="note"
            value={reduceForm.values.note}
            placeholder="Reason for reduction"
            error={reduceForm.errors.note}
            touched={reduceForm.touched.note}
            onChange={reduceForm.handleChange}
            onBlur={reduceForm.handleBlur}
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50"
          >
            {isPending ? "Reducing..." : "Reduce Stock"}
          </button>
        </form>
      </FormSection>
    </div>
  );
}

export default React.memo(StockAdjustForms);
