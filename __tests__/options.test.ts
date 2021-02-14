import Classes from "../src/index";

describe("options", () => {
  it("should return an array", () => {
    expect(Classes.opt({ output: "array" }).process("a", "b c")).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("should return empty array", () => {
    expect(Classes.opt({ output: "array" }).process()).toEqual([]);
  });

  it("should combine strings", () => {
    expect(
      Classes.opt({
        joinSpaces: "-",
      }).process("a b c", "d e")
    ).toEqual("a-b-c d-e");
  });
  it("should combine options", () => {
    expect(
      Classes.o({ output: "array", joinSpaces: "-" }).p("a b", "c")
    ).toEqual(["a-b", "c"]);
  });
  it("should allow changing default maker", () => {
    expect(
      Classes.o({ defaultMarker: "-NEW-DEFAULT-MARKER-" }).p({
        a: false,
        b: undefined,
        c: 0,
        d: "-NEW-DEFAULT-MARKER-",
      })
    ).toEqual("d");
  });
});
