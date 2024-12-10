import { isMutationErrorResponse } from "../base/FormikFormContent/utils";

const ErrorMessage = ({
  error,
  defaultMessage = "An unknown error has occured",
}: {
  error: unknown;
  defaultMessage?: string;
}) => (
  <>
    {isMutationErrorResponse(error)
      ? error.body.error.message
      : error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : defaultMessage}
  </>
);

export default ErrorMessage;
