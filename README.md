<div style="text-align:center;">
  <img src="./logo.png" alt="classnames-plus logo"/>
</div>

# Classnames-Plus - Advanced classnames utility

`Classnames-Plus` is a lightweight and advanced utility allowing for programmatically and conditionally building classnames. Building upon existing work with added configuration and overriding support.

# Installation

Install by simply running:  
`npm install classnames-plus`.

Polyfills may be required for older browsers:  
`Array.isArray`: [see here for details](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)   
`Object.keys`: [see here for details](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)

# Usage

### Importing

```javascript
import classnames from "classnames-plus";
// or
const classnames = require("classnames-plus");
```

### Simple

Accepts a set of strings, objects or lists as arguments

- strings are simply concatenated with spaces
- lists are flattened and concatenated with spaces
- object keys are concatenated with spaces if the value is true.
	- a default option is available, resolving only when all other keys in the object is false. By default, the marker is "\_DEFAULT\_"
- falsy values are ignored

```javascript
classnames("a b", "c", "d"); // => "a b c d"
classnames("a", undefined, false, null, "b"); // => "a b"
classnames("a", ["b", ["c", "d"]], "e", "f"); // => "a b c d e f"

classnames("a", { b: true, c: false, d: 12 }); // => "a b d"
classnames("a", { b: false, c: undefined, d: "_DEFAULT_"}); // => "a d"

// values can be combined and composed
classnames("a b", ["c", ["d", "e"], false], { f: true, g: false }); // => "a b c d e f"
```

### Options

`Classnames-Plus` can be configured by calling the `opt` function with a configuration JSON. Output can be configured to be an array instead of a string. Strings with spaces can also be configured to be joined instead of separating. The marker for default options for object processing can also be set.

```javascript
classnames.opt({ output: "array" }).process("a", "b c"); // => ["a", "b", "c"]
classnames.opt({ joinSpaces: "-" }).process("a b", "c"); // => "a-b c"
classnames
	.opt({ defaultMarker: "NEW-DEFAULT-OPTION"}
    .process({a: false, b: undefined, c: "NEW-DEFAULT-OPTION"}); // => "c"

// shorthand function names can be used
classnames.o({ output: "array", joinSpaces: "-" }).p("a b", "c"); // => ["a-b", "c"]
```

### Overriding

Override a base set of classnames by defining classes that are similar in a `likes` regular expression list, or explicitly define overrides in the `precedence` map of regular expressions. Then invoke the override by passing a base classes and dominant classes.

```javascript
classnames
  .o({ likes: [/^px-\d/, /^py-\d/, /^p-\d/] })
  .override("px-2 py-3 text-gray-500 ", "px-1 py-1"); // => "px-1 py-1 text-gray-500"
classnames
  .o({
    precedences: [
      {
        dominant: [/^p-\d/],
        base: [/^px-\d/, /^py-\d/],
      },
    ],
  })
  .override("px-2 py-3 text-gray-500 ", "p-3"); // => "p-3 text-gray-500"
```

# API

`classnames(...parameters)` - processes any number of parameters that are strings, objects or lists.
`classnames.opt(configuration)` - defines configuration options. Available options are:

- output: "string" or "array" - what output is desired, default is "string"
- joinSpaces: string - if strings with spaces should be joined, if blank then spaces will be separated, it is empty by default.
- defaultMarker: string - to mark a key in an object as the default option, resolving when all other keys are false. it is "\_DEFAULT\_" by default.
- likes: array of regex - define similar items for overriding
- precedences: array of objects - define explicit precedences for overriding \* each object contains "dominant" list of regex and "base" list of regex.

`classnames.o(options)` - short hand for `opt`  
`classnames.o(options).process(...parameters)` - process parameters based on selected options  
`classnames.o(options).p(...parameters)` - short hand for `process`  

`classnames.o(options).override(base, dominant)` - override the base class with the dominant class based on selected options.  
`classnames.o(options).ovr(base, dominant)` - shorthand for `override`

# Example

The following is an example for a button using React using [TailwindCSS](https://tailwindcss.com/) classnames.

```javascript
const OldButton = (props) => {
  const getStyling = () => {
    let classList = "px-3 py-2";
    switch (props.variant) {
      case "simple":
        classList += ` bg-transparent border-0`;
        classList += ` ${props.textColor || "text-blue-500"} hover:${
          props.textHoverColor || "text-blue-600"
        }`;
        break;
      case "outline":
        classList += ` bg-transparent border border-blue-500 hover:bg-blue-500 hover:border-transparent rounded`;
        classList += ` ${props.textColor || "text-blue-500"} hover:${
          props.textHoverColor || "text-white"
        }`;
        break;
      default:
        classList += ` bg-blue-500 hover:bg-blue-600 border-blue-500 rounded`;
        classList += ` ${props.textColor || "text-white"} hover:${
          props.textHoverColor || "text-white"
        }`;
        break;
    }
    return classList;
  };
  return <button className={getStyling()}>{props.children}</button>;
};
```

Note the clunky switch statement and repeated usage of `textColor` and `textHoverColor`.
Also note how the styling associated with the button is not easily overriden.

```javascript
const NewButton = (props) => (
  <button
    className={classname
      .o({
        likes: [/^px-\d/, /^py-\d/],
        precedences: [
          {
            base: [/^px-\d/, /^py-\d/],
            dominant: [/^p-\d/],
          },
        ],
      })
      .ovr(
        classname(
          "px-3 py-2",
          {
            "bg-transparent border-0": props.variant === "simple",
            "bg-transparent border border-blue-500 hover:bg-blue-500 hover:border-transparent rounded":
              props.variant === "outline",
            "bg-blue-500 hover:bg-blue-600 border-blue-500 rounded":
              "_DEFAULT_",
          },
          props.textColor || {
            "text-blue-500":
              props.variant === "simple" || props.variant === "outline",
            "text-white": "_DEFAULT",
          },
          props.textHoverColor || {
            "hover:text-blue-500": props.variant === "simple",
            "hover:text-white": "_DEFAULT_",
          }
        ),
        classname(props.className)
      )}
  >
    {props.children}
  </button>
);
```
By using `classnames-plus`, the styling is now much more declarative with easier to follow logic. The definition of likes and precedences also now allow overriding styles. For example:

```javascript
const App = () => {
  return (
    <div>
      <NewButton className={"px-5 py-2"}>First Button</NewButton>
      <NewButton className={"p-5"}>Second Button</NewButton>
    </div>
  );
};
```

The `First Button` has defined custom x and y padding. `Second Button` has defined a uniform padding for both x and y. Both overriding the default padding in `NewButton`.

# Contribution

Contributions are welcome, please ensure you add new tests as necessary.

# License

Licensed under MIT @ [Andrew Xia](http://andrewxia.com)
