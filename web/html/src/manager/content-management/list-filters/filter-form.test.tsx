import * as React from "react";
import { prettyDOM, render, screen, select, type } from "utils/test-utils";
import { getClmFiltersOptions } from "../shared/business/filters.enum";

import FilterForm from "./filter-form";

describe("FilterForm", () => {
  test("renders all type UIs", async () => {
    const options = getClmFiltersOptions();

    for (const option of options) {
      const props = {
        filter: {},
        errors: [],
        onChange: () => {},
        onClientValidate: () => {},
      };
      const form = <FilterForm {...props} />;
      render(form);
      await type(screen.getByLabelText(/Filter Name/), "Foo");
      const before = prettyDOM();

      await select(screen.getByLabelText(/Filter Type/), new RegExp(`${option.text}`));
      const after = prettyDOM();
      expect(before).not.toEqual(after);
    }
  });
});
