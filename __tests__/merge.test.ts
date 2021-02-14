import Classes from "../src/index";

describe("merge", () => {
  it("should override likes", () => {
    expect(
      Classes.opt({
        likes: [/px-\d/, /py-\d/, /p-\d/],
      }).override("px-2 py-3 text-gray-500 ", "px-1 py-1")
    ).toEqual("px-1 py-1 text-gray-500");
  });

  it("should override maps", () => {
    expect(
      Classes.opt({
        precedences: [
          {
            dominant: [/p-\d/],
            base: [/px-\d/, /py-\d/],
          },
        ],
      }).override("px-2 py-3 text-gray-500 ", "p-3")
    ).toEqual("p-3 text-gray-500");
  });

  it("should process empty strings", () => {
    expect(
      Classes.opt({
        likes: [/px-\d/, /py-\d/, /p-\d/],
      }).override("px-2 py-3 text-gray-500 ", "")
    ).toEqual("px-2 py-3 text-gray-500");
  });

  it("should not confuse partial string matches", () => {
    expect(
      Classes.opt({
        likes: [/^border(-\d)?$/],
      }).override("border-2 border-gray-300", "border-4")
    ).toEqual("border-4 border-gray-300");
  });
});
