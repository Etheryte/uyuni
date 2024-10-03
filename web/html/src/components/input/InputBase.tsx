import * as React from "react";

import _debounce from "lodash/debounce";
import _isNil from "lodash/isNil";

import { FormContext } from "./form/Form";
import { FormGroup } from "./FormGroup";
import { Label } from "./Label";
import { ValidationResult, Validator } from "./validation/validation";

export type InputBaseProps<ValueType = string> = {
  /** name of the field to map in the form model.
   * The value can be an array of names if multiple inputs are contained in this field.
   */
  name?: string | Array<string>;

  /** Default value if none is set.
   * In the case of multiple properties managed by this input, an object with the properties
   * as keys and defaults as values should be passed. If a single value is passed it will be
   * set to all keys.
   */
  defaultValue?: ValueType;

  /** Label to display for the field */
  label?: string;

  /** title of the field */
  title?: string;

  /** Hide the label even if the label property is defined */
  hideLabel?: boolean;

  /** Hint string to display */
  hint?: React.ReactNode;

  /** CSS class to use for the label */
  labelClass?: string;

  /** CSS class to use for the <div> element wrapping the field input part */
  divClass?: string;

  /** CSS class to use for the field group */
  className?: string;

  /** Function rendering the children in the value <div>.
   * Takes two parameters:
   *
   * - *setValue*: a function to call when the value needs to be set in the model.
   *   This function takes a name and a value parameter.
   * - *onBlur*: a function to call when loosing the focus on the component.
   */
  children?: (arg0: {
    setValue: (name: string | undefined, value: ValueType) => void;
    onBlur: () => void;
  }) => React.ReactNode;

  /**
   * Indicates whether the field is required in the form.
   * You can optionally specify a value that's used as the error message if the value is not filled.
   */
  required?: boolean | React.ReactNode;

  /** Indicates whether the field is disabled */
  disabled?: boolean;

  /**
   *  Validate the input, either sync or async, return `undefined` when valid, a string or string array for an error message when invalid
   */
  validate?: Validator | Validator[];

  /**
   * Debounce async validation for `debounceValidate` milliseconds
   *
   */
  debounceValidate?: number;

  /**
   *
   * Prefer returning an error message from your validator instead
   *
   * Fallback validation error
   *
   */
  invalidHint?: React.ReactNode;

  /** Function to call when the data model needs to be changed.
   *  Takes a name and a value parameter.
   */
  onChange?: (name: string | undefined, value: ValueType) => void;
};

type State = {
  isTouched: boolean;

  requiredError?: React.ReactNode;

  /**
   * Error messages received from FormContext (typically errors messages received from a server response)
   */
  formErrors?: string[];

  /**
   * Validation errors, a `Map` from a given validator to its result
   */
  validationErrors: Map<number, ValidationResult>;
};

export class InputBase<ValueType = string> extends React.Component<InputBaseProps<ValueType>, State> {
  static defaultProps = {
    defaultValue: undefined,
    label: undefined,
    hint: undefined,
    labelClass: undefined,
    divClass: undefined,
    className: undefined,
    required: false,
    disabled: false,
    invalidHint: undefined,
    onChange: undefined,
  };

  constructor(props: InputBaseProps<ValueType>) {
    super(props);
    this.state = {
      isTouched: false,
      formErrors: undefined,
      validationErrors: new Map(),
    };
  }

  componentDidMount() {
    if (this.props?.name) {
      if (this.context.registerInput != null) {
        this.context.registerInput(this);
      }

      const model = this.context.model || {};

      const checkValueChange = (name: string, defaultValue?: ValueType) => {
        // If we don't have a value yet but do have a defaultValue, set it on the model
        if (typeof model[name] === "undefined" && typeof defaultValue !== "undefined") {
          this.setValue(name, defaultValue);
          return;
        }

        /**
         * TODO: This is a bug and only holds for inputs where the value is a string, in dropdowns and the like, we should not fall back to "".
         * In addition, this doesn't allow setting defaultValue to falsey values, we should use ?? instead but this needs to be thoroughly tested.
         */
        const value = model[name] || defaultValue || "";
        const valueChanged =
          (value instanceof Date && model[name] instanceof Date && value.getTime() !== model[name].getTime()) ||
          value !== model[name];

        if (valueChanged) {
          this.setValue(name, value);
        }
      };
      if (this.props.name instanceof Array) {
        this.props.name.forEach((name) => {
          const defaultValue =
            this.props.defaultValue instanceof Object ? this.props.defaultValue[name] : this.props.defaultValue;
          checkValueChange(name, defaultValue);
        });
      } else {
        checkValueChange(this.props.name, this.props.defaultValue);
      }
    }
  }

  componentDidUpdate(prevProps) {
    // Revalidate when changing the following props on-the-fly
    if (this.props.required !== prevProps.required || this.props.disabled !== prevProps.disabled) {
      this.validate(this.getModelValue());
    }
  }

  componentWillUnmount() {
    if (Object.keys(this.context).length > 0) {
      this.context.unregisterInput?.(this);
      if (Array.isArray(this.props.name)) {
        this.props.name.forEach((name) => this.context.setModelValue?.(name, undefined));
      } else if (this.props.name) {
        this.context.setModelValue?.(this.props.name, undefined);
      }
    }
  }

  onBlur = () => {
    this.setState({
      isTouched: true,
    });
  };

  getModelValue() {
    const name = this.props.name;
    if (Array.isArray(name)) {
      const values = Object.keys(this.context.model).reduce((filtered, key) => {
        if (name.includes(key)) {
          filtered[key] = this.context.model[key];
        }
        return filtered;
      }, {} as ValueType);
      return values;
    } else if (typeof name !== "undefined") {
      return this.context.model[name];
    }
  }

  isEmptyValue(input: unknown) {
    if (typeof input === "string") {
      return input.trim() === "";
    }
    return _isNil(input);
  }

  requiredHint = () => {
    const value = this.getModelValue();
    const hasNoValue =
      this.isEmptyValue(value) ||
      (Array.isArray(this.props.name) && Object.values(value).filter((v) => !this.isEmptyValue(v)).length === 0);

    if (hasNoValue) {
      if (typeof this.props.required === "string") {
        return this.props.required;
      }

      return this.props.label ? t(`${this.props.label} is required.`) : t("Required");
    }
  };

  private validateRequired = <T,>(value: T) => {
    let requiredError: React.ReactNode = undefined;

    if (this.props.required && !this.props.disabled) {
      const hasNoValue =
        this.isEmptyValue(value) ||
        (Array.isArray(this.props.name) && Object.values(value).filter((v) => !this.isEmptyValue(v)).length === 0);

      if (hasNoValue) {
        if (this.props.required && this.props.required !== true) {
          requiredError = this.props.required;
        } else {
          requiredError = this.props.label ? t(`${this.props.label} is required.`) : t("Required");
        }
      }
    }

    if (requiredError !== this.state.requiredError) {
      this.setState({ requiredError }, () => this.context.validateForm?.());
    }
  };

  /**
   * Validate the input, updating state and errors if necessary.
   *
   * The default case is for InputBase<ValueType = string>, but different inputs may use any type, for example an object when
   * `this.props.name` is an array. This makes inferring validation types tricky, so we accept whatever inputs make sense
   * for a given branch.
   */
  private debouncedValidate = _debounce(async <T,>(value: T): Promise<void> => {
    const validators = Array.isArray(this.props.validate) ? this.props.validate : [this.props.validate] ?? [];

    /**
     * Each validator sets its own result independently, this way we can mix and match different speed async
     * validators without having to wait all of them to finish
     */
    await Promise.all(
      validators.map(async (validator, index) => {
        // If the validator is debounced, it may be undefined
        if (!validator) {
          return;
        }

        // BUG: We don't handle race conditions here, it's a bug, but it will get fixed for free this once we swap this code out for Formik
        const result = await validator(value);
        this.setState((state) => {
          const newValidationErrors = new Map(state.validationErrors);
          if (result) {
            newValidationErrors.set(index, result);
          } else {
            newValidationErrors.delete(index);
          }

          return {
            ...state,
            validationErrors: newValidationErrors,
          };
        });
      })
    );

    this.context.validateForm?.();
  }, this.props.debounceValidate ?? 0);

  validate = <InferredValueType extends unknown = ValueType>(value: InferredValueType): void => {
    this.validateRequired(value);
    this.debouncedValidate(value);
  };

  isValid = () => {
    if (this.state.requiredError) {
      return false;
    }
    if (this.state.formErrors?.some((item) => typeof item !== "undefined")) {
      return false;
    }
    if (this.state.validationErrors.size > 0) {
      return false;
    }
    return true;
  };

  setFormErrors = (formErrors?: string[]) => {
    this.setState({ formErrors });
  };

  setValue = (name: string | undefined = undefined, value: ValueType) => {
    if (name && this.context.setModelValue != null) {
      this.context.setModelValue(name, value);
    }

    const propsName = this.props.name;
    if (propsName instanceof Array) {
      const values = Object.keys(this.context.model).reduce((filtered, key) => {
        if (propsName.includes(key)) {
          filtered[key] = this.context.model[key];
        }
        return filtered;
      }, {});
      if (name) {
        this.validate(Object.assign({}, values, { [name]: value }));
      } else {
        this.validate(Object.assign({}, values));
      }
    } else {
      this.validate(value);
    }

    this.props.onChange?.(name, value);
  };

  pushHint(hints: React.ReactNode[], hint?: React.ReactNode) {
    if (!hint) {
      return;
    }

    if (Array.isArray(hint)) {
      hint.forEach((item) => this.pushHint(hints, item));
      return;
    }

    if (hint) {
      if (hints.length > 0) {
        hints.push(<br key={hints.length} />);
      }
      hints.push(hint);
    }
  }

  render() {
    const hints: React.ReactNode[] = [];
    this.pushHint(hints, this.props.hint);
    this.state.formErrors?.forEach((error) => this.pushHint(hints, error));
    if (this.state.isTouched) {
      if (this.state.validationErrors.size) {
        if (this.props.invalidHint) {
          this.pushHint(hints, this.props.invalidHint);
        } else {
          this.state.validationErrors.forEach((error) => this.pushHint(hints, error));
        }
      }

      this.pushHint(hints, this.state.requiredError);
    }

    const hasError = this.state.isTouched && !this.isValid();

    // if (!this.isValid()) {
    //   console.log("+++++++++++++++++++++");
    //   console.log(this.props.name);
    //   console.log(this.state.requiredError);
    //   console.log(this.state.validationErrors);
    //   console.log(this.state.formErrors);
    //   console.log(this.getModelValue());
    //   console.log("+++++++++++++++++++++");
    // }

    return (
      <FormGroup isError={hasError} key={`${this.props.name}-group`} className={this.props.className}>
        {this.props.label && (
          <Label
            name={this.props.label}
            className={this.props.labelClass}
            required={!!this.props.required}
            key={`${this.props.name}-label`}
            htmlFor={typeof this.props.name === "string" ? this.props.name : undefined}
          />
        )}
        <div className={this.props.divClass}>
          {this.props.children?.({
            setValue: this.setValue,
            onBlur: this.onBlur,
          })}
          {hints.length ? <div className="help-block">{hints}</div> : null}
        </div>
      </FormGroup>
    );
  }
}
InputBase.contextType = FormContext;
