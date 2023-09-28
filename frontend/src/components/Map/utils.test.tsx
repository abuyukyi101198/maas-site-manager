import { renderToHtmlString } from "./utils";

import { act } from "@/utils/test-utils";

it("converts the React element to an HTML string", () => {
  act(() => {
    const Component = () => <div>Test</div>;
    expect(renderToHtmlString(<Component />)).toEqual("<div>Test</div>");
  });
});
