import * as React from "react";

import { Props as AceEditorProps } from "components/ace-editor";

// Mock the datetime picker to avoid it causing issues due to missing jQuery/Bootstrap parts
jest.mock("components/datetimepicker", () => {
  return {
    __esModule: true,
    DateTimePicker: () => {
      return <div className="input-group">DateTimePicker mockup</div>;
    },
  };
});

// Mock the ACE Editor to avoid it causing issues due to the missing proper library import
jest.mock("components/ace-editor", () => {
  return {
    __esModule: true,
    AceEditor: (props: AceEditorProps) => {
      return (
        <div className={props.className} id={props.id}>
          {props.content}
        </div>
      );
    },
  };
});
