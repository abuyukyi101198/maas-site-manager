import { Button, Icon, Input, Notification, Spinner } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";

import ErrorMessage from "@/components/ErrorMessage";
import { useAppLayoutContext, useUserSelectionContext } from "@/context";
import { useDeleteUserMutation, useUserQuery } from "@/hooks/react-query";

const initialValues = {
  confirmUsername: "",
};

type DeleteUserFormValues = typeof initialValues;
const createValidationSchema = (username: string) => {
  return Yup.object().shape({
    confirmUsername: Yup.string()
      .required("This field is required.")
      .test("exact-match", `Confirmation username is not correct. Expected ${username}`, (value) => value === username),
  });
};

const DeleteUser = () => {
  const id = useId();
  const { setSidebar } = useAppLayoutContext();
  const { selectedUserId, setSelectedUserId } = useUserSelectionContext();
  const {
    data: user,
    error,
    isError,
    isLoading,
    isSuccess: getUserSuccess,
  } = useUserQuery({ id: selectedUserId, enabled: true });

  const deleteUserMutation = useDeleteUserMutation();
  const headingId = `heading-${id}`;
  const confirmInputId = `confirm-${id}`;
  const queryClient = useQueryClient();
  const initialValues = {
    confirmUsername: "",
  };

  const handleSubmit = () => {
    if (getUserSuccess) {
      deleteUserMutation.mutate(user.id, {
        onSuccess() {
          queryClient.invalidateQueries(["users"]);
          setSidebar(null);
          setSelectedUserId(null);
        },
      });
    }
  };

  const username = getUserSuccess ? user.username : "";
  return (
    <>
      {isError && (
        <Notification severity="negative" title="Error while fetching user">
          <ErrorMessage error={error} />
        </Notification>
      )}
      {isLoading ? (
        <Spinner text="Loading..." />
      ) : (
        <Formik<DeleteUserFormValues>
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={createValidationSchema(username)}
        >
          {({ isSubmitting, errors, touched, dirty, isValid }) => (
            <Form aria-labelledby={headingId} noValidate>
              <div>
                <h3 className="p-heading--4" id={headingId}>
                  Delete <strong>{username}</strong>
                </h3>
                {deleteUserMutation.isError && (
                  <Notification severity="negative" title="Delete Failed">
                    {deleteUserMutation.error instanceof Error
                      ? deleteUserMutation.error.message
                      : "An unknown error occured."}
                  </Notification>
                )}
                <p>
                  Are you sure you want to delete user "{username}"? This action is permanent and can not be undone.
                </p>
                <p id={confirmInputId}>
                  Type <strong>{username}</strong> to confirm
                </p>
                <Field
                  aria-labelledby={confirmInputId}
                  as={Input}
                  error={touched.confirmUsername && errors.confirmUsername}
                  name="confirmUsername"
                  placeholder={username}
                  type="text"
                />
                <hr className="is-muted" />
                <div className="u-padding-top--medium u-flex u-flex--justify-end">
                  <Button appearance="base" onClick={() => setSidebar(null)} type="button">
                    Cancel
                  </Button>
                  <Button appearance="negative" disabled={!dirty || isSubmitting || !isValid} type="submit">
                    <Icon light name="delete" /> Delete
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </>
  );
};

export default DeleteUser;
