```jsx
import { SubmitButton } from "components/buttons";

import { Form } from "./Form";
import { Text } from "./Text";

const model = {
  firstname: "John",
};

<Form
  model={model}
  onChange={(newModel) => {
    model["firstname"] = newModel["firstname"];
  }}
  onSubmit={() => console.log(model)}
  divClass="col-md-12"
  formDirection="form-horizontal"
>
  <Text
    name="firstname"
    label={t("Field with a label")}
    required
    invalidHint={t("Minimum 2 characters")}
    labelClass="col-md-3"
    divClass="col-md-6"
    validators={[(value) => value.length > 2]}
  />
  <Text
    name="lastname"
    required
    invalidHint={t("Minimum 2 characters")}
    divClass="col-md-6 col-md-offset-3"
    validators={[(value) => value.length > 2]}
  />
  <Text
    name="description"
    type="textarea"
    label={t("Textarea")}
    required
    labelClass="col-md-3"
    divClass="col-md-6"
    maxLength={20}
    showMaxLength
  />
  <Text
    name="optional"
    label={t("Optional field")}
    labelClass="col-md-3"
    divClass="col-md-6"
  />
  <SubmitButton className="btn-success" text={t("Submit")} />
</Form>
```
