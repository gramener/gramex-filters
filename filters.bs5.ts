import { attrMap, AttrSpec } from "./filters";

export default {
  fields: {
    selector: ({ name }) => `.dropdown.${name} .dropdown-menu,.dropdown#${name} .dropdown-menu`,
    render: ({
      name,
      value,
      label = name,
      multiple = false,
      default: defaults,
      buttonClass = "btn btn-primary",
      dropdownClass = "",
      menuClass = "",
      values,
      selector,
      ...attrs
    }): string =>
      `
<div class="dropdown ${name} ${dropdownClass}">
  <button class="dropdown-toggle ${buttonClass}"
    type="button" data-bs-toggle="dropdown" aria-expanded="false">${label}</button>
  <ul class="dropdown-menu ${menuClass}"></ul>
</div>`,
  },
  values: {
    render: (
      { value, label = value, dropdownItemClass = "", ...attrs },
      fieldData?: AttrSpec
    ): string =>
      `<li><a
            class="dropdown-item ${dropdownItemClass} ${value == fieldData?.value ? "active" : ""}"
            ${attrMap(attrs)}>${label}</a>
        </li>`,
  },
};
