import Classes from "../src/index";

describe("default", () => {
  it("should return empty string if no arguments present", () => {
    expect(Classes()).toEqual("");
  });

  it("should combine a set of strings", () => {
    expect(Classes("a b", "c", "d")).toEqual("a b c d");
  });

  it("should ignore falsy values", () => {
    expect(Classes("a", [], false, null, undefined)).toEqual("a");
  });

  it("should separate spaces in strings", () => {
    expect(Classes("a b", "c")).toEqual("a b c");
  });

  it("should flatten lists", () => {
    expect(Classes(["a", "b", ["c", "d"]], "e", "f")).toEqual("a b c d e f");
  });

  it("should recognize and adhere to objects", () => {
    expect(Classes({ a: true, b: false, c: undefined, d: 12 })).toEqual("a d");
  });
  it("should recognize defaults in objects", () => {
    expect(Classes({ a: false, b: undefined, c: 0, d: "_DEFAULT_" })).toEqual(
      "d"
    );
  });
  it("should not recognize defaults in objects with true values", () => {
    expect(Classes({ a: true, b: undefined, c: 0, d: "_DEFAULT_" })).toEqual(
      "a"
    );
  });
  it("should be composable with all options", () => {
    expect(
      Classes("a b", ["c", ["d", false, "e"]], undefined, {
        f: true,
        g: false,
      })
    ).toEqual("a b c d e f");
  });
});
