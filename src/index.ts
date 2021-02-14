/**
 * An input argument to process into a classname
 */
declare type Argument =
  | string
  | { [k: string]: any }
  | Array<Argument>
  | undefined // include falsy values to handle on the fly calculation
  | null
  | false;
/**
 * Base options type
 */
declare type Option = {
  defaultMarker: string;
  joinSpaces: string;
  likes: Array<RegExp>;
  precedences: Array<{
    base: Array<RegExp>;
    dominant: Array<RegExp>;
  }>;
};
/**
 * Options type for inputting, all optional values as
 * default will fill in the rest.
 */
declare type InputOption = {
  output?: "string" | "array";
  defaultMarker?: string;
  joinSpaces?: string;
  likes?: Array<RegExp>;
  precedences?: Array<{
    base: Array<RegExp>;
    dominant: Array<RegExp>;
  }>;
};
/**
 * Options with output set to string
 */
declare type StringOption = Option & {
  output: "string";
};
/**
 * Options with output set to array
 */
declare type ArrayOption = Option & {
  output: "array";
};
/**
 * Output of options setting to chain into processing
 */
declare type Chain = {
  process: (...args: Array<Argument>) => string | Array<string>;
  p: (...args: Array<Argument>) => string | Array<string>;
  override: (base: Argument, dominant: Argument) => string | Array<string>;
  ovr: (base: Argument, dominant: Argument) => string | Array<string>;
};

/**
 * Default options
 */
const defaultOptions: StringOption = {
  output: "string",
  defaultMarker: "_DEFAULT_",
  joinSpaces: "",
  likes: [],
  precedences: [],
};

/**
 * Process arguments into a classname as an array or string
 *
 * @param options - options with either output set to "string" or "array"
 * @param args - arguments to process into a classname
 */
function _process(options: StringOption, ...args: Array<Argument>): string;
function _process(
  options: ArrayOption,
  ...args: Array<Argument>
): Array<string>;
function _process(
  options: StringOption | ArrayOption,
  ...args: Array<Argument>
): string | Array<string> {
  const { joinSpaces, defaultMarker } = options;
  const arrayOption: ArrayOption = {
    ...options,
    output: "array",
  }; // array version of options

  const classes: Array<string> = []; // the list of classes to fill out
  args
    .filter((a) => Boolean(a))
    .forEach((arg: Argument) => {
      if (typeof arg === "string") {
        const stringArg: string = arg as string;
        const arr = stringArg.split(" ");
        if (joinSpaces) {
          classes.push(arr.join(joinSpaces)); // joining spaces if requested
        } else {
          classes.push(...arr);
        }
      } else if (typeof arg === "object" && Array.isArray(arg)) {
        arg.forEach((subArg: Argument) => {
          const arr = _process(arrayOption, subArg);
          classes.push(...arr);
        });
      } else if (typeof arg === "object") {
        const obj: {
          [k: string]: any;
        } = arg as object;
        const keys: Array<string> = Object.keys(obj);
        const validKeys: Array<string> = keys.filter(
          (k: string) => Boolean(obj[k]) && obj[k] !== defaultMarker
        ); // find all keys to add
        const defaultKey = keys.find((k: string) => obj[k] === defaultMarker);

        if (validKeys.length === 0 && defaultKey) {
          validKeys.push(defaultKey); // use default key if applicable
        }
        const arr = _process(arrayOption, ...validKeys);
        classes.push(...arr);
      } else {
        classes.push(String(arg));
      }
    });
  const outputClasses = classes
    .map((c: string) => c.trim()) // trim excess whitespace
    .filter((c) => Boolean(c)) // ensure no falsy values
    .sort(); // sort for consistency
  if (options.output === "array") {
    return outputClasses;
  } else {
    return outputClasses.join(" ").trim();
  }
}

/**
 * override base set of classes with an overriding dominant set of classes
 *
 * @param options - options with likes and overriding precedences
 * @param base - base set of classes
 * @param dominant - overriding set of classes to apply onto base
 */
function _override(
  options: ArrayOption,
  base: Argument,
  dominant: Argument
): Array<string>;
function _override(
  options: StringOption,
  base: Argument,
  dominant: Argument
): string;
function _override(
  options: ArrayOption | StringOption,
  base: Argument,
  dominant: Argument
): Array<string> | string {
  const { likes, precedences, output } = options;
  const arrayOptions: ArrayOption = {
    ...options,
    output: "array",
  };
  const baseClasses = _process(arrayOptions, base);
  const dominantClasses = _process(arrayOptions, dominant);

  let classes = [];
  // only add base classes if they do not interfere with a dominant class
  const filteredBase: Array<string> = baseClasses.filter(
    (base: string) =>
      // handle likes
      !likes.some((like: RegExp) =>
        dominantClasses.some(
          (dominant) => like.test(base) && like.test(dominant)
        )
      ) &&
      // handle precedences
      !precedences.some(
        (precedence: { dominant: Array<RegExp>; base: Array<RegExp> }) =>
          precedence.dominant.some((precedenceDominant: RegExp) =>
            dominantClasses.some((dominant: string) =>
              precedenceDominant.test(dominant)
            )
          ) &&
          precedence.base.some((precedenceBase: RegExp) =>
            precedenceBase.test(base)
          )
      )
  );
  classes.push(...filteredBase);
  // add all dominant classes
  classes.push(...dominantClasses);

  const outputClasses = classes
    .map((c: string) => c.trim()) // trim excess whitespace
    .filter((c) => Boolean(c)) // ensure no falsy values
    .sort(); // sort for consistency

  if (output === "array") {
    return outputClasses;
  } else {
    return outputClasses.join(" ").trim();
  }
}

/**
 * Sets options to chain to processing or overriding
 *
 * @param options - input options to set
 */
function _setOptions(options: InputOption): Chain {
  const combinedOptions = {
    ...defaultOptions,
    ...options,
  };
  if (options.output === "array") {
    const nextOptions = combinedOptions as ArrayOption;
    return {
      process: (...args: Array<Argument>) => _process(nextOptions, ...args),
      p: (...args: Array<Argument>) => _process(nextOptions, ...args),
      override: (base: Argument, dominant: Argument) =>
        _override(nextOptions, base, dominant),
      ovr: (base: Argument, dominant: Argument) =>
        _override(nextOptions, base, dominant),
    };
  } else {
    const nextOptions = combinedOptions as StringOption;
    return {
      process: (...args: Array<Argument>) => _process(nextOptions, ...args),
      p: (...args: Array<Argument>) => _process(nextOptions, ...args),
      override: (base: Argument, dominant: Argument) =>
        _override(nextOptions, base, dominant),
      ovr: (base: Argument, dominant: Argument) =>
        _override(nextOptions, base, dominant),
    };
  }
}

/**
 * Process using the default options
 *
 * @param args - aguments to process
 */
const _defaultProcess = (...args: Array<Argument>) => {
  return _process(defaultOptions, ...args);
};

/**
 * Process classes into a string
 *
 * @param args - classes to combine or process into a class string
 * @returns - a string class name
 */
const Classes = (...args: Array<Argument>) => _defaultProcess(...args);

/**
 * Equivalent to Classes(...args), Process classes into a string
 *
 * @param args - classes to combine or process into a class string
 * @returns - a string class name
 */
Classes.process = (...args: Array<Argument>) => _defaultProcess(...args);
/**
 * Short-hand for process, process classes into a string
 *
 * @param args - classes to combine or process into a class string
 * @returns - a string class name
 */
Classes.p = (...args: Array<Argument>) => _defaultProcess(...args);
/**
 * Sets options for chaining
 *
 * @param options - options to set
 * @returns functions to process/override using the options
 */
Classes.opt = (options: InputOption) => _setOptions(options);
/**
 * Short-hand for opt, Sets options for chaining
 *
 * @param options - options to set
 * @returns functions to process/override using the options
 */
Classes.o = (options: InputOption) => _setOptions(options);
export default Classes;
