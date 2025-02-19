import { ContentSection } from "@canonical/maas-react-components";
import { ActionButton, Button, Input, Label } from "@canonical/react-components";
import { Field, Formik } from "formik";
import * as Yup from "yup";

import { fakeBootSources } from "@/components/ImageSourceList/ImageSourceList";
import FormikFormContent from "@/components/base/FormikFormContent";
import { useAppLayoutContext } from "@/context";
import { useBootSourceContext } from "@/context/BootSourceContext";

const baseInitialValues = {
  priority: 1,
};

type CustomImagesSourceFormValues = typeof baseInitialValues;

const CustomImagesSourceSchema = Yup.object().shape({
  priority: Yup.number().required("Priority is required"),
});

const EditCustomImagesSourceForm = () => {
  const [initialValues, setInitialValues] = useState<CustomImagesSourceFormValues>(baseInitialValues);
  const { selected: selectedBootSourceId, setSelected } = useBootSourceContext();
  const { setSidebar } = useAppLayoutContext();

  // TODO: replace with query once API is ready https://warthogs.atlassian.net/browse/MAASENG-4439
  const bootSource = fakeBootSources.items.find((source) => source.id === selectedBootSourceId);

  const headingId = useId();
  const priorityFieldId = useId();

  const resetForm = () => {
    setInitialValues(baseInitialValues);
    setSelected(null);
    setSidebar(null);
  };

  useEffect(() => {
    if (bootSource) {
      setInitialValues({
        priority: bootSource.priority,
      });
    }
  }, [bootSource]);

  return (
    <ContentSection>
      <ContentSection.Title id={headingId}>Edit Custom images</ContentSection.Title>
      <Formik initialValues={initialValues} onSubmit={() => {}} validationSchema={CustomImagesSourceSchema}>
        {({ errors, isSubmitting, touched, dirty, isValid }) => (
          <FormikFormContent>
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
    </ContentSection>
  );
};

export default EditCustomImagesSourceForm;
