"use strict";

/**
 * Set of default configurations
 */
const DEFAULT_OPTIONS = {
  output: "string",
  defaultMarker: "_DEFAULT_",
  joinSpaces: "",
  likes: [],
  precedences: [],
};

/**
 * process a set of arguments based on given configuration
 * returning classnames as a string or an array depending on configuration
 *
 * @param {object} options - configurations to define the processing
 * @param  {...(string | array | object)} args - class name parameters to join
 */
const _process = (options, ...args) => {
  const { joinSpaces, output, defaultMarker } = options;
  const arrayOptions = { ...DEFAULT_OPTIONS, output: "array" }; // same options, just change the output

  let classes = [];
  args
    .filter((arg) => Boolean(arg))
    .forEach((arg) => {
      switch (typeof arg) {
        case "string":
          if (joinSpaces) {
            classes.push(arg.split(" ").join(joinSpaces)); // combine spaces
          } else {
            classes.push(...arg.split(" "));
          }
          break;
        case "object":
          if (Array.isArray(arg)) {
            classes.push(..._process(arrayOptions, ...arg)); // unpack arrays
          } else {
            const validKeys = Object.keys(arg).filter(
              (k) => Boolean(arg[k]) && arg[k] !== defaultMarker
            );

            // fetch default option when required
            const defaultClass = Object.keys(arg).find(
              (k) => arg[k] === defaultMarker
            );
            if (validKeys.length == 0 && defaultClass) {
              validKeys.push(defaultClass);
            }

            classes.push(..._process(arrayOptions, ...validKeys)); // unpack object
          }
          break;
        default:
          classes.push(String(arg)); // just get the string representation of everything else
          break;
      }
    });

  classes = classes
    .map((name) => name.trim())
    .filter((name) => Boolean(name))
    .sort(); // sort to ensure consistency
  return output === "array" ? classes : classes.join(" ").trim();
};

/**
 * override base classnames with dominant classnames
 * returns classnames as a string or array
 *
 * @param {object} options - configurations to define processing
 * @param {string} base - base classnames
 * @param {string} dominant - dominant classnames
 */
const _override = (options, base, dominant) => {
  const { likes, output, precedences } = options;
  let baseClasses = _process({ ...options, output: "array" }, base); // preprocess base classes as array
  let dominantClasses = _process({ ...options, output: "array" }, dominant); // preprocess dominant classes as array

  // get regular expressions in likes and precedences
  const likesRegex = likes.map((like) => new RegExp(like));
  const precedenceRegex = precedences.map(({ dominant, base }) => ({
    dominant: dominant.map((d) => new RegExp(d)),
    base: base.map((b) => new RegExp(b)),
  }));

  let classes = [];
  // only add base classes if they do not interfere with a dominant class
  classes.push(
    ...baseClasses.filter(
      (base) =>
        !likesRegex.some((like) =>
          dominantClasses.some(
            (dominant) => like.test(base) && like.test(dominant)
          )
        ) &&
        !precedenceRegex.some(
          (precedence) =>
            precedence.dominant.some((precedenceDominant) =>
              dominantClasses.some((dominant) =>
                precedenceDominant.test(dominant)
              )
            ) &&
            precedence.base.some((precedenceBase) => precedenceBase.test(base))
        )
    )
  );
  // add all dominant classes
  classes.push(...dominantClasses);

  classes = classes
    .map((name) => name.trim())
    .filter((name) => Boolean(name))
    .sort();
  return output === "array" ? classes : classes.join(" ").trim();
};

/**
 * set options for processing, returning possible downstream functions to run
 *
 * @param {object} options
 */
const _setOptions = (options) => {
  const processOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // check for option validity
  const { output, joinSpaces, likes, precedences } = processOptions;
  if (output !== "string" && output !== "array") {
    throw new Error("The `output` option must be either `string` or `array`");
  }
  if ((!joinSpaces && joinSpaces !== "") || typeof joinSpaces !== "string") {
    throw new Error("The `joinSpaces` option must be a string");
  }
  if (
    !likes ||
    typeof likes !== "object" ||
    !Array.isArray(likes) ||
    likes.some((like) => !(like instanceof RegExp))
  ) {
    throw new Error(
      "The `likes` option must be an array of regular expressions"
    );
  }
  if (
    !precedences ||
    typeof precedences !== "object" ||
    !Array.isArray(precedences) ||
    precedences.some(
      ({ dominant, base }) =>
        !dominant ||
        typeof dominant !== "object" ||
        !Array.isArray(dominant) ||
        dominant.some((d) => !(d instanceof RegExp)) ||
        !base ||
        typeof base !== "object" ||
        !Array.isArray(base) ||
        base.some((b) => !(b instanceof RegExp))
    )
  ) {
    throw new Error(
      "The `precedences` option must be an array of objects with two parameters, `dominant` and `base`, referring to a list of regular expressions"
    );
  }

  return {
    process: (...args) => _process(processOptions, ...args),
    p: (...args) => _process(processOptions, ...args),
    override: (...args) => _override(processOptions, ...args),
    ovr: (base, dominant) => _override(processOptions, base, dominant),
  };
};

/**
 * Default processing
 *
 * @param  {...( string | object | array )} args
 */
const Index = (...args) => {
  return _process(DEFAULT_OPTIONS, ...args);
};
Index.process = (...args) => _process(DEFAULT_OPTIONS, ...args);
Index.p = (...args) => _process(DEFAULT_OPTIONS, ...args);
Index.opt = _setOptions;
Index.o = _setOptions;

module.exports = Index;
