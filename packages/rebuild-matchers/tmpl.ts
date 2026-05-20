import ejs from "ejs";
import template from "./template.ejs" with { type: "text" };

const filename = import.meta.resolve("./template.ejs");

export default ejs.compile(
  template,
  {
    filename,
    escape: JSON.stringify,
    compileDebug: true,
  },
);
