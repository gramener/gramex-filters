import { attrMap, AttrSpec } from "./filters";

export default {
  fields: {
    selector: ({ name }) => `select[name="${name}"],select.${name},select#${name}`,
    // All parameters not specified explicitly below will be converted into HTML attributes
    render: ({ name, values, selector, default: defaults, multiple = false, ...attrs }): string =>
      `<select name="${name}" ${multiple ? "multiple" : ""} ${attrMap(attrs)}></select>`,
  },
  values: {
    // Don't convert attrs into attributes. <option> has very few attributes that we'd want to set.
    render: ({ value, label = value, ...attrs }, fieldData?: AttrSpec): string =>
      `<option
        ${value == fieldData?.value ? "selected" : ""}
        value="${value || ""}">${label || ""}</option>`,
  },
}
