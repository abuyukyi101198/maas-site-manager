import { useEffect } from "react";

import { Button, Icon, Input, useId } from "@canonical/react-components";
import { Field, Form, Formik } from "formik";
import pluralize from "pluralize";
import * as Yup from "yup";

import { useAppContext } from "@/context";

const initialValues = {
  confirmText: "",
};

type RemoveRegionsFormValues = typeof initialValues;

const RemoveRegionsFormSchema = Yup.object().shape({
  confirmText: Yup.string()
    .required()
    .when("$expectedConfirmTextValue", (type, schema) => {
      return schema.equals(type);
    }),
});

const createHandleValidate =
  ({ expectedConfirmTextValue }: { expectedConfirmTextValue: string }) =>
  async (values: RemoveRegionsFormValues) => {
    let errors = {};
    await RemoveRegionsFormSchema.validate(values, { context: { expectedConfirmTextValue } }).catch((error) => {
      errors = { confirmText: `Confirmation string is not correct. Expected ${expectedConfirmTextValue}` };
    });
    return errors;
  };

const RemoveRegions = () => {
  const { rowSelection } = useAppContext();
  const { setSidebar } = useAppContext();
  const handleDeleteSites = () => {
    // TODO: integrate with delete sites endpoint
    setSidebar(null);
  };
  const regionsCount = rowSelection && Object.keys(rowSelection).length;
  const id = useId();
  const confirmTextId = `confirm-text-${id}`;
  const headingId = `heading-${id}`;
  const regionsCountText = pluralize("regions", regionsCount || 0, !!regionsCount);
  const expectedConfirmTextValue = `remove ${regionsCountText}`;
  const handleSubmit = () => {
    // TODO: integrate with delete regions endpoint
  };

  // close the sidebar when there are no regions selected
  useEffect(() => {
    if (!regionsCount) {
      setSidebar(null);
    }
  }, [regionsCount, setSidebar]);

  return (
    <Formik<RemoveRegionsFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={createHandleValidate({ expectedConfirmTextValue })}
    >
      {({ isSubmitting, errors, touched, isValid, dirty }) => (
        <Form aria-labelledby={headingId} className="tokens-create" noValidate>
          <div className="tokens-create">
            <h3 className="tokens-create__heading p-heading--4" id={headingId}>
              Remove <strong> {regionsCountText}</strong> from Site Manager
            </h3>
            <p>
              The deletion of data is irreversible. You can re-enrol the MAAS region again through the enrolment
              process.
            </p>
            <p id={confirmTextId}>
              Type <strong>remove {regionsCountText}</strong> to confirm.
            </p>
            <Field
              aria-labelledby={confirmTextId}
              as={Input}
              error={touched.confirmText && errors.confirmText}
              name="confirmText"
              placeholder={`remove ${regionsCountText}`}
              type="text"
            />
            <Button appearance="base" onClick={() => setSidebar(null)} type="button">
              Cancel
            </Button>
            <Button
              appearance="negative"
              disabled={!dirty || !isValid || isSubmitting}
              onClick={handleDeleteSites}
              type="button"
            >
              <Icon light name="delete" /> Remove
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default RemoveRegions;
