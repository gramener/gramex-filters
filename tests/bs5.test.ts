import { mapText, mapAttrs, setupPage } from "./select.test";


describe("test update()", () => {
  let cities: any;
  let sales: any

  beforeAll(async () => ({ cities, sales } = await setupPage('bs5')));

  test("#bootstrap-without-elements creates and adds bootstrap dropdowns", async () => {
    await expect(
      page.$$eval("#bootstrap-without-elements li", (els) =>
        els.map(
          (el) => `${el?.parentElement?.previousElementSibling?.textContent?.trim()} ${el.textContent?.trim()}`
        )
      )
    ).resolves.toEqual([
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
});
