import { mapText, mapAttrs, setupPage } from "./select.test";

const mapLabelValue = (els: Element[]) =>
  els.map(
    (el) =>
      `${el.parentElement?.previousElementSibling?.textContent?.trim()} ${el.textContent?.trim()}`
  );

describe("test update()", () => {
  let cities: any;
  let sales: any;

  beforeAll(async () => ({ cities, sales } = await setupPage("bs5")));

  test("#bootstrap-without-elements creates bootstrap dropdowns", async () => {
    await expect(page.$$eval("#bootstrap-without-elements button", mapText)).resolves.toEqual([
      "product",
      "city",
      "channel",
    ]);
    await expect(page.$$eval("#bootstrap-without-elements li", mapLabelValue)).resolves.toEqual([
      "product ---",
      "product Alpha",
      "product Beta",
      "product Gamma",
      "city ---",
      "city London",
      "city Oslo",
      "city Paris",
      "channel ---",
      "channel Direct",
      "channel Indirect",
    ]);
  });

  test("#bootstrap-with-elements updates / creates bootstrap dropdowns", async () => {
    await expect(page.$$eval("#bootstrap-with-elements button", mapText)).resolves.toEqual([
      "Product",
      "City",
      "channel",  // lowercase because this is generated from data
    ]);
    await expect(page.$$eval("#bootstrap-with-elements li", mapLabelValue)).resolves.toEqual([
      "Product Alpha",
      "Product Beta",
      "Product Gamma",
      "City London",
      "City Oslo",
      "City Paris",
      "channel Direct",
      "channel Indirect",
    ]);
  });
});
