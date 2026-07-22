import * as Yup from "yup";

export const positiveNumber = Yup.number()
  .typeError("Must be a number")
  .min(0, "Cannot be negative")
  .required("This field is required");

export const positiveNumberOptional = Yup.number()
  .typeError("Must be a number")
  .min(0, "Cannot be negative");

export const percentageField = Yup.number()
  .typeError("Must be a number")
  .min(0, "Cannot be negative")
  .max(100, "Cannot exceed 100")
  .required("This field is required");

export const percentageFieldOptional = Yup.number()
  .typeError("Must be a number")
  .min(0, "Cannot be negative")
  .max(100, "Cannot exceed 100");

export const requiredString = Yup.string().required("This field is required");

export const optionalString = Yup.string().nullable();
