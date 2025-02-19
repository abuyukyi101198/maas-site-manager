import { ContentSection } from "@canonical/maas-react-components";
import { ActionButton, Button, Input, Label, Textarea } from "@canonical/react-components";
import { Field, Formik } from "formik";
import * as Yup from "yup";

import { fakeBootSources } from "../ImageSourceList/ImageSourceList";
import FormikFormContent from "../base/FormikFormContent";

import { useAppLayoutContext } from "@/context";
import { useBootSourceContext } from "@/context/BootSourceContext";

const baseInitialValues = {
  url: "",
  keyring: "",
  autosync: true,
  priority: 1,
};

type ImageSourceFormValues = typeof baseInitialValues;

const ImageSourceSchema = Yup.object().shape({
  url: Yup.string().url("Not a valid URL").required("URL is required"),
  keyring: Yup.string(),
  autosync: Yup.boolean(),
  priority: Yup.number().integer("Priority must be a whole number").required("Priority is required"),
});

const ImageSourceForm = ({ type }: { type: "add" | "edit" }) => {
  const { selected: selectedBootSourceId, setSelected } = useBootSourceContext();
  const { setSidebar } = useAppLayoutContext();

  // TODO: replace with useState once API is ready https://warthogs.atlassian.net/browse/MAASENG-4439
  let initialValues: ImageSourceFormValues = { ...baseInitialValues };

  const headingId = useId();
  const urlFieldId = useId();
  const keyringFieldId = useId();
  const priorityFieldId = useId();
  const autosyncFieldId = useId();

  // TODO: replace with query once API is ready https://warthogs.atlassian.net/browse/MAASENG-4439
  const bootSource = fakeBootSources.items.find((source) => source.id === selectedBootSourceId);

  const resetForm = () => {
    initialValues = { ...baseInitialValues };
    setSelected(null);
    setSidebar(null);
  };

  // TODO: wrap in useEffect once API is ready https://warthogs.atlassian.net/browse/MAASENG-4439
  if (type === "edit" && bootSource) {
    initialValues = {
      url: bootSource.url,
      keyring: bootSource.keyring,
      autosync: bootSource.sync_interval > 0,
      priority: bootSource.priority,
    };
  }

  const handleSubmit = () => {};

  return (
    <ContentSection>
      <ContentSection.Title id={headingId}>
        {type === "add" ? "Add image source" : `Edit ${bootSource ? bootSource.url : "image source"}`}
      </ContentSection.Title>
      <ContentSection.Content>
        <Formik initialValues={initialValues} onSubmit={handleSubmit} validationSchema={ImageSourceSchema}>
          {({ errors, isSubmitting, touched, dirty, isValid }) => (
            <FormikFormContent>
              <Label className="is-required" htmlFor={urlFieldId}>
                URL
              </Label>
              <Field
                as={Input}
                caution={
                  type === "edit"
                    ? "Changing to an image server with different images might remove some images from MAAS Site Manager and MAAS."
                    : null
                }
                error={touched.url && errors.url}
                id={urlFieldId}
                name="url"
                required
                type="text"
              />
              <Label htmlFor={keyringFieldId}>GPG key</Label>
              <Field
                as={Textarea}
                className="u-textarea-no-resize--horizontal"
                help="An optional GPG public key to verify the authenticity of the image source."
                id={keyringFieldId}
                name="keyring"
              />
              <Label className="is-required" htmlFor={priorityFieldId}>
                Priority
              </Label>
              <Field
                as={Input}
                error={touched.priority && errors.priority}
                help="If the same image is available from several sources, the image from the source with the higher priority takes precedence. 1 is the highest priority."
                id={priorityFieldId}
                name="priority"
                required
                type="text"
              />
              <Label className="u-no-margin" htmlFor={autosyncFieldId}>
                Syncing
              </Label>
              <p className="u-text--muted u-no-margin">
                Site Manager will check if selected images have been updated at the image source and sync them, if
                available.
              </p>
              <Field as={Input} label="Automatically sync images" name="autosync" type="checkbox" />

              <hr />
              <div className="u-flex u-flex--justify-end u-padding-top--medium">
                <Button appearance="base" onClick={resetForm} type="button">
                  Cancel
                </Button>
                <ActionButton
                  appearance="positive"
                  disabled={!dirty || !isValid || isSubmitting}
                  loading={isSubmitting}
                  type="submit"
                >
                  Save
                </ActionButton>
              </div>
            </FormikFormContent>
          )}
        </Formik>
      </ContentSection.Content>
    </ContentSection>
  );
};

export default ImageSourceForm;
