import { ContentSection } from "@canonical/maas-react-components";
import type { MultiSelectItem } from "@canonical/react-components";
import { ActionButton, Button, Spinner, Notification, Accordion, MultiSelect } from "@canonical/react-components";
import type { FormikHelpers } from "formik";
import { Field, Form, Formik } from "formik";

import ErrorMessage from "../../../base/components/ErrorMessage";

import type { UpstreamImage } from "@/app/api";
import { useSelectUpstreamImagesMutation, useUpstreamImagesQuery } from "@/app/base/hooks/react-query";
import { useAppLayoutContext } from "@/app/context";

type GroupedImages = {
  [key: string]: ReleasesWithArches;
};

export type ReleasesWithArches = {
  [key: string]: MultiSelectItem[];
};

type ImagesByName = { [key: string]: UpstreamImage[] };

const groupImagesByName = (images: UpstreamImage[]) => {
  if (!images) return {};
  const imagesByName: ImagesByName = {};

  images.forEach((image) => {
    if (!!imagesByName[image.os]) {
      imagesByName[image.os].push(image);
    } else {
      imagesByName[image.os] = [image];
    }
  });

  return imagesByName;
};

const groupArchesByRelease = (images: ImagesByName) => {
  const groupedImages: GroupedImages = {};

  Object.keys(images).forEach((os) => {
    if (!groupedImages[os]) {
      groupedImages[os] = {};
    }
    images[os].forEach((image) => {
      if (!groupedImages[os][image.release!]) {
        groupedImages[os][image.release!] = [{ label: image.arch, value: image.id, group: image.source_name }];
      } else {
        groupedImages[os][image.release!].push({
          label: image.arch,
          value: image.id,
          group: image.source_name,
        });
      }
    });
  });

  return groupedImages;
};

const getInitialState = (images: ImagesByName) => {
  const initialState: ReleasesWithArches = {};

  Object.keys(images).forEach((os) => {
    images[os].forEach((image) => {
      if (!initialState[getValueKey(os, image.release!)]) {
        initialState[getValueKey(os, image.release!)] = [];
      }
    });
  });

  return initialState;
};

const removeSpacesAndDots = (str: string) => str.replace(/\s+/g, "-").replace(/\./g, "-");

const getValueKey = (os: string, release: string) => removeSpacesAndDots(`${os}-${release}`);

const DownloadImages = () => {
  // TODO: replace with useInfiniteQuery https://warthogs.atlassian.net/browse/MAASENG-2601
  const { data, isPending, isError, error } = useUpstreamImagesQuery();

  const [images, setImages] = useState<ImagesByName>({});
  const [groupedImages, setGroupedImages] = useState<GroupedImages>({});
  const [initialValues, setInitialValues] = useState<ReleasesWithArches>({});

  const headingId = useId();

  useEffect(() => {
    if (data) {
      const imagesByName = groupImagesByName(data.items);
      setImages(imagesByName);
      setGroupedImages(groupArchesByRelease(imagesByName));
      setInitialValues(getInitialState(imagesByName));
    }
  }, [data]);

  const { setSidebar } = useAppLayoutContext();

  const resetForm = () => {
    setSidebar(null);
    setInitialValues(images ? getInitialState(images) : {});
  };

  const selectUpstreamImages = useSelectUpstreamImagesMutation({
    onSuccess() {
      resetForm();
    },
  });

  const handleSubmit = (
    values: ReleasesWithArches,
    images: UpstreamImage[],
    helpers: FormikHelpers<ReleasesWithArches>,
  ) => {
    const submitData = images.map((image) => ({
      id: image.id,
      download: values[getValueKey(image.os, image.release!)].some((item) => item.value === image.id),
    }));

    selectUpstreamImages.mutate(submitData);
    helpers.setSubmitting(false);
  };

  return (
    <ContentSection className="download-images">
      <ContentSection.Header>
        <ContentSection.Title id={headingId}>Select upstream images to sync</ContentSection.Title>
        <p>
          Below you can select which images should be synced from upstream image sources. Selected images will be made
          available to connected MAAS sites.
        </p>
      </ContentSection.Header>
      <ContentSection.Content>
        {isPending ? (
          <Spinner text="Loading..." />
        ) : isError ? (
          <Notification severity="negative" title="Error while fetching upstream images">
            <ErrorMessage error={error} />
          </Notification>
        ) : groupedImages && data ? (
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            onSubmit={(values, helpers) => handleSubmit(values, data.items, helpers)}
          >
            {({ isSubmitting, dirty, values, setFieldValue }) => (
              <Form aria-labelledby={headingId}>
                {selectUpstreamImages.isError && (
                  <Notification severity="negative" title="Error while selecting images">
                    <ErrorMessage error={selectUpstreamImages.error} />
                  </Notification>
                )}
                <Accordion
                  sections={Object.keys(groupedImages).map((os) => ({
                    title: os,
                    content: (
                      <span key={os}>
                        <table className="download-images__table">
                          <thead>
                            <tr>
                              <th>Release</th>
                              <th>Architecture</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.keys(groupedImages[os]).map((release) => (
                              <tr aria-label={release} key={release}>
                                <td>{release}</td>
                                <td>
                                  <Field
                                    as={MultiSelect}
                                    items={groupedImages[os][release]}
                                    name={removeSpacesAndDots(`${os}-${release}`)}
                                    onItemsUpdate={(items: MultiSelectItem) =>
                                      setFieldValue(getValueKey(os, release), items)
                                    }
                                    placeholder="Select architectures"
                                    selectedItems={values[getValueKey(os, release)]}
                                    variant="condensed"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </span>
                    ),
                  }))}
                  titleElement="h4"
                />
                <ContentSection.Footer>
                  <Button appearance="base" onClick={resetForm} type="button">
                    Cancel
                  </Button>
                  <ActionButton
                    appearance="positive"
                    disabled={!dirty || isSubmitting || selectUpstreamImages.isPending}
                    loading={isSubmitting || selectUpstreamImages.isPending}
                    type="submit"
                  >
                    Save
                  </ActionButton>
                </ContentSection.Footer>
              </Form>
            )}
          </Formik>
        ) : null}
      </ContentSection.Content>
    </ContentSection>
  );
};

export default DownloadImages;
