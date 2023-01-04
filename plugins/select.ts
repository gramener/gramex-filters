import { attrMap, AttrSpec } from "../filters";

export default {
  fields: {
    selector: ({ name }) =>
      `select[name="${name}"],select.${name},select#${name}`,
    // All parameters not specified explicitly below will be converted into HTML attributes
    render: ({
      name,
      value,
      label,
      default: defaults,
      multiple = false,
      values,
      selector,
      ...attrs
    }): string => {
      const select = `<select name="${name}" ${
        multiple ? "multiple" : ""
      } ${attrMap(attrs)}></select>`;
      return label ? `<label>${label} ${select}</label>` : select;
    },
  },
  values: {
    // Don't convert attrs into attributes. <option> has very few attributes that we'd want to set.
    render: (
      { value, label = value, ...attrs },
      fieldData?: AttrSpec
    ): string =>
      `<option
        ${value == fieldData?.value ? "selected" : ""}
        value="${value || ""}">${label || ""}</option>`,
  },
};
