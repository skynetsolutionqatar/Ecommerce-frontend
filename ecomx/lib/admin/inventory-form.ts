import * as Yup from "yup";
import { INVENTORY_MOVEMENT_TYPE } from "@/lib/Constant";
import type {
  AddStockPayload,
  ReduceStockPayload,
  SetStockPayload,
} from "@/types/inventory.types";

export type AddStockFormValues = {
  quantity: number | "";
  note: string;
};

export type ReduceStockFormValues = {
  quantity: number | "";
  type: string;
  note: string;
};

export type SetStockFormValues = {
  stock: number | "";
  note: string;
};

export const defaultAddStockValues: AddStockFormValues = {
  quantity: "",
  note: "",
};

export const defaultReduceStockValues: ReduceStockFormValues = {
  quantity: "",
  type: INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
  note: "",
};

export const defaultSetStockValues: SetStockFormValues = {
  stock: "",
  note: "",
};

export const addStockValidationSchema = Yup.object({
  quantity: Yup.number()
    .required("Quantity is required")
    .moreThan(0, "Quantity must be greater than 0"),
  note: Yup.string().max(300, "Note cannot exceed 300 characters"),
});

export const reduceStockValidationSchema = Yup.object({
  quantity: Yup.number()
    .required("Quantity is required")
    .moreThan(0, "Quantity must be greater than 0"),
  type: Yup.string().oneOf([
    INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
    INVENTORY_MOVEMENT_TYPE.STOCK_OUT,
    INVENTORY_MOVEMENT_TYPE.DAMAGE,
  ]),
  note: Yup.string().max(300, "Note cannot exceed 300 characters"),
});

export function toAddStockPayload(values: AddStockFormValues): AddStockPayload {
  return {
    quantity: Number(values.quantity),
    note: values.note.trim() || undefined,
  };
}

export function toReduceStockPayload(values: ReduceStockFormValues): ReduceStockPayload {
  return {
    quantity: Number(values.quantity),
    type: values.type as ReduceStockPayload["type"],
    note: values.note.trim() || undefined,
  };
}

export const setStockValidationSchema = Yup.object({
  stock: Yup.number()
    .required("Stock quantity is required")
    .min(0, "Stock cannot be negative")
    .integer("Stock must be a whole number"),
  note: Yup.string().max(300, "Note cannot exceed 300 characters"),
});

export function toSetStockPayload(values: SetStockFormValues): SetStockPayload {
  return {
    stock: Number(values.stock),
    note: values.note.trim() || undefined,
  };
}
