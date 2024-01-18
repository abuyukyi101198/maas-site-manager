import { ContentSection } from "@canonical/maas-react-components";
import { Button, Input, Label } from "@canonical/react-components";
import type { FormikHelpers } from "formik";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
};

type PasswordUpdateFormValues = typeof initialValues;
const PasswordUpdateSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string().required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "New passwords must match")
    .required("New password (again) is required"),
});

const PasswordUpdate = () => {
  const headingId = useId();
  const currentPasswordId = useId();
  const newPasswordId = useId();
  const newPasswordConfirmId = useId();

  const handleSubmit = async (
    { currentPassword: _current_password, newPassword: _password }: PasswordUpdateFormValues,
    { setSubmitting: _ }: FormikHelpers<PasswordUpdateFormValues>,
  ) => {};

  return (
    <ContentSection variant="narrow">
      <ContentSection.Title>Password</ContentSection.Title>
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validateOnBlur={false}
        validationSchema={PasswordUpdateSchema}
      >
        {({ isSubmitting, errors, touched, isValid, dirty }) => (
          <Form aria-label="update password" aria-labelledby={headingId} noValidate>
            <Label htmlFor={currentPasswordId} required>
              Current password
            </Label>
            <Field
              as={Input}
              error={touched.currentPassword && errors.currentPassword}
              help="If you can't remember your current password, ask an admin to change your password."
              helpClassName="input-help"
              id={currentPasswordId}
              name="currentPassword"
              required
              type="password"
            />
            <Label htmlFor={newPasswordId} required>
              New password
            </Label>
            <Field
              as={Input}
              error={touched.newPassword && errors.newPassword}
              id={newPasswordId}
              name="newPassword"
              required
              type="password"
            />
            <Label htmlFor={newPasswordConfirmId} required>
              New password (again)
            </Label>
            <Field
              as={Input}
              error={touched.confirmNewPassword && errors.confirmNewPassword}
              help="Enter the same password as before, for verification"
              helpClassName="input-help"
              id={newPasswordConfirmId}
              name="confirmNewPassword"
              required
              type="password"
            />
            <ContentSection.Footer>
              <Button appearance="positive" disabled={!dirty || !isValid || isSubmitting} type="submit">
                Save
              </Button>
            </ContentSection.Footer>
          </Form>
        )}
      </Formik>
    </ContentSection>
  );
};

export default PasswordUpdate;
