import type { ReactNode } from "react";

import type { FormikFormProps } from "formik";
import { Form } from "formik";

import { useFormikErrors } from "./utils";

import type { MutationErrorResponse } from "@/api";

type Props = {
  children: ReactNode;
  errors?: (MutationErrorResponse | null)[];
} & FormikFormProps;

const FormikFormContent = <V extends object>({ children, errors, ...formProps }: Props) => {
  useFormikErrors<V>(errors);

  return <Form {...formProps}>{children}</Form>;
};

export default FormikFormContent;
