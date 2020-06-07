const assert = require("assert");
const expect = require("chai").expect;

const classnames = require("../index");

describe("default", () => {
  it("should return empty string if no arguments present", () => {
    assert.equal(classnames(), "");
  });

  it("should combine a set of strings", () => {
    assert.equal(classnames("a b", "c", "d"), "a b c d");
  });

  it("should ignore falsy values", () => {
    assert.equal(classnames("a", undefined, false, [], 0), "a");
  });

  it("should separate spaces in strings", () => {
    assert.equal(classnames("a b", "c"), "a b c");
  });

  it("should flatten lists", () => {
    assert.equal(classnames(["a", "b", ["c", "d"]], "e", "f"), "a b c d e f");
  });

  it("should recognize and adhere to objects", () => {
    assert.equal(classnames({ a: true, b: false, c: undefined, d: 12 }), "a d");
  });
  it("should recognize defaults in objects", () => {
    assert.equal(
      classnames({ a: false, b: undefined, c: 0, d: "_DEFAULT_" }),
      "d"
    );
  });
  it("should not recognize defaults in objects with true values", () => {
    assert.equal(
      classnames({ a: true, b: undefined, c: 0, d: "_DEFAULT_" }),
      "a"
    );
  });

  it("should be composable with all options", () => {
    assert.equal(
      classnames("a b", ["c", ["d", false, "e"]], undefined, {
        f: true,
        g: false,
      }),
      "a b c d e f"
    );
  });
});

describe("options", () => {
  it("should return an array", () => {
    expect(
      classnames.opt({ output: "array" }).process("a", "b c")
    ).to.have.members(["a", "b", "c"]);
  });

  it("should return empty array", () => {
    expect(classnames.opt({ output: "array" }).process()).to.have.length(0);
  });

  it("should combine strings", () => {
    assert.equal(
      classnames
        .opt({
          joinSpaces: "-",
        })
        .process("a b c", "d e"),
      "a-b-c d-e"
    );
  });
  it("should combine options", () => {
    expect(
      classnames.o({ output: "array", joinSpaces: "-" }).p("a b", "c")
    ).to.have.members(["a-b", "c"]);
  });
  it("should allow changing default maker", () => {
    assert.equal(
      classnames
        .o({ defaultMaker: "-NEW-DEFAULT-MARKER-" })
        .p({ a: false, b: undefined, c: 0, d: "-NEW-DEFAULT-MARKER-" }),
      "d"
    );
  });
});

describe("merge", () => {
  it("should override likes", () => {
    assert.equal(
      classnames
        .opt({
          likes: [/^px-\d/, /^py-\d/, /^p-\d/],
        })
        .override("px-2 py-3 text-gray-500 ", "px-1 py-1"),
      "px-1 py-1 text-gray-500"
    );
  });

  it("should override maps", () => {
    assert.equal(
      classnames
        .opt({
          precedences: [
            {
              dominant: [/^p-\d/],
              base: [/^px-\d/, /^py-\d/],
            },
          ],
        })
        .override("px-2 py-3 text-gray-500 ", "p-3"),
      "p-3 text-gray-500"
    );
  });

  it("should process empty strings", () => {
    assert.equal(
      classnames
        .opt({
          likes: [/^px-\d/, /^py-\d/, /^p-\d/],
        })
        .override("px-2 py-3 text-gray-500 ", ""),
      "px-2 py-3 text-gray-500"
    );
  });
});

describe("ensure options", () => {
  it("should not process invalid output", () => {
    assert.throws(() => classnames.opt({ output: "" }).p("test"), Error);
  });
  it("should not process invalid join spaces", () => {
    assert.throws(() => classnames.opt({ joinSpaces: 12 }).p("test"), Error);
  });
  it("should not process invalid likes", () => {
    assert.throws(() => classnames.opt({ likes: 12 }).p("test"), Error);
  });
  it("should not process invalid string likes", () => {
    assert.throws(() => classnames.opt({ likes: ["/^p/"] }).p("test"), Error);
  });
  it("should not process invalid precedences", () => {
    assert.throws(() => classnames.opt({ precedences: "" }).p("test"), Error);
  });
  it("should not process invalid precedences values", () => {
    assert.throws(() => classnames.opt({ precedences: {} }).p("test"), Error);
  });
  it("should not process invalid precedences", () => {
    assert.throws(
      () =>
        classnames
          .opt({ precedences: { dominant: [""] }, base: [""] })
          .p("test"),
      Error
    );
  });
});
