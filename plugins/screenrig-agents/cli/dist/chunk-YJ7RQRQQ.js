import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  require__,
  require_ajv
} from "./chunk-52RPSLX3.js";
import {
  require_codegen
} from "./chunk-XAYSKU3G.js";
import {
  readAsset
} from "./chunk-4QJFIFQH.js";
import {
  RESOURCE_ID_PATTERNS
} from "./chunk-SFYZH3GR.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  __commonJS,
  __template,
  __toESM
} from "./chunk-3FYAGULW.js";

// node_modules/ajv-formats/dist/formats.js
var require_formats = __commonJS({
  "node_modules/ajv-formats/dist/formats.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatNames = exports.fastFormats = exports.fullFormats = void 0;
    function fmtDef(validate, compare) {
      return { validate, compare };
    }
    exports.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: fmtDef(date, compareDate),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: fmtDef(getTime(true), compareTime),
      "date-time": fmtDef(getDateTime(true), compareDateTime),
      "iso-time": fmtDef(getTime(), compareIsoTime),
      "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte,
      // signed 32 bit integer
      int32: { type: "number", validate: validateInt32 },
      // signed 64 bit integer
      int64: { type: "number", validate: validateInt64 },
      // C-type float
      float: { type: "number", validate: validateNumber },
      // C-type double
      double: { type: "number", validate: validateNumber },
      // hint to the UI to hide input strings
      password: true,
      // unchecked string payload
      binary: true
    };
    exports.fastFormats = {
      ...exports.fullFormats,
      date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
      time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
      "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
      "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
      "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    };
    exports.formatNames = Object.keys(exports.fullFormats);
    function isLeapYear(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
    var DAYS2 = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS2[month]);
    }
    function compareDate(d1, d2) {
      if (!(d1 && d2))
        return void 0;
      if (d1 > d2)
        return 1;
      if (d1 < d2)
        return -1;
      return 0;
    }
    var TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function getTime(strictTimeZone) {
      return function time(str) {
        const matches = TIME.exec(str);
        if (!matches)
          return false;
        const hr = +matches[1];
        const min = +matches[2];
        const sec = +matches[3];
        const tz = matches[4];
        const tzSign = matches[5] === "-" ? -1 : 1;
        const tzH = +(matches[6] || 0);
        const tzM = +(matches[7] || 0);
        if (tzH > 23 || tzM > 59 || strictTimeZone && !tz)
          return false;
        if (hr <= 23 && min <= 59 && sec < 60)
          return true;
        const utcMin = min - tzM * tzSign;
        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
      };
    }
    function compareTime(s1, s2) {
      if (!(s1 && s2))
        return void 0;
      const t1 = (/* @__PURE__ */ new Date("2020-01-01T" + s1)).valueOf();
      const t2 = (/* @__PURE__ */ new Date("2020-01-01T" + s2)).valueOf();
      if (!(t1 && t2))
        return void 0;
      return t1 - t2;
    }
    function compareIsoTime(t1, t2) {
      if (!(t1 && t2))
        return void 0;
      const a1 = TIME.exec(t1);
      const a2 = TIME.exec(t2);
      if (!(a1 && a2))
        return void 0;
      t1 = a1[1] + a1[2] + a1[3];
      t2 = a2[1] + a2[2] + a2[3];
      if (t1 > t2)
        return 1;
      if (t1 < t2)
        return -1;
      return 0;
    }
    var DATE_TIME_SEPARATOR = /t|\s/i;
    function getDateTime(strictTimeZone) {
      const time = getTime(strictTimeZone);
      return function date_time(str) {
        const dateTime = str.split(DATE_TIME_SEPARATOR);
        return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
      };
    }
    function compareDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const d1 = new Date(dt1).valueOf();
      const d2 = new Date(dt2).valueOf();
      if (!(d1 && d2))
        return void 0;
      return d1 - d2;
    }
    function compareIsoDateTime(dt1, dt2) {
      if (!(dt1 && dt2))
        return void 0;
      const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
      const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
      const res = compareDate(d1, d2);
      if (res === void 0)
        return void 0;
      return res || compareTime(t1, t2);
    }
    var NOT_URI_FRAGMENT = /\/|:/;
    var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function uri(str) {
      return NOT_URI_FRAGMENT.test(str) && URI.test(str);
    }
    var BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function byte(str) {
      BYTE.lastIndex = 0;
      return BYTE.test(str);
    }
    var MIN_INT32 = -(2 ** 31);
    var MAX_INT32 = 2 ** 31 - 1;
    function validateInt32(value) {
      return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
    }
    function validateInt64(value) {
      return Number.isInteger(value);
    }
    function validateNumber() {
      return true;
    }
    var Z_ANCHOR = /[^\\]\\Z/;
    function regex(str) {
      if (Z_ANCHOR.test(str))
        return false;
      try {
        new RegExp(str);
        return true;
      } catch (e) {
        return false;
      }
    }
  }
});

// node_modules/ajv-formats/dist/limit.js
var require_limit = __commonJS({
  "node_modules/ajv-formats/dist/limit.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.formatLimitDefinition = void 0;
    var ajv_1 = require_ajv();
    var codegen_1 = require_codegen();
    var ops = codegen_1.operators;
    var KWDs = {
      formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
      formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
      formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE }
    };
    var _a, _b;
    var error = {
      message: ({ keyword, schemaCode }) => (0, codegen_1.str)(_a || (_a = __template(["should be ", " ", ""])), KWDs[keyword].okStr, schemaCode),
      params: ({ keyword, schemaCode }) => (0, codegen_1._)(_b || (_b = __template(["{comparison: ", ", limit: ", "}"])), KWDs[keyword].okStr, schemaCode)
    };
    var _c, _d, _e, _f, _g, _h;
    exports.formatLimitDefinition = {
      keyword: Object.keys(KWDs),
      type: "string",
      schemaType: "string",
      $data: true,
      error,
      code(cxt) {
        const { gen, data, schemaCode, keyword, it } = cxt;
        const { opts, self } = it;
        if (!opts.validateFormats)
          return;
        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
        if (fCxt.$data)
          validate$DataFormat();
        else
          validateFormat();
        function validate$DataFormat() {
          const fmts = gen.scopeValue("formats", {
            ref: self.formats,
            code: opts.code.formats
          });
          const fmt = gen.const("fmt", (0, codegen_1._)(_c || (_c = __template(["", "[", "]"])), fmts, fCxt.schemaCode));
          cxt.fail$data((0, codegen_1.or)((0, codegen_1._)(_d || (_d = __template(["typeof ", ' != "object"'])), fmt), (0, codegen_1._)(_e || (_e = __template(["", " instanceof RegExp"])), fmt), (0, codegen_1._)(_f || (_f = __template(["typeof ", '.compare != "function"'])), fmt), compareCode(fmt)));
        }
        function validateFormat() {
          const format = fCxt.schema;
          const fmtDef = self.formats[format];
          if (!fmtDef || fmtDef === true)
            return;
          if (typeof fmtDef != "object" || fmtDef instanceof RegExp || typeof fmtDef.compare != "function") {
            throw new Error('"'.concat(keyword, '": format "').concat(format, '" does not define "compare" function'));
          }
          const fmt = gen.scopeValue("formats", {
            key: format,
            ref: fmtDef,
            code: opts.code.formats ? (0, codegen_1._)(_g || (_g = __template(["", "", ""])), opts.code.formats, (0, codegen_1.getProperty)(format)) : void 0
          });
          cxt.fail$data(compareCode(fmt));
        }
        function compareCode(fmt) {
          return (0, codegen_1._)(_h || (_h = __template(["", ".compare(", ", ", ") ", " 0"])), fmt, data, schemaCode, KWDs[keyword].fail);
        }
      },
      dependencies: ["format"]
    };
    var formatLimitPlugin = (ajv) => {
      ajv.addKeyword(exports.formatLimitDefinition);
      return ajv;
    };
    exports.default = formatLimitPlugin;
  }
});

// node_modules/ajv-formats/dist/index.js
var require_dist = __commonJS({
  "node_modules/ajv-formats/dist/index.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var formats_1 = require_formats();
    var limit_1 = require_limit();
    var codegen_1 = require_codegen();
    var fullName = new codegen_1.Name("fullFormats");
    var fastName = new codegen_1.Name("fastFormats");
    var formatsPlugin = (ajv, opts = { keywords: true }) => {
      if (Array.isArray(opts)) {
        addFormats2(ajv, opts, formats_1.fullFormats, fullName);
        return ajv;
      }
      const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
      const list = opts.formats || formats_1.formatNames;
      addFormats2(ajv, list, formats, exportName);
      if (opts.keywords)
        (0, limit_1.default)(ajv);
      return ajv;
    };
    formatsPlugin.get = (name, mode = "full") => {
      const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
      const f = formats[name];
      if (!f)
        throw new Error('Unknown format "'.concat(name, '"'));
      return f;
    };
    var _a;
    function addFormats2(ajv, list, fs, exportName) {
      var _a2;
      var _b;
      (_a2 = (_b = ajv.opts.code).formats) !== null && _a2 !== void 0 ? _a2 : _b.formats = (0, codegen_1._)(_a || (_a = __template(['require("ajv-formats/dist/formats").', ""])), exportName);
      for (const f of list)
        ajv.addFormat(f, fs[f]);
    }
    module.exports = exports = formatsPlugin;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = formatsPlugin;
  }
});

// node_modules/entities/dist/decode-codepoint.js
var decodeMap = /* @__PURE__ */ new Map([
  [0, 65533],
  // C1 Unicode control character reference replacements
  [128, 8364],
  [130, 8218],
  [131, 402],
  [132, 8222],
  [133, 8230],
  [134, 8224],
  [135, 8225],
  [136, 710],
  [137, 8240],
  [138, 352],
  [139, 8249],
  [140, 338],
  [142, 381],
  [145, 8216],
  [146, 8217],
  [147, 8220],
  [148, 8221],
  [149, 8226],
  [150, 8211],
  [151, 8212],
  [152, 732],
  [153, 8482],
  [154, 353],
  [155, 8250],
  [156, 339],
  [158, 382],
  [159, 376]
]);
function replaceCodePoint(codePoint) {
  if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
    return 65533;
  }
  return decodeMap.get(codePoint) ?? codePoint;
}

// node_modules/entities/dist/internal/decode-shared.js
function decodeBase64(input) {
  const binary = atob(input);
  const evenLength = binary.length & ~1;
  const out = new Uint16Array(evenLength / 2);
  for (let index = 0, outIndex = 0; index < evenLength; index += 2) {
    const lo = binary.charCodeAt(index);
    const hi = binary.charCodeAt(index + 1);
    out[outIndex++] = lo | hi << 8;
  }
  return out;
}

// node_modules/entities/dist/generated/decode-data-html.js
var htmlDecodeTree = /* @__PURE__ */ decodeBase64("QR08ALkAAgH6AYsDNQR2BO0EPgXZBQEGLAbdBxMISQrvCmQLfQurDKQNLw4fD4YPpA+6D/IPAAAAAAAAAAAAAAAAKhBMEY8TmxUWF2EYLBkxGuAa3RsJHDscWR8YIC8jSCSIJcMl6ie3Ku8rEC0CLjoupS7kLgAIRU1hYmNmZ2xtbm9wcnN0dVQAWgBeAGUAaQBzAHcAfgCBAIQAhwCSAJoAoACsALMAbABpAGcAO4DGAMZAUAA7gCYAJkBjAHUAdABlADuAwQDBQHIiZXZlAAJhAAFpeW0AcgByAGMAO4DCAMJAEGRyAADgNdgE3XIAYQB2AGUAO4DAAMBA8CFoYZFj4SFjcgBhZAAAoFMqAAFncIsAjgBvAG4ABGFmAADgNdg43fAlbHlGdW5jdGlvbgCgYSBpAG4AZwA7gMUAxUAAAWNzpACoAHIAAOA12Jzc6SFnbgCgVCJpAGwAZABlADuAwwDDQG0AbAA7gMQAxEAABGFjZWZvcnN1xQDYANoA7QDxAPYA+QD8AAABY3LJAM8AayNzbGFzaAAAoBYidgHTANUAAKDnKmUAZAAAoAYjeQARZIABY3J0AOAA5QDrAGEidXNlAACgNSLuI291bGxpcwCgLCFhAJJjcgAA4DXYBd1wAGYAAOA12Dnd5SF2ZdhiYwDyAOoAbSJwZXEAAKBOIgAHSE9hY2RlZmhpbG9yc3UXARoBHwE6AVIBVQFiAWQBZgGCAakB6QHtAfIBYwB5ACdkUABZADuAqQCpQIABY3B5ACUBKAE1AfUhdGUGYWmg0iJ0KGFsRGlmZmVyZW50aWFsRAAAoEUhbCJleXMAAKAtIQACYWVpb0EBRAFKAU0B8iFvbgxhZABpAGwAO4DHAMdAcgBjAAhhbiJpbnQAAKAwIm8AdAAKYQABZG5ZAV0BaSJsbGEAuGB0I2VyRG90ALdg8gA5AWkAp2NyImNsZQAAAkRNUFRwAXQBeQF9AW8AdAAAoJkiaSJudXMAAKCWIuwhdXMAoJUiaSJtZXMAAKCXIm8AAAFjc4cBlAFrKndpc2VDb250b3VySW50ZWdyYWwAAKAyImUjQ3VybHkAAAFEUZwBpAFvJXVibGVRdW90ZQAAoB0gdSJvdGUAAKAZIAACbG5wdbABtgHNAdgBbwBuAGWgNyIAoHQqgAFnaXQAvAHBAcUB8iJ1ZW50AKBhIm4AdAAAoC8i7yV1ckludGVncmFsAKAuIgABZnLRAdMBAKACIe8iZHVjdACgECJuLnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbAAAoDMi7yFzcwCgLypjAHIAAOA12J7ccABDoNMiYQBwAACgTSKABURKU1phY2VmaW9zAAsCEgIVAhgCGwIsAjQCOQI9AnMCfwNvoEUh9CJyYWhkAKARKWMAeQACZGMAeQAFZGMAeQAPZIABZ3JzACECJQIoAuchZXIAoCEgcgAAoKEhaAB2AACg5CoAAWF5MAIzAvIhb24OYRRkbAB0oAciYQCUY3IAAOA12AfdAAFhZkECawIAAWNtRQJnAvIjaXRpY2FsAAJBREdUUAJUAl8CYwJjInV0ZQC0YG8AdAFZAloC2WJiJGxlQWN1dGUA3WJyImF2ZQBgYGkibGRlANxi7yFuZACgxCJmJWVyZW50aWFsRAAAoEYhcAR9AgAAAAAAAIECjgIAABoDZgAA4DXYO91EoagAhQKJAm8AdAAAoNwgcSJ1YWwAAKBQIuIhbGUAA0NETFJVVpkCqAK1Au8C/wIRA28AbgB0AG8AdQByAEkAbgB0AGUAZwByAGEA7ADEAW8AdAKvAgAAAACwAqhgbiNBcnJvdwAAoNMhAAFlb7kC0AJmAHQAgAFBUlQAwQLGAs0CciJyb3cAAKDQIekkZ2h0QXJyb3cAoNQhZQDlACsCbgBnAAABTFLWAugC5SFmdAABQVLcAuECciJyb3cAAKD4J+kkZ2h0QXJyb3cAoPon6SRnaHRBcnJvdwCg+SdpImdodAAAAUFU9gL7AnIicm93AACg0iFlAGUAAKCoInAAQQIGAwAAAAALA3Iicm93AACg0SFvJHduQXJyb3cAAKDVIWUlcnRpY2FsQmFyAACgJSJuAAADQUJMUlRhJAM2AzoDWgNxA3oDciJyb3cAAKGTIUJVLAMwA2EAcgAAoBMpcCNBcnJvdwAAoPUhciJldmUAEWPlIWZ00gJDAwAASwMAAFIDaSVnaHRWZWN0b3IAAKBQKWUkZVZlY3RvcgAAoF4p5SJjdG9yQqC9IWEAcgAAoFYpaSJnaHQA1AFiAwAAaQNlJGVWZWN0b3IAAKBfKeUiY3RvckKgwSFhAHIAAKBXKWUAZQBBoKQiciJyb3cAAKCnIXIAcgBvAPcAtAIAAWN0gwOHA3IA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YwAAoN8i4SFycnCgtiEAoD0pgKIqImJjZG9zACsVMBU6FT4VQRVyImNhcAAAoEgqAAFhdTQVNxVwAACgRipwAACgSipvAHQAAKCNInIAAKBFKgDgKiIA/gACYWxydksVURVuFXMVcgByAG2gtyEAoDwpeQCAAWV2dwBYFWUVaRVxAHACXxUAAAAAYxVyAGUA4wAXFXUA4wAZFWUAZQAAoM4iZSJkZ2UAAKDPImUAbgA7gKQApEBlI2Fycm93AAABbHJ7FX8V5SFmdACgtiFpImdodAAAoLchZQDkAG0VAAFjaYsVkRVvAG4AaQBuAPQAkwFuAHQAAKAxImwiY3R5AACgLSOACUFIYWJjZGVmaGlqbG9yc3R1d3oAuBW7Fb8V1RXgFegV+RUKFhUWHxZUFlcWZRbFFtsW7xb7FgUXChdyAPIAtAJhAHIAAKBlKQACZ2xyc8YVyhXOFdAV5yFlcgCgICDlIXRoAKA4IfIA9QxoAHagECAAoKMiawHZFd4VYSJyb3cAAKAPKWEA4wBfAgABYXnkFecV8iFvbg9hNGQAoUYhYW/tFfQVAAFnciEC8RVyAACgyiF0InNlcQAAoHcqgAFnbG0A/xUCFgUWO4CwALBAdABhALRjcCJ0eXYAAKCxKQABaXIOFhIW8yFodACgfykA4DXYId1hAHIAAAFschsWHRYAoMMhAKDCIYACYWVnc3YAKBauAjYWOhY+Fm0AAKHEIm9zLhY0Fm4AZABzoMQi9SFpdACgZiZhIm1tYQDdY2kAbgAAoPIiAKH3AGlvQxZRFmQAZQAAgfcAO29KFksW90BuI3RpbWVzAACgxyJuAPgAUBZjAHkAUmRjAG8CXhYAAAAAYhZyAG4AAKAeI28AcAAAoA0jgAJscHR1dwBuFnEWdRaSFp4W7CFhciRgZgAA4DXYVd0AotkCZW1wc30WhBaJFo0WcQBkoFAibwB0AACgUSJpIm51cwAAoDgi7CF1cwCgFCLxInVhcmUAoKEiYgBsAGUAYgBhAHIAdwBlAGQAZwDlANcAbgCAAWFkaAClFqoWtBZyAHIAbwD3APUMbwB3AG4AYQByAHIAbwB3APMA8xVhI3Jwb29uAAABbHK8FsAWZQBmAPQAHBZpAGcAaAD0AB4WYgHJFs8WawBhAHIAbwD3AJILbwLUFgAAAADYFnIAbgAAoB8jbwBwAACgDCOAAWNvdADhFukW7BYAAXJ55RboFgDgNdi53FVkbAAAoPYp8iFvaxFhAAFkcvMW9xZvAHQAAKDxImkA5qC/JVsSAAFhaP8WAhdyAPIANQNhAPIA1wvhIm5nbGUAoKYpAAFjaQ4XEBd5AF9k5yJyYXJyAKD/JwAJRGFjZGVmZ2xtbm9wcXJzdHV4MRc4F0YXWxcyBF4XaRd5F40XrBe0F78X2RcVGCEYLRg1GEAYAAFEbzUXgRZvAPQA+BUAAWNzPBdCF3UAdABlADuA6QDpQPQhZXIAoG4qAAJhaW95TRdQF1YXWhfyIW9uG2FyAGOgViI7gOoA6kDsIW9uAKBVIk1kbwB0ABdhAAFEcmIXZhdvAHQAAKBSIgDgNdgi3XKhmipuF3QXYQB2AGUAO4DoAOhAZKCWKm8AdAAAoJgqgKGZKmlscwCAF4UXhxfuInRlcnMAoOcjAKATIWSglSpvAHQAAKCXKoABYXBzAJMXlheiF2MAcgATYXQAeQBzogUinxcAAAAAoRdlAHQAAKAFInAAMaADIDMBqRerFwCgBCAAoAUgAAFnc7AXsRdLYXAAAKACIAABZ3C4F7sXbwBuABlhZgAA4DXYVt2AAWFscwDFF8sXzxdyAHOg1SJsAACg4yl1AHMAAKBxKmkAAKG1A2x21RfYF28AbgC1Y/VjAAJjc3V24BfoF/0XEBgAAWlv5BdWF3IAYwAAoFYiaQLuFwAAAADwF+0ADQThIW50AAFnbPUX+Rd0AHIAAKCWKuUhc3MAoJUqgAFhZWkAAxgGGAoYbABzAD1gcwB0AACgXyJ2AESgYSJEAACgeCrwImFyc2wAoOUpAAFEYRkYHRhvAHQAAKBTInIAcgAAoHEpgAFjZGkAJxgqGO0XcgAAoC8hbwD0AIwCAAFhaDEYMhi3YzuA8ADwQAABbXI5GD0YbAA7gOsA60BvAACgrCCAAWNpcABGGEgYSxhsACFgcwD0ACwEAAFlb08YVxhjAHQAYQB0AGkAbwDuABoEbgBlAG4AdABpAGEAbADlADME4Ql1GAAAgRgAAIMYiBgAAAAAoRilGAAAqhgAALsYvhjRGAAA1xgnGWwAbABpAG4AZwBkAG8AdABzAGUA8QBlF3kARGRtImFsZQAAoEAmgAFpbHIAjRiRGJ0Y7CFpZwCgA/tpApcYAAAAAJoYZwAAoAD7aQBnAACgBPsA4DXYI93sIWlnAKAB++whaWcA4GYAagCAAWFsdACvGLIYthh0AACgbSZpAGcAAKAC+24AcwAAoLElbwBmAJJh8AHCGAAAxhhmAADgNdhX3QABYWvJGMwYbADsAGsEdqDUIgCg2SphI3J0aW50AACgDSoAAWFv2hgiGQABY3PeGB8ZsQPnGP0YBRkSGRUZAAAdGbID7xjyGPQY9xj5GAAA+xg7gL0AvUAAoFMhO4C8ALxAAKBVIQCgWSEAoFshswEBGQAAAxkAoFQhAKBWIbQCCxkOGQAAAAAQGTuAvgC+QACgVyEAoFwhNQAAoFghtgEZGQAAGxkAoFohAKBdITgAAKBeIWwAAKBEIHcAbgAAoCIjYwByAADgNdi73IAIRWFiY2RlZmdpamxub3JzdHYARhlKGVoZXhlmGWkZkhmWGZkZnRmgGa0ZxhnLGc8Z4BkjGmygZyIAoIwqgAFjbXAAUBlTGVgZ9SF0ZfVhbQBhAOSgswM6FgCghipyImV2ZQAfYQABaXliGWUZcgBjAB1hM2RvAHQAIWGAoWUibHFzAMYEcBl6GfGhZSLOBAAAdhlsAGEAbgD0AN8EgKF+KmNkbACBGYQZjBljAACgqSpvAHQAb6CAKmyggioAoIQqZeDbIgD+cwAAoJQqcgAA4DXYJN3noGsirATtIWVsAKA3IWMAeQBTZIChdyJFYWoApxmpGasZAKCSKgCgpSoAoKQqAAJFYWVztBm2Gb0ZwhkAoGkicABwoIoq8iFveACgiipxoIgq8aCIKrUZaQBtAACg5yJwAGYAAOA12FjdYQB2AOUAYwIAAWNp0xnWGXIAAKAKIW0AAKFzImVs3BneGQCgjioAoJAqAIM+ADtjZGxxco0E6xn0GfgZ/BkBGgABY2nvGfEZAKCnKnIAAKB6Km8AdAAAoNci0CFhcgCglSl1ImVzdAAAoHwqgAJhZGVscwAKGvQZFhrVBCAa8AEPGgAAFBpwAHIAbwD4AFkZcgAAoHgpcQAAAWxxxAQbGmwAZQBzAPMASRlpAO0A5AQAAWVuJxouGnIjdG5lcXEAAOBpIgD+xQAsGgAFQWFiY2Vma29zeUAaQxpmGmoabRqDGocalhrCGtMacgDyAMwCAAJpbG1yShpOGlAaVBpyAHMA8ABxD2YAvWBpAGwA9AASBQABZHJYGlsaYwB5AEpkAKGUIWN3YBpkGmkAcgAAoEgpAKCtIWEAcgAAoA8h6SFyYyVhgAFhbHIAcxp7Gn8a8iF0c3WgZSZpAHQAAKBlJuwhaXAAoCYg4yFvbgCguSJyAADgNdgl3XMAAAFld4wakRphInJvdwAAoCUpYSJyb3cAAKAmKYACYW1vcHIAnxqjGqcauhq+GnIAcgAAoP8h9CFodACgOyJrAAABbHKsGrMaZSRmdGFycm93AACgqSHpJGdodGFycm93AKCqIWYAAOA12Fnd4iFhcgCgFSCAAWNsdADIGswa0BpyAADgNdi93GEAcwDoAGka8iFvaydhAAFicNca2xr1IWxsAKBDIOghZW4AoBAg4Qr2GgAA/RoAAAgbExsaGwAAIRs7GwAAAAA+G2IbmRuVG6sbAACyG80b0htjAHUAdABlADuA7QDtQAChYyBpeQEbBhtyAGMAO4DuAO5AOGQAAWN4CxsNG3kANWRjAGwAO4ChAKFAAAFmcssCFhsA4DXYJt1yAGEAdgBlADuA7ADsQIChSCFpbm8AJxsyGzYbAAFpbisbLxtuAHQAAKAMKnQAAKAtIuYhaW4AoNwpdABhAACgKSHsIWlnM2GAAWFvcABDG1sbXhuAAWNndABJG0sbWRtyACthgAFlbHAAcQVRG1UbaQBuAOUAyAVhAHIA9AByBWgAMWFmAACgtyJlAGQAtWEAoggiY2ZvdGkbbRt1G3kb4SFyZQCgBSFpAG4AdKAeImkAZQAAoN0pZABvAPQAWxsAoisiY2VscIEbhRuPG5QbYQBsAACguiIAAWdyiRuNG2UAcgDzACMQ4wCCG2EicmhrAACgFyryIW9kAKA8KgACY2dwdJ8boRukG6gbeQBRZG8AbgAvYWYAAOA12FrdYQC5Y3UAZQBzAHQAO4C/AL9AAAFjabUbuRtyAADgNdi+3G4AAKIIIkVkc3bCG8QbyBvQAwCg+SJvAHQAAKD1Inag9CIAoPMiaaBiIOwhZGUpYesB1hsAANkbYwB5AFZkbAA7gO8A70AAA2NmbW9zdeYb7hvyG/Ub+hsFHAABaXnqG+0bcgBjADVhOWRyAADgNdgn3eEhdGg3YnAAZgAA4DXYW93jAf8bAAADHHIAAOA12L/c8iFjeVhk6yFjeVRkAARhY2ZnaGpvcxUcGhwiHCYcKhwtHDAcNRzwIXBhdqC6A/BjAAFleR4cIRzkIWls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ZmdobG1vcHJzdHV3CiwNLBEsHSwnLDEsQCxLLFIsYix6LIQsjyzLLOgs7Sz/LAotcgDyAAkDYQByAACgYykAAWNyFSwbLHUAdABlADuA+gD6QPIACQ1yAOMBIywAACUseQBeZHYAZQBtYQABaXkrLDAscgBjADuA+wD7QENkgAFhYmgANyw6LD0scgDyANEO7CFhY3FhYQDyAOAOAAFpckQsSCzzIWh0AKB+KQDgNdgy3XIAYQB2AGUAO4D5APlAYQFWLF8scgAAAWxyWixcLACgvyEAoL4hbABrAACggCUAAWN0Zix2LG8CbCwAAAAAcyxyAG4AZaAcI3IAAKAcI28AcAAAoA8jcgBpAACg+CUAAWFsfiyBLGMAcgBrYTuAqACoQAABZ3CILIssbwBuAHNhZgAA4DXYZt0AA2FkaGxzdZksniynLLgsuyzFLHIAcgBvAPcACQ1vAHcAbgBhAHIAcgBvAPcA2A5hI3Jwb29uAAABbHKvLLMsZQBmAPQAWyxpAGcAaAD0AF0sdQDzAKYOaQAAocUDaGzBLMIs0mNvAG4AxWPwI2Fycm93cwCgyCGAAWNpdADRLOEs5CxvAtcsAAAAAN4scgBuAGWgHSNyAACgHSNvAHAAAKAOI24AZwBvYXIAaQAAoPklYwByAADgNdjK3IABZGlyAPMs9yz6LG8AdAAAoPAi7CFkZWlhaQBmoLUlAKC0JQABYW0DLQYtcgDyAMosbAA7gPwA/EDhIm5nbGUAoKcpgAdBQkRhY2RlZmxub3Byc3oAJy0qLTAtNC2bLZ0toS2/LcMtxy3TLdgt3C3gLfwtcgDyABADYQByAHag6CoAoOkqYQBzAOgA/gIAAW5yOC08LechcnQAoJwpgANla25wcnN0AJkpSC1NLVQtXi1iLYItYQBwAHAA4QAaHG8AdABoAGkAbgDnAKEXgAFoaXIAoSmzJFotbwBwAPQAdCVooJUh7wD4JgABaXVmLWotZwBtAOEAuygAAWJwbi14LXMjZXRuZXEAceCKIgD+AODLKgD+cyNldG5lcQBx4IsiAP4A4MwqAP4AAWhyhi2KLWUAdADhABIraSNhbmdsZQAAAWxyki2WLeUhZnQAoLIiaSJnaHQAAKCzInkAMmThIXNoAKCiIoABZWxyAKcttC24LWKiKCKuLQAAAACyLWEAcgAAoLsicQAAoFoi7CFpcACg7iIAAWJ0vC1eD2EA8gBfD3IAAOA12DPddAByAOkAlS1zAHUAAAFicM0t0C0A4IIi0iAA4IMi0iBwAGYAAOA12GfdcgBvAPAAWQt0AHIA6QCaLQABY3XkLegtcgAA4DXYy9wAAWJw7C30LW4AAAFFZXUt8S0A4IoiAP5uAAABRWV/LfktAOCLIgD+6SJnemFnAKCaKYADY2Vmb3BycwANLhAuJS4pLiMuLi40LukhcmN1YQABZGkULiEuAAFiZxguHC5hAHIAAKBfKmUAcaAnIgCgWSLlIXJwAKAYIXIAAOA12DTdcABmAADgNdho3WWgQCJhAHQA6ABqD2MAcgAA4DXYzNzjCuQRUC4AAFQuAABYLmIuAAAAAGMubS5wLnQuAAAAAIguki4AAJouJxIqEnQAcgDpAB0ScgAA4DXYNd0AAUFhWy5eLnIA8gDnAnIA8gCTB75jAAFBYWYuaS5yAPIA4AJyAPIAjAdhAPAAeh5pAHMAAKD7IoABZHB0APgReS6DLgABZmx9LoAuAOA12GnddQDzAP8RaQBtAOUABBIAAUFhiy6OLnIA8gDuAnIA8gCaBwABY3GVLgoScgAA4DXYzdwAAXB0nS6hLmwAdQDzACUScgDpACASAARhY2VmaW9zdbEuvC7ELsguzC7PLtQu2S5jAAABdXm2LrsudABlADuA/QD9QE9kAAFpecAuwy5yAGMAd2FLZG4AO4ClAKVAcgAA4DXYNt1jAHkAV2RwAGYAAOA12GrdYwByAADgNdjO3AABY23dLt8ueQBOZGwAO4D/AP9AAAVhY2RlZmhpb3N38y73Lv8uAi8MLxAvEy8YLx0vIi9jInV0ZQB6YQABYXn7Lv4u8iFvbn5hN2RvAHQAfGEAAWV0Bi8KL3QAcgDmAB8QYQC2Y3IAAOA12DfdYwB5ADZk5yJyYXJyAKDdIXAAZgAA4DXYa91jAHIAAOA12M/cAAFqbiYvKC8AoA0gagAAoAwg");

// node_modules/entities/dist/internal/bin-trie-flags.js
var BinTrieFlags;
(function(BinTrieFlags2) {
  BinTrieFlags2[BinTrieFlags2["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
  BinTrieFlags2[BinTrieFlags2["FLAG13"] = 8192] = "FLAG13";
  BinTrieFlags2[BinTrieFlags2["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
  BinTrieFlags2[BinTrieFlags2["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));

// node_modules/entities/dist/decode.js
var CharCodes;
(function(CharCodes2) {
  CharCodes2[CharCodes2["NUM"] = 35] = "NUM";
  CharCodes2[CharCodes2["SEMI"] = 59] = "SEMI";
  CharCodes2[CharCodes2["EQUALS"] = 61] = "EQUALS";
  CharCodes2[CharCodes2["ZERO"] = 48] = "ZERO";
  CharCodes2[CharCodes2["NINE"] = 57] = "NINE";
  CharCodes2[CharCodes2["LOWER_A"] = 97] = "LOWER_A";
  CharCodes2[CharCodes2["LOWER_F"] = 102] = "LOWER_F";
  CharCodes2[CharCodes2["LOWER_X"] = 120] = "LOWER_X";
  CharCodes2[CharCodes2["LOWER_Z"] = 122] = "LOWER_Z";
  CharCodes2[CharCodes2["UPPER_A"] = 65] = "UPPER_A";
  CharCodes2[CharCodes2["UPPER_F"] = 70] = "UPPER_F";
  CharCodes2[CharCodes2["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes || (CharCodes = {}));
var TO_LOWER_BIT = 32;
function isNumber(code) {
  return code >= CharCodes.ZERO && code <= CharCodes.NINE;
}
function isHexadecimalCharacter(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_F || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
  return code >= CharCodes.UPPER_A && code <= CharCodes.UPPER_Z || code >= CharCodes.LOWER_A && code <= CharCodes.LOWER_Z || isNumber(code);
}
function isEntityInAttributeInvalidEnd(code) {
  return code === CharCodes.EQUALS || isAsciiAlphaNumeric(code);
}
var EntityDecoderState;
(function(EntityDecoderState2) {
  EntityDecoderState2[EntityDecoderState2["EntityStart"] = 0] = "EntityStart";
  EntityDecoderState2[EntityDecoderState2["NumericStart"] = 1] = "NumericStart";
  EntityDecoderState2[EntityDecoderState2["NumericDecimal"] = 2] = "NumericDecimal";
  EntityDecoderState2[EntityDecoderState2["NumericHex"] = 3] = "NumericHex";
  EntityDecoderState2[EntityDecoderState2["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode2) {
  DecodingMode2[DecodingMode2["Legacy"] = 0] = "Legacy";
  DecodingMode2[DecodingMode2["Strict"] = 1] = "Strict";
  DecodingMode2[DecodingMode2["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
var EntityDecoder = class {
  decodeTree;
  emitCodePoint;
  errors;
  constructor(decodeTree, emitCodePoint, errors) {
    this.decodeTree = decodeTree;
    this.emitCodePoint = emitCodePoint;
    this.errors = errors;
  }
  /** The current state of the decoder. */
  state = EntityDecoderState.EntityStart;
  /** Characters that were consumed while parsing an entity. */
  consumed = 1;
  /**
   * The result of the entity.
   *
   * Either the result index of a numeric entity, or the codepoint of a
   * numeric entity.
   */
  result = 0;
  /** The current index in the decode tree. */
  treeIndex = 0;
  /** The number of characters that were consumed in excess. */
  excess = 1;
  /** The mode in which the decoder is operating. */
  decodeMode = DecodingMode.Strict;
  /** The number of characters that have been consumed in the current run. */
  runConsumed = 0;
  /**
   * Resets the instance to make it reusable.
   * @param decodeMode Entity decoding mode to use.
   */
  startEntity(decodeMode) {
    this.decodeMode = decodeMode;
    this.state = EntityDecoderState.EntityStart;
    this.result = 0;
    this.treeIndex = 0;
    this.excess = 1;
    this.consumed = 1;
    this.runConsumed = 0;
  }
  /**
   * Write an entity to the decoder. This can be called multiple times with partial entities.
   * If the entity is incomplete, the decoder will return -1.
   *
   * Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
   * entity is incomplete, and resume when the next string is written.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  write(input, offset) {
    switch (this.state) {
      case EntityDecoderState.EntityStart: {
        if (input.charCodeAt(offset) === CharCodes.NUM) {
          this.state = EntityDecoderState.NumericStart;
          this.consumed += 1;
          return this.stateNumericStart(input, offset + 1);
        }
        this.state = EntityDecoderState.NamedEntity;
        return this.stateNamedEntity(input, offset);
      }
      case EntityDecoderState.NumericStart: {
        return this.stateNumericStart(input, offset);
      }
      case EntityDecoderState.NumericDecimal: {
        return this.stateNumericDecimal(input, offset);
      }
      case EntityDecoderState.NumericHex: {
        return this.stateNumericHex(input, offset);
      }
      case EntityDecoderState.NamedEntity: {
        return this.stateNamedEntity(input, offset);
      }
    }
  }
  /**
   * Switches between the numeric decimal and hexadecimal states.
   *
   * Equivalent to the `Numeric character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericStart(input, offset) {
    if (offset >= input.length) {
      return -1;
    }
    if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes.LOWER_X) {
      this.state = EntityDecoderState.NumericHex;
      this.consumed += 1;
      return this.stateNumericHex(input, offset + 1);
    }
    this.state = EntityDecoderState.NumericDecimal;
    return this.stateNumericDecimal(input, offset);
  }
  /**
   * Parses a hexadecimal numeric entity.
   *
   * Equivalent to the `Hexademical character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericHex(input, offset) {
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char) || isHexadecimalCharacter(char)) {
        const digit = char <= CharCodes.NINE ? char - CharCodes.ZERO : (char | TO_LOWER_BIT) - CharCodes.LOWER_A + 10;
        this.result = this.result * 16 + digit;
        this.consumed++;
        offset++;
      } else {
        return this.emitNumericEntity(char, 3);
      }
    }
    return -1;
  }
  /**
   * Parses a decimal numeric entity.
   *
   * Equivalent to the `Decimal character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNumericDecimal(input, offset) {
    while (offset < input.length) {
      const char = input.charCodeAt(offset);
      if (isNumber(char)) {
        this.result = this.result * 10 + (char - CharCodes.ZERO);
        this.consumed++;
        offset++;
      } else {
        return this.emitNumericEntity(char, 2);
      }
    }
    return -1;
  }
  /**
   * Validate and emit a numeric entity.
   *
   * Implements the logic from the `Hexademical character reference start
   * state` and `Numeric character reference end state` in the HTML spec.
   * @param lastCp The last code point of the entity. Used to see if the
   *               entity was terminated with a semicolon.
   * @param expectedLength The minimum number of characters that should be
   *                       consumed. Used to validate that at least one digit
   *                       was consumed.
   * @returns The number of characters that were consumed.
   */
  emitNumericEntity(lastCp, expectedLength) {
    if (this.consumed <= expectedLength) {
      this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
      return 0;
    }
    if (lastCp === CharCodes.SEMI) {
      this.consumed += 1;
    } else if (this.decodeMode === DecodingMode.Strict) {
      return 0;
    }
    this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
    if (this.errors) {
      if (lastCp !== CharCodes.SEMI) {
        this.errors.missingSemicolonAfterCharacterReference();
      }
      this.errors.validateNumericCharacterReference(this.result);
    }
    return this.consumed;
  }
  /**
   * Parses a named entity.
   *
   * Equivalent to the `Named character reference state` in the HTML spec.
   * @param input The string containing the entity (or a continuation of the entity).
   * @param offset The current offset.
   * @returns The number of characters that were consumed, or -1 if the entity is incomplete.
   */
  stateNamedEntity(input, offset) {
    const { decodeTree } = this;
    let current = decodeTree[this.treeIndex];
    let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
    while (offset < input.length) {
      if (valueLength === 0 && (current & BinTrieFlags.FLAG13) !== 0) {
        const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
        if (this.runConsumed === 0) {
          const firstChar = current & BinTrieFlags.JUMP_TABLE;
          if (input.charCodeAt(offset) !== firstChar) {
            return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
          }
          offset++;
          this.excess++;
          this.runConsumed++;
        }
        while (this.runConsumed < runLength) {
          if (offset >= input.length) {
            return -1;
          }
          const charIndexInPacked = this.runConsumed - 1;
          const packedWord = decodeTree[this.treeIndex + 1 + (charIndexInPacked >> 1)];
          const expectedChar = charIndexInPacked % 2 === 0 ? packedWord & 255 : packedWord >> 8 & 255;
          if (input.charCodeAt(offset) !== expectedChar) {
            this.runConsumed = 0;
            return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
          }
          offset++;
          this.excess++;
          this.runConsumed++;
        }
        this.runConsumed = 0;
        this.treeIndex += 1 + (runLength >> 1);
        current = decodeTree[this.treeIndex];
        valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      }
      if (offset >= input.length)
        break;
      const char = input.charCodeAt(offset);
      if (char === CharCodes.SEMI && valueLength !== 0 && (current & BinTrieFlags.FLAG13) !== 0) {
        return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
      }
      this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
      if (this.treeIndex < 0) {
        return this.result === 0 || // If we are parsing an attribute
        this.decodeMode === DecodingMode.Attribute && // We shouldn't have consumed any characters after the entity,
        (valueLength === 0 || // And there should be no invalid characters.
        isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
      }
      current = decodeTree[this.treeIndex];
      valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
      if (valueLength !== 0) {
        if (char === CharCodes.SEMI) {
          return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
        }
        if (this.decodeMode !== DecodingMode.Strict && (current & BinTrieFlags.FLAG13) === 0) {
          this.result = this.treeIndex;
          this.consumed += this.excess;
          this.excess = 0;
        }
      }
      offset++;
      this.excess++;
    }
    return -1;
  }
  /**
   * Emit a named entity that was not terminated with a semicolon.
   * @returns The number of characters consumed.
   */
  emitNotTerminatedNamedEntity() {
    const { result, decodeTree } = this;
    const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
    this.emitNamedEntityData(result, valueLength, this.consumed);
    this.errors?.missingSemicolonAfterCharacterReference();
    return this.consumed;
  }
  /**
   * Emit a named entity.
   * @param result The index of the entity in the decode tree.
   * @param valueLength The number of bytes in the entity.
   * @param consumed The number of characters consumed.
   * @returns The number of characters consumed.
   */
  emitNamedEntityData(result, valueLength, consumed) {
    const { decodeTree } = this;
    this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~(BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13) : decodeTree[result + 1], consumed);
    if (valueLength === 3) {
      this.emitCodePoint(decodeTree[result + 2], consumed);
    }
    return consumed;
  }
  /**
   * Signal to the parser that the end of the input was reached.
   *
   * Remaining data will be emitted and relevant errors will be produced.
   * @returns The number of characters consumed.
   */
  end() {
    switch (this.state) {
      case EntityDecoderState.NamedEntity: {
        return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
      }
      // Otherwise, emit a numeric entity if we have one.
      case EntityDecoderState.NumericDecimal: {
        return this.emitNumericEntity(0, 2);
      }
      case EntityDecoderState.NumericHex: {
        return this.emitNumericEntity(0, 3);
      }
      case EntityDecoderState.NumericStart: {
        this.errors?.absenceOfDigitsInNumericCharacterReference(this.consumed);
        return 0;
      }
      case EntityDecoderState.EntityStart: {
        return 0;
      }
    }
  }
};
function getDecoder(decodeTree) {
  let returnValue = "";
  const decoder = new EntityDecoder(decodeTree, (data) => returnValue += String.fromCodePoint(data));
  return function decodeWithTrie(input, decodeMode) {
    let lastIndex = 0;
    let offset = 0;
    while ((offset = input.indexOf("&", offset)) >= 0) {
      returnValue += input.slice(lastIndex, offset);
      decoder.startEntity(decodeMode);
      const length = decoder.write(
        input,
        // Skip the "&"
        offset + 1
      );
      if (length < 0) {
        lastIndex = offset + decoder.end();
        break;
      }
      lastIndex = offset + length;
      offset = length === 0 ? lastIndex + 1 : lastIndex;
    }
    const result = returnValue + input.slice(lastIndex);
    returnValue = "";
    return result;
  };
}
function determineBranch(decodeTree, current, nodeIndex, char) {
  const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
  const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
  if (branchCount === 0) {
    return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
  }
  if (jumpOffset) {
    const value = char - jumpOffset;
    return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
  }
  const packedKeySlots = branchCount + 1 >> 1;
  let lo = 0;
  let hi = branchCount - 1;
  while (lo <= hi) {
    const mid = lo + hi >>> 1;
    const slot = mid >> 1;
    const packed = decodeTree[nodeIndex + slot];
    const midKey = packed >> (mid & 1) * 8 & 255;
    if (midKey < char) {
      lo = mid + 1;
    } else if (midKey > char) {
      hi = mid - 1;
    } else {
      return decodeTree[nodeIndex + packedKeySlots + mid];
    }
  }
  return -1;
}
var htmlDecoder = /* @__PURE__ */ getDecoder(htmlDecodeTree);
function decodeHTML(htmlString, mode = DecodingMode.Legacy) {
  return htmlDecoder(htmlString, mode);
}

// node_modules/entities/dist/index.js
var EntityLevel;
(function(EntityLevel2) {
  EntityLevel2[EntityLevel2["XML"] = 0] = "XML";
  EntityLevel2[EntityLevel2["HTML"] = 1] = "HTML";
})(EntityLevel || (EntityLevel = {}));
var EncodingMode;
(function(EncodingMode2) {
  EncodingMode2[EncodingMode2["UTF8"] = 0] = "UTF8";
  EncodingMode2[EncodingMode2["ASCII"] = 1] = "ASCII";
  EncodingMode2[EncodingMode2["Extensive"] = 2] = "Extensive";
  EncodingMode2[EncodingMode2["Attribute"] = 3] = "Attribute";
  EncodingMode2[EncodingMode2["Text"] = 4] = "Text";
})(EncodingMode || (EncodingMode = {}));

// dist/generated/playlist-write-semantics.js
var object = (value) => value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
var array = (value) => Array.isArray(value) ? value : [];
function playlistNeedsTimezone(value) {
  return array(object(value).pages).some((rawPage) => {
    const visibility = object(object(rawPage).visibility);
    return ["from", "until", "windows"].some((key) => Object.hasOwn(visibility, key));
  });
}
function httpsWithoutCredentials(value) {
  if (typeof value !== "string")
    return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname !== "" && !url.username && !url.password && !/^https:\/\/[^/?#]*@/i.test(value);
  } catch {
    return false;
  }
}
function decodeAttributeEntities(text) {
  return decodeHTML(text);
}
function embeddedSource(value) {
  if (typeof value !== "string" || value.length > 4096 || !/^\s*<iframe\b/i.test(value))
    return value;
  const match = /<iframe\b[^>]*?\ssrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>"']+))/is.exec(value);
  const source = match === null ? void 0 : match[1] ?? match[2] ?? match[3];
  if (source === void 0)
    return value;
  return decodeAttributeEntities(source).trim();
}
var SCREEN_TOKEN = /\{screen\.(?:id|name|timezone|field\.[a-z0-9_]{1,32}|location\.(?:lat|lon|name|address))\}/g;
var hasScreenToken = (value) => value.includes("{screen.") && new RegExp(SCREEN_TOKEN.source).test(value);
var screenTokenStandIn = (value) => value.replace(SCREEN_TOKEN, "x");
var YOUTUBE_HOSTS = /* @__PURE__ */ new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
var DOCUMENT_HOSTS = /* @__PURE__ */ new Set(["docs.google.com", "onedrive.live.com", "view.officeapps.live.com", "1drv.ms"]);
function screenTemplateRefusal(source) {
  const origin = /^https?:\/\/[^/?#]*/i.exec(source)?.[0];
  if (origin === void 0)
    return "must start with http:// or https:// to carry {screen.\u2026} tokens";
  if (hasScreenToken(origin))
    return "{screen.\u2026} tokens may stand only in the path, query or fragment, not in the scheme, credentials, host or port";
  if (source.includes("\\"))
    return "cannot carry {screen.\u2026} tokens together with a backslash";
  let host;
  try {
    host = new URL(screenTokenStandIn(source)).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return void 0;
  }
  if (YOUTUBE_HOSTS.has(host))
    return "cannot carry {screen.\u2026} tokens: a YouTube link is rewritten to its embed form";
  if (DOCUMENT_HOSTS.has(host) || /^[a-z0-9-]+\.sharepoint\.com$/.test(host) || host.startsWith("doc.apps."))
    return "cannot carry {screen.\u2026} tokens: a Google or Microsoft document link is rebuilt for the screen";
  if (/^bi-[0-9a-f]{20}\.apps\./.test(host))
    return "cannot carry {screen.\u2026} tokens: a BI view's address carries the screen's embed ticket";
  return void 0;
}
function signageUrl(value, protocols) {
  if (typeof value !== "string" || value.length > 2048)
    return false;
  try {
    const url = new URL(value);
    return protocols.includes(url.protocol) && url.hostname !== "";
  } catch {
    return false;
  }
}
var IPV4 = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
function ipv6Issue(address) {
  let canonical;
  try {
    canonical = new URL("http://[".concat(address, "]/")).hostname;
  } catch {
    return "host is not a valid IPv6 address";
  }
  return canonical.startsWith("[::ffff:") ? "host must not be an IPv4-mapped IPv6 address: write the IPv4 address" : void 0;
}
function navigationHostIssue(host) {
  if (host === "*" || host.startsWith("["))
    return void 0;
  const wildcard = host.startsWith("*.");
  const name = (wildcard ? host.slice(2) : host).toLowerCase();
  if (name.includes("*"))
    return "host may use * only alone or as a leading *. (as in *.example.com)";
  if (name === "")
    return "host is required";
  if (name.length > 253)
    return "host must be at most 253 characters";
  const labels = name.split(".");
  for (const label of labels) {
    if (label === "")
      return "host has an empty label (a leading, trailing or doubled dot)";
    if (label.length > 63)
      return "host labels must be at most 63 characters";
    if (!/^[a-z0-9-]+$/.test(label))
      return "host may contain only letters, digits, hyphens and dots";
  }
  if (/^\d+$/.test(labels[labels.length - 1])) {
    if (!IPV4.test(name))
      return "host must be a name or an IPv4 address written as four decimal parts (a.b.c.d)";
    if (wildcard)
      return "a wildcard needs a domain name, not an IP address";
  }
  return void 0;
}
function navigationPathIssue(path) {
  if (path === "" || path === "/*")
    return void 0;
  if (path.endsWith("/*"))
    path = path.slice(0, -1);
  if (path.includes("*"))
    return "path may use * only as a final /*";
  for (let index = 0; index < path.length; index++) {
    const char = path[index];
    if (char === "%") {
      if (!/^[0-9a-fA-F]{2}$/.test(path.slice(index + 1, index + 3)))
        return "path has a % that is not a %XX escape";
      index += 2;
    } else if (!/^[A-Za-z0-9\-._~!$&()+=:@/]$/.test(char)) {
      return "path may contain only letters, digits, - . _ ~ ! $ & ( ) + = : @ / and %XX escapes";
    }
  }
  return void 0;
}
function navigationEntryIssue(entry) {
  if (entry === "")
    return "must not be empty";
  if (entry.length > 2048)
    return "must be at most 2048 characters";
  for (const char of entry) {
    const code = char.codePointAt(0);
    if (code > 127)
      return "must be ASCII: write a host in punycode (xn--) and a path percent-encoded";
    if (code <= 32 || code === 127)
      return "must not contain spaces or control characters";
    if (char === "?" || char === "#")
      return "must not have a query or a fragment: they never count";
    if (char === ";" || char === "," || char === "'" || char === '"')
      return "must not contain ; , ' or \": they end a CSP source";
  }
  let rest = entry;
  const schemeEnd = rest.indexOf("://");
  if (schemeEnd >= 0 && !rest.slice(0, schemeEnd).includes("/")) {
    const scheme = rest.slice(0, schemeEnd).toLowerCase();
    if (scheme !== "http" && scheme !== "https")
      return "scheme must be http or https";
    rest = rest.slice(schemeEnd + 3);
  }
  const slash = rest.indexOf("/");
  const authority = slash >= 0 ? rest.slice(0, slash) : rest;
  const path = slash >= 0 ? rest.slice(slash) : "";
  if (authority.includes("@"))
    return "must not include credentials (user:pass@)";
  let host, port;
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]");
    if (end < 0)
      return "an IPv6 host needs its closing ]";
    const issue = ipv6Issue(authority.slice(1, end));
    if (issue !== void 0)
      return issue;
    host = "[";
    const after = authority.slice(end + 1);
    if (after.startsWith(":"))
      port = after.slice(1);
    else if (after !== "")
      return "an IPv6 host may be followed only by :port or a path";
  } else {
    const colon = authority.indexOf(":");
    host = colon < 0 ? authority : authority.slice(0, colon);
    port = colon < 0 ? void 0 : authority.slice(colon + 1);
    if (port?.includes(":"))
      return "an IPv6 host must be written in brackets, as [::1]";
  }
  const hostIssue = navigationHostIssue(host);
  if (hostIssue !== void 0)
    return hostIssue;
  if (port !== void 0 && port !== "*" && !(/^\d+$/.test(port) && Number(port) >= 1 && Number(port) <= 65535))
    return "port must be 1 to 65535 or *";
  return navigationPathIssue(path);
}
function impliedStreamProtocol(value) {
  const scheme = typeof value === "string" ? /^([a-z][a-z0-9+.-]*):\/\//i.exec(value)?.[1]?.toLowerCase() : void 0;
  return scheme === "https" ? "hls" : scheme === "rtsp" || scheme === "rtsps" ? "rtsp" : void 0;
}
function validCivil(value) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!parts)
    return false;
  const [year, month, day, hour, minute] = parts.slice(1).map(Number);
  const date = /* @__PURE__ */ new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(hour, minute, 0, 0);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getUTCHours() === hour && date.getUTCMinutes() === minute;
}
var MAX_DISPLAYS = 12;
function readFormat(value) {
  const { displays, arrangement, orientation, columns } = object(value);
  if (typeof displays !== "number" || !Number.isInteger(displays) || displays < 2 || displays > MAX_DISPLAYS)
    return {};
  if (orientation !== "landscape" && orientation !== "portrait")
    return {};
  if (arrangement === "row" || arrangement === "column") {
    return columns === void 0 ? { format: { displays, arrangement, orientation, columns: arrangement === "row" ? displays : 1 } } : { columnsReason: "is only for arrangement grid" };
  }
  if (arrangement !== "grid")
    return {};
  if (columns === void 0)
    return { columnsReason: "is required for arrangement grid: the displays per row" };
  if (typeof columns !== "number" || !Number.isInteger(columns) || columns < 2 || displays % columns !== 0 || displays / columns < 2) {
    return { columnsReason: "must be an integer of at least 2 that divides displays into at least 2 rows" };
  }
  return { format: { displays, arrangement, orientation, columns } };
}
function readRegion(value) {
  const { region, orientation } = object(value);
  if (region !== "header" && region !== "footer" && region !== "side")
    return void 0;
  if (orientation !== "landscape" && orientation !== "portrait")
    return void 0;
  return { region, orientation };
}
var stripCanvasReason = (region) => region === "side" ? "a side strip's canvas must be taller than wide, with a height at least twice its width" : "a ".concat(region, " strip's canvas must be wider than tall, with a width at least twice its height");
var describeFormat = (format) => "".concat(format.displays, " ").concat(format.orientation, " displays in ").concat(format.arrangement === "grid" ? "a ".concat(format.columns, "-column grid") : "a ".concat(format.arrangement));
var tileOf = (format) => format.orientation === "portrait" ? [1080, 1920] : [1920, 1080];
function canvasOf(format) {
  const [width, height] = tileOf(format);
  return [width * format.columns, height * (format.displays / format.columns)];
}
function spanOf(format, frame) {
  const columns = frame.map((display) => (display - 1) % format.columns), rows = frame.map((display) => Math.floor((display - 1) / format.columns));
  return { left: Math.min(...columns), right: Math.max(...columns), top: Math.min(...rows), bottom: Math.max(...rows) };
}
function frameRect(format, frame) {
  const [width, height] = tileOf(format), { left, right, top, bottom } = spanOf(format, frame);
  return { x: left * width, y: top * height, width: (right - left + 1) * width, height: (bottom - top + 1) * height };
}
function fillsRectangle(format, frame) {
  const { left, right, top, bottom } = spanOf(format, frame);
  return (right - left + 1) * (bottom - top + 1) === frame.length;
}
var DISPLAYS_REASON = "must be ascending display numbers that fill a rectangle of the wall, such as [2] or [1, 2]";
function readDisplays(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_DISPLAYS)
    return void 0;
  let previous = 0;
  for (const display of value) {
    if (typeof display !== "number" || !Number.isInteger(display) || display < 1 || display > MAX_DISPLAYS || display <= previous)
      return void 0;
    previous = display;
  }
  return value;
}
var framesShare = (a, b) => a.some((display) => b.includes(display));
var sameNumber = (a, b) => typeof a === "number" && Math.abs(a - b) < 1e-6;
var LAYOUTS = ["full", "free", "center", "wide", "header", "footer", "corner", "chip", "strip"];
var CORNERS = ["top-left", "top-right", "bottom-left", "bottom-right"];
var EDGES = ["top", "bottom", "left", "right"];
var RESERVED_LAUNCH_PARAMS = ["ticket", "policy"];
function launchParams(value, path, fail) {
  if (value === null || typeof value !== "object" || Array.isArray(value))
    return void 0;
  const params = {};
  for (const [name, item] of Object.entries(value)) {
    if (RESERVED_LAUNCH_PARAMS.includes(name))
      fail("".concat(path, "/").concat(name), "is set by the launch URL and cannot be a parameter");
    else if (typeof item === "string" && new RegExp("\\p{Cc}", "u").test(item))
      fail("".concat(path, "/").concat(name), "must be text without control characters");
    if (typeof item === "string")
      params[name] = item;
  }
  const length = launchQueryLength(Object.fromEntries(Object.entries(params).map(([name, item]) => [name, screenTokenStandIn(item)])));
  if (length > MAX_LAUNCH_QUERY)
    fail(path, "must encode to at most ".concat(MAX_LAUNCH_QUERY, " characters in the launch URL, not ").concat(length));
  return params;
}
var MAX_LAUNCH_QUERY = 4096;
var textEncoder = new TextEncoder();
function launchQueryLength(params) {
  let length = 0;
  for (const [name, value] of Object.entries(params)) {
    length += 2 + name.length;
    for (const byte of textEncoder.encode(value)) {
      const unreserved = byte >= 97 && byte <= 122 || byte >= 65 && byte <= 90 || byte >= 48 && byte <= 57 || byte === 45 || byte === 46 || byte === 95 || byte === 126;
      length += unreserved ? 1 : 3;
    }
  }
  return length;
}
function validatePlaylistWriteSemantics(value) {
  const issues = [];
  const fail = (path, message) => {
    issues.push({ path, message });
  };
  const playlist = object(value);
  const pages = array(playlist.pages);
  const { format, columnsReason } = readFormat(playlist.format);
  if (columnsReason !== void 0)
    fail("/format/columns", columnsReason);
  const region = readRegion(playlist.format);
  if (region !== void 0 && playlist.audio !== void 0 && playlist.audio !== null)
    fail("/audio", "strips have no soundtrack: a region playlist cannot carry audio");
  let stripCanvas;
  if (typeof playlist.name === "string" && !playlist.name.trim())
    fail("/name", "must not be blank");
  const pageIds = /* @__PURE__ */ new Set();
  const releaseParams = /* @__PURE__ */ new Map();
  let unscheduled = 0;
  for (const [index, raw] of pages.entries()) {
    const page = object(raw), path = "/pages/".concat(index);
    if (pageIds.has(page.id))
      fail("".concat(path, "/id"), "must be unique within the playlist");
    pageIds.add(page.id);
    if (region !== void 0) {
      if (page.type === "adslot")
        fail(path, "strips show images and cards: a region playlist has no ad slot");
      else {
        const canvas = object(page.canvas), { width, height } = canvas;
        if (typeof width === "number" && typeof height === "number") {
          const along = region.region === "side" ? height : width, across = region.region === "side" ? width : height;
          if (stripCanvas === void 0) {
            stripCanvas = { width, height };
            if (!(across > 0 && along >= 2 * across))
              fail("".concat(path, "/canvas"), stripCanvasReason(region.region));
          } else if (stripCanvas.width !== width || stripCanvas.height !== height) {
            fail("".concat(path, "/canvas"), "must be ".concat(String(stripCanvas.width), " x ").concat(String(stripCanvas.height), ", the canvas of the first page: every page of a region playlist has the same canvas"));
          }
        }
        for (const [primitiveIndex, primitive] of array(page.primitives).entries()) {
          const kind = object(primitive).primitive;
          if (typeof kind === "string" && kind !== "image" && kind !== "card")
            fail("".concat(path, "/primitives/").concat(primitiveIndex, "/primitive"), "strips show images and cards: a region playlist holds image and card primitives only");
        }
      }
    }
    if (format !== void 0 && page.type !== "adslot") {
      const canvas = object(page.canvas), [wantWidth, wantHeight] = canvasOf(format);
      if (typeof canvas.width === "number" && typeof canvas.height === "number" && (canvas.width !== wantWidth || canvas.height !== wantHeight)) {
        fail("".concat(path, "/canvas"), "must be ".concat(wantWidth, " x ").concat(wantHeight, " canvas units, the canvas of ").concat(describeFormat(format)));
      }
    }
    if (!Object.hasOwn(page, "visibility"))
      unscheduled++;
    else {
      const visibility = object(page.visibility);
      for (const key of ["from", "until"]) {
        if (typeof visibility[key] === "string" && !validCivil(visibility[key]))
          fail("".concat(path, "/visibility/").concat(key), "must be a valid civil date and time");
      }
      if (typeof visibility.from === "string" && typeof visibility.until === "string" && visibility.from >= visibility.until)
        fail("".concat(path, "/visibility/until"), "must be later than from");
      if (visibility.enabled === true && visibility.from === void 0 && visibility.until === void 0 && visibility.windows === void 0 && visibility.data === void 0)
        fail("".concat(path, "/visibility"), "an always-visible page must omit visibility");
      for (const [windowIndex, rawWindow] of array(visibility.windows).entries()) {
        const window = object(rawWindow);
        if (Object.hasOwn(window, "start") !== Object.hasOwn(window, "end"))
          fail("".concat(path, "/visibility/windows/").concat(windowIndex), "start and end must both be present or both absent");
      }
    }
    const background = object(object(page.canvas).background);
    if (background.type === "linear") {
      const stops = array(background.stops).map(object);
      if (stops[0]?.at !== 0 || stops.at(-1)?.at !== 1)
        fail("".concat(path, "/canvas/background/stops"), "must start at 0 and end at 1");
      for (let i = 1; i < stops.length; i++)
        if (Number(stops[i]?.at) <= Number(stops[i - 1]?.at))
          fail("".concat(path, "/canvas/background/stops/").concat(i, "/at"), "must be strictly increasing");
    }
    const transition = object(page.transition);
    const stinger = object(transition.stinger);
    if (transition.type === "stinger" && typeof stinger.hang_ms === "number" && typeof transition.duration_ms === "number" && stinger.hang_ms * 5 > transition.duration_ms * 3) {
      fail("".concat(path, "/transition/stinger/hang_ms"), "must be at most 60% of duration_ms");
    }
    const mode = object(page.advance).mode;
    const primitives = array(page.primitives).map(object);
    const ids = /* @__PURE__ */ new Set();
    let controllers = 0, web = 0, streams = 0;
    const mainCards = [];
    const corners = /* @__PURE__ */ new Map();
    const bars = /* @__PURE__ */ new Map();
    const takes = (held, frame) => held?.some((other) => framesShare(other, frame)) === true;
    for (const [primitiveIndex, primitive] of primitives.entries()) {
      const itemPath = "".concat(path, "/primitives/").concat(primitiveIndex);
      if (ids.has(primitive.id))
        fail("".concat(itemPath, "/id"), "must be unique within the page");
      ids.add(primitive.id);
      if (primitive.primitive === "application" || primitive.primitive === "iframe")
        web++;
      if (primitive.primitive === "iframe") {
        for (const key of ["src", "fallback_src"]) {
          if (key === "fallback_src" && !Object.hasOwn(primitive, key))
            continue;
          const source = embeddedSource(primitive[key]);
          const templated = typeof source === "string" && hasScreenToken(source);
          const refusal = templated ? screenTemplateRefusal(source) : void 0;
          if (refusal !== void 0)
            fail("".concat(itemPath, "/").concat(key), refusal);
          else if (!signageUrl(templated ? screenTokenStandIn(source) : source, ["http:", "https:"]))
            fail("".concat(itemPath, "/").concat(key), "must be an http or https URL");
        }
        if (typeof primitive.reload_s === "number" && primitive.reload_s !== 0 && (primitive.reload_s < 60 || primitive.reload_s > 86400)) {
          fail("".concat(itemPath, "/reload_s"), "must be 0 (no reload) or 60 to 86400 seconds");
        }
        if (Object.hasOwn(primitive, "navigation_allowlist")) {
          const list = primitive.navigation_allowlist, listPath = "".concat(itemPath, "/navigation_allowlist");
          if (!Array.isArray(list))
            fail(listPath, "must be an array of 1 to 64 strings");
          else if (list.length === 0)
            fail(listPath, "must not be empty: omit it for no restriction");
          else if (list.length > 64)
            fail(listPath, "must have at most 64 entries");
          else {
            for (const [entryIndex, entry] of list.entries()) {
              const issue = typeof entry === "string" ? navigationEntryIssue(entry) : "must be a string";
              if (issue !== void 0)
                fail("".concat(listPath, "/").concat(entryIndex), issue);
            }
          }
        }
      }
      if (primitive.primitive === "application") {
        const release = typeof primitive.release_id === "string" ? primitive.release_id : void 0;
        const params = Object.hasOwn(primitive, "params") ? launchParams(primitive.params, "".concat(itemPath, "/params"), fail) : void 0;
        if (release !== void 0 && release !== "") {
          const canonical = params === void 0 || Object.keys(params).length === 0 ? void 0 : JSON.stringify(Object.keys(params).sort().map((name) => [name, params[name]]));
          if (releaseParams.has(release) && releaseParams.get(release) !== canonical) {
            fail("".concat(itemPath, "/params"), "must match the params of the other primitive that pins this release: the launch route is keyed by release, so a release launches with one set of params");
          }
          releaseParams.set(release, canonical);
        }
      }
      if (primitive.primitive === "stream") {
        streams++;
        if (mode !== "duration")
          fail("".concat(itemPath), "streams require duration advance");
        const protocols = /* @__PURE__ */ new Set();
        for (const [sourceIndex, rawSource] of array(primitive.sources).entries()) {
          const source = object(rawSource), sourcePath = "".concat(itemPath, "/sources/").concat(sourceIndex);
          const protocol = Object.hasOwn(source, "protocol") ? source.protocol : impliedStreamProtocol(source.url);
          if (protocols.has(protocol))
            fail(sourcePath, "source protocols must be unique");
          protocols.add(protocol);
          if (protocol === "udp-mpegts" && (typeof source.group !== "string" || !/^239\.(?:0|[1-9]\d{0,2})\.(?:0|[1-9]\d{0,2})\.(?:0|[1-9]\d{0,2})$/.test(source.group) || source.group.split(".").some((part) => Number(part) > 255)))
            fail("".concat(sourcePath, "/group"), "must be an IPv4 multicast address in 239.0.0.0/8");
          if (protocol === "hls") {
            if (!httpsWithoutCredentials(source.url))
              fail("".concat(sourcePath, "/url"), "must be a valid HTTPS URL without credentials");
          }
          if (protocol === "rtsp" && !signageUrl(source.url, ["rtsp:", "rtsps:"]))
            fail("".concat(sourcePath, "/url"), "must be an rtsp or rtsps URL");
        }
      }
      if (primitive.controller === true) {
        controllers++;
        if (primitive.primitive !== "application" || mode !== "application")
          fail("".concat(itemPath, "/controller"), "is valid only on an application in application advance mode");
      }
      if (primitive.primitive === "application" && typeof primitive.release_id === "string" && !primitive.release_id)
        fail("".concat(itemPath, "/release_id"), "is required");
      const named = Object.hasOwn(primitive, "displays") ? readDisplays(primitive.displays) : void 0;
      if (Object.hasOwn(primitive, "displays") && Array.isArray(primitive.displays)) {
        if (named === void 0)
          fail("".concat(itemPath, "/displays"), DISPLAYS_REASON);
        else if (format === void 0)
          fail("".concat(itemPath, "/displays"), "needs a playlist format");
        else if (Math.max(...named) > format.displays)
          fail("".concat(itemPath, "/displays"), "must name displays 1 through ".concat(format.displays, ", the displays of the playlist format"));
        else if (!fillsRectangle(format, named))
          fail("".concat(itemPath, "/displays"), DISPLAYS_REASON);
        else if (primitive.primitive !== "card" && typeof object(primitive.rect).x === "number") {
          const rect = object(primitive.rect), want = frameRect(format, named);
          if (!sameNumber(rect.x, want.x) || !sameNumber(rect.y, want.y) || !sameNumber(rect.width, want.width) || !sameNumber(rect.height, want.height)) {
            fail("".concat(itemPath, "/rect"), "is derived from displays on this format; omit it or send x ".concat(want.x, ", y ").concat(want.y, ", width ").concat(want.width, ", height ").concat(want.height));
          }
        }
      }
      if (primitive.primitive !== "card" && !Object.hasOwn(primitive, "rect") && !Object.hasOwn(primitive, "displays")) {
        fail("".concat(itemPath, "/rect"), "is required unless displays is set");
      }
      if (primitive.primitive === "card") {
        const frame = named ?? Array.from({ length: format?.displays ?? 1 }, (_, index2) => index2 + 1);
        const layout = primitive.layout;
        const anchors = layout === "corner" || layout === "chip" ? CORNERS : layout === "strip" ? EDGES : [];
        if (typeof layout !== "string" || !LAYOUTS.includes(layout))
          fail("".concat(itemPath, "/layout"), "is required and must be one of ".concat(LAYOUTS.join(", ")));
        else if (anchors.length === 0 && Object.hasOwn(primitive, "anchor"))
          fail("".concat(itemPath, "/anchor"), "is not allowed for layout ".concat(layout));
        else if (anchors.length > 0 && !anchors.includes(primitive.anchor))
          fail("".concat(itemPath, "/anchor"), "is required for layout ".concat(layout, " and must be one of ").concat(anchors.join(", ")));
        if (layout === "free") {
          if (Object.hasOwn(primitive, "displays"))
            fail("".concat(itemPath, "/displays"), "is not allowed for layout free");
          if (!Object.hasOwn(primitive, "rect"))
            fail("".concat(itemPath, "/rect"), "is required for layout free");
          if (!Object.hasOwn(primitive, "layer"))
            fail("".concat(itemPath, "/layer"), "is required for layout free");
        }
        if (layout === "full" || layout === "center" || layout === "wide") {
          if (takes(mainCards, frame))
            fail("".concat(itemPath, "/layout"), "a page holds one full, center or wide card");
          mainCards.push(frame);
        }
        if (layout === "header" || layout === "footer") {
          if (takes(bars.get(layout), frame))
            fail("".concat(itemPath, "/layout"), "a page holds one ".concat(layout, " card"));
          bars.set(layout, [...bars.get(layout) ?? [], frame]);
        }
        if (layout === "corner" || layout === "chip") {
          if (takes(corners.get(primitive.anchor), frame))
            fail("".concat(itemPath, "/anchor"), "a page holds one corner or chip card per corner");
          corners.set(primitive.anchor, [...corners.get(primitive.anchor) ?? [], frame]);
        }
      }
      if (Object.hasOwn(primitive, "motion")) {
        const motionType = object(primitive.motion).type;
        if ((motionType === "spin" || motionType === "drift") && (primitive.primitive === "application" || primitive.primitive === "iframe" || primitive.primitive === "stream")) {
          fail("".concat(itemPath, "/motion"), "".concat(String(motionType), " is not allowed for application, iframe, and stream primitives"));
        }
      }
      if (primitive.primitive === "image" || primitive.primitive === "video") {
        const mediaSelector = object(primitive.selector);
        if (mediaSelector.by === "tag" && object(mediaSelector.tags) && mediaSelector.tags !== void 0 && Object.keys(object(mediaSelector.tags)).length === 0)
          fail("".concat(itemPath, "/selector/tags"), "must contain at least one filter");
        if (mediaSelector.one_at_a_time === true && mediaSelector.batch_size !== void 0 && mediaSelector.batch_size !== 1)
          fail("".concat(itemPath, "/selector/batch_size"), "one_at_a_time requires batch_size 1");
        if (mediaSelector.order === "weighted") {
          if (mediaSelector.weights === void 0)
            fail("".concat(itemPath, "/selector/weights"), "is required with order weighted");
          if (mediaSelector.one_at_a_time !== true && mediaSelector.batch_size !== 1)
            fail("".concat(itemPath, "/selector/order"), "weighted plays one item per visit: set one_at_a_time or batch_size 1");
        } else if (mediaSelector.weights !== void 0)
          fail("".concat(itemPath, "/selector/weights"), "is allowed only with order weighted");
        if (mode === "duration" || mode === "application" || mode === "audio_end") {
          if (Object.hasOwn(primitive, "dwell_ms"))
            fail("".concat(itemPath, "/dwell_ms"), "is forbidden on duration and application pages");
          const selector = object(primitive.selector);
          if ((selector.by === "all" || selector.by === "tag" || selector.by === "folder" || selector.by === "ids" && array(selector.media_ids).length > 1) && selector.one_at_a_time !== true)
            fail("".concat(itemPath, "/selector/one_at_a_time"), "must be true for multiple media on duration or application pages");
        }
        if (mode === "media_end") {
          if (primitive.primitive === "image" && !Object.hasOwn(primitive, "dwell_ms"))
            fail("".concat(itemPath, "/dwell_ms"), "is required for a media_end image");
          if (primitive.primitive === "video" && primitive.loop === true)
            fail("".concat(itemPath, "/loop"), "must be false for media_end");
        }
      }
    }
    if (mode === "application" && controllers !== 1)
      fail("".concat(path, "/primitives"), "application advance requires exactly one controller application");
    if (streams > 1)
      fail("".concat(path, "/primitives"), "must contain at most one stream primitive");
    if (web > 2)
      fail("".concat(path, "/primitives"), "must contain at most two application or iframe primitives");
    if (mode === "media_end") {
      if (web > 0)
        fail("".concat(path, "/advance"), "media_end forbids application and iframe primitives");
      else if (primitives.filter((primitive) => primitive.primitive === "image" || primitive.primitive === "video").length !== 1)
        fail("".concat(path, "/advance"), "media_end requires exactly one image or video primitive");
    }
  }
  if (pages.length > 0 && unscheduled === 0)
    fail("/pages", "must retain at least one page without a visibility rule");
  const trackIds = /* @__PURE__ */ new Set();
  for (const [index, raw] of array(object(playlist.audio).tracks).entries()) {
    const track = object(raw);
    if (trackIds.has(track.id))
      fail("/audio/tracks/".concat(index, "/id"), "must be unique within the playlist");
    trackIds.add(track.id);
  }
  for (const [index, raw] of pages.entries()) {
    const page = object(raw);
    if (!Object.hasOwn(page, "audio_cue")) {
      if (object(page.advance).mode === "audio_end")
        fail("/pages/".concat(index, "/advance"), "audio_end requires an audio_cue on the same page");
      continue;
    }
    if (!Object.hasOwn(playlist, "audio"))
      fail("/pages/".concat(index, "/audio_cue"), "requires a playlist audio soundtrack");
    else if (!trackIds.has(object(page.audio_cue).track))
      fail("/pages/".concat(index, "/audio_cue/track"), "must name a track id in audio.tracks");
  }
  return issues;
}

// dist/iframe-snippet.js
function iframeSnippetSource(input) {
  const opening = /^\s*<iframe(?=[\t\n\f\r />])/i.exec(input);
  if (opening === null)
    return void 0;
  const attribute = /[\t\n\f\r /]*([^\t\n\f\r />=]+)(?:[\t\n\f\r ]*=[\t\n\f\r ]*(?:"([^"]*)"|'([^']*)'|([^\t\n\f\r >"']+)))?/y;
  attribute.lastIndex = opening[0].length;
  let source;
  for (let match; (match = attribute.exec(input)) !== null; ) {
    if (match[1].toLowerCase() !== "src")
      continue;
    source = match[2] ?? match[3] ?? match[4];
    break;
  }
  if (source === void 0 || source.trim() === "")
    throw usageError("The iframe embed code has no src address to show.");
  return decodeAttributeEntities(source).trim();
}

// dist/screen-tokens.js
var SCREEN_TOKEN2 = /\{screen\.(?:id|name|timezone|field\.[a-z0-9_]{1,32}|location\.(?:lat|lon|name|address))\}/g;
function hasScreenToken2(value) {
  return value.includes("{screen.") && new RegExp(SCREEN_TOKEN2.source).test(value);
}
function screenTokenStandIn2(value) {
  return value.replace(SCREEN_TOKEN2, "x");
}
var YOUTUBE_HOSTS2 = /* @__PURE__ */ new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
var DOCUMENT_HOSTS2 = /* @__PURE__ */ new Set(["docs.google.com", "onedrive.live.com", "view.officeapps.live.com", "1drv.ms"]);
function screenTemplateRefusal2(source) {
  const origin = /^https?:\/\/[^/?#]*/i.exec(source)?.[0];
  if (origin === void 0)
    return "must start with http:// or https:// to carry {screen.\u2026} tokens";
  if (hasScreenToken2(origin))
    return "{screen.\u2026} tokens may stand only in the path, query or fragment, not in the scheme, credentials, host or port";
  let host;
  try {
    host = new URL(screenTokenStandIn2(source)).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return void 0;
  }
  if (YOUTUBE_HOSTS2.has(host))
    return "cannot carry {screen.\u2026} tokens: a YouTube link is rewritten to its embed form";
  if (DOCUMENT_HOSTS2.has(host) || /^[a-z0-9-]+\.sharepoint\.com$/.test(host) || host.startsWith("doc.apps."))
    return "cannot carry {screen.\u2026} tokens: a Google or Microsoft document link is rebuilt for the screen";
  if (/^bi-[0-9a-f]{20}\.apps\./.test(host))
    return "cannot carry {screen.\u2026} tokens: a BI view's address carries the screen's embed ticket";
  return void 0;
}

// dist/playlist-write-validation.js
var WIRE_PRIMITIVES = ["image", "video", "iframe", "application", "stream", "card"];
var PLAYLIST_TRANSITION_TYPES = [
  "crossfade",
  "swipe-left",
  "swipe-right",
  "swipe-up",
  "swipe-down",
  "dip",
  "wipe-left",
  "wipe-right",
  "wipe-up",
  "wipe-down",
  "slide-left",
  "slide-right",
  "slide-up",
  "slide-down",
  "stinger"
];
var ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
var MEDIA_ID_PATTERN = RESOURCE_ID_PATTERNS.media;
var COLOR_PATTERN = /^#[0-9A-F]{8}$/;
var CIVIL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)$/;
var TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
var DAYS = /* @__PURE__ */ new Set(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
function record(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw usageError("".concat(name, " must be an object."));
  return value;
}
function exact(owner, allowed, name) {
  const extras = Object.keys(owner).filter((key) => !allowed.includes(key));
  if (extras.length > 0)
    throw usageError("".concat(name, " contains unsupported fields: ").concat(extras.join(", "), "."));
}
function string(owner, key, name, max, pattern) {
  const value = owner[key];
  if (typeof value !== "string" || value.length < 1 || value.length > max || pattern && !pattern.test(value)) {
    throw usageError("".concat(name, ".").concat(key, " is invalid."));
  }
  return value;
}
function number(owner, key, name, options = {}) {
  const value = owner[key];
  if (typeof value !== "number" || !Number.isFinite(value) || options.integer && !Number.isSafeInteger(value) || options.min !== void 0 && value < options.min || options.max !== void 0 && value > options.max)
    throw usageError("".concat(name, ".").concat(key, " is invalid."));
  return value;
}
function optionalBoolean(owner, key, name) {
  const value = owner[key];
  if (value !== void 0 && typeof value !== "boolean")
    throw usageError("".concat(name, ".").concat(key, " must be boolean."));
  return value;
}
function validateBackground(value, name) {
  if (typeof value === "string") {
    if (!COLOR_PATTERN.test(value))
      throw usageError("".concat(name, " must be an uppercase #RRGGBBAA color or linear gradient."));
    return;
  }
  const background = record(value, name);
  exact(background, ["type", "stops"], name);
  if (background.type !== "linear" || !Array.isArray(background.stops) || background.stops.length < 2 || background.stops.length > 8) {
    throw usageError("".concat(name, " must be a linear gradient with 2 to 8 stops."));
  }
  let previous = -1;
  for (const [index, value2] of background.stops.entries()) {
    const stopName = "".concat(name, ".stops[").concat(index, "]");
    const stop = record(value2, stopName);
    exact(stop, ["at", "color"], stopName);
    const at = number(stop, "at", stopName, { min: 0, max: 1 });
    string(stop, "color", stopName, 9, COLOR_PATTERN);
    if (at <= previous)
      throw usageError("".concat(name, " stops must be strictly increasing."));
    previous = at;
  }
  const stops = background.stops;
  if (stops[0]?.at !== 0 || stops.at(-1)?.at !== 1)
    throw usageError("".concat(name, " must start at 0 and end at 1."));
}
function validateCanvas(value, name) {
  const canvas = record(value, name);
  exact(canvas, ["width", "height", "viewport_fit", "background"], name);
  number(canvas, "width", name, { min: Number.MIN_VALUE });
  number(canvas, "height", name, { min: Number.MIN_VALUE });
  if (canvas.viewport_fit !== void 0 && !["contain", "cover", "fill"].includes(String(canvas.viewport_fit))) {
    throw usageError("".concat(name, ".viewport_fit must be contain, cover, or fill."));
  }
  validateBackground(canvas.background, "".concat(name, ".background"));
}
function playlistTransitionIssue(value) {
  const fail = (path, message) => ({ path, message });
  const isRecord = (value2) => value2 !== null && typeof value2 === "object" && !Array.isArray(value2);
  const isColor = (value2) => typeof value2 === "string" && value2.length === 7 && /^#[0-9A-Fa-f]{6}$/.test(value2);
  if (!isRecord(value))
    return fail([], "must be an object");
  const extra = Object.keys(value).find((key) => !["type", "duration_ms", "ease", "color", "stinger"].includes(key));
  if (extra !== void 0)
    return fail([extra], "is not allowed");
  const type = value.type;
  if (typeof type !== "string" || !PLAYLIST_TRANSITION_TYPES.includes(type)) {
    return fail(["type"], "must be a known page transition type");
  }
  const duration = value.duration_ms;
  if (typeof duration !== "number" || !Number.isInteger(duration) || duration < 0 || duration > 6e4) {
    return fail(["duration_ms"], "must be an integer from 0 through 60000");
  }
  if (Object.hasOwn(value, "ease") && (type === "stinger" || typeof value.ease !== "string" || !["linear", "in", "out", "in-out"].includes(value.ease))) {
    return fail(["ease"], "must be linear, in, out, or in-out and is forbidden on stinger");
  }
  if (Object.hasOwn(value, "color") && (type !== "dip" || !isColor(value.color))) {
    return fail(["color"], "must be #RRGGBB and is allowed only on dip");
  }
  if (type !== "stinger") {
    return Object.hasOwn(value, "stinger") ? fail(["stinger"], "is allowed only on stinger") : void 0;
  }
  if (duration < 2e3 || duration > 6e3)
    return fail(["duration_ms"], "must be from 2000 through 6000 for stinger");
  const stinger = value.stinger;
  if (!isRecord(stinger))
    return fail(["stinger"], "must be an object for stinger");
  const extraStinger = Object.keys(stinger).find((key) => !["theme", "title", "subtitle", "logo", "accent", "hang_ms"].includes(key));
  if (extraStinger !== void 0)
    return fail(["stinger", extraStinger], "is not allowed");
  if (Object.hasOwn(stinger, "theme") && (typeof stinger.theme !== "string" || !["neomustard", "cyanotype", "propaganda", "signal", "avant-garde", "bloom", "primetime"].includes(stinger.theme))) {
    return fail(["stinger", "theme"], "must name one of the seven stinger themes");
  }
  for (const [key, limit] of [["title", 40], ["subtitle", 60]]) {
    if (Object.hasOwn(stinger, key) && (typeof stinger[key] !== "string" || Array.from(stinger[key]).length > limit)) {
      return fail(["stinger", key], "must be a string of at most ".concat(limit, " characters"));
    }
  }
  if (Object.hasOwn(stinger, "accent") && !isColor(stinger.accent))
    return fail(["stinger", "accent"], "must be #RRGGBB");
  if (Object.hasOwn(stinger, "logo") && (typeof stinger.logo !== "string" || !/^media:med_[A-Za-z0-9_-]{1,120}$/.test(stinger.logo))) {
    return fail(["stinger", "logo"], "must be media:med_<id> naming a ready image in this project");
  }
  if (Object.hasOwn(stinger, "hang_ms")) {
    const hang = stinger.hang_ms;
    if (typeof hang !== "number" || !Number.isInteger(hang) || hang < 0 || hang > 6e3 || hang * 5 > duration * 3) {
      return fail(["stinger", "hang_ms"], "must be an integer from 0 through 6000 and at most 60% of duration_ms");
    }
  }
  return void 0;
}
function validateTransition(value, name) {
  const issue = playlistTransitionIssue(value);
  if (issue)
    throw usageError("".concat([name, ...issue.path].join("."), " ").concat(issue.message, "."));
}
function validCivil2(value) {
  const match = CIVIL_PATTERN.exec(value);
  if (!match)
    return false;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && date.getUTCHours() === hour && date.getUTCMinutes() === minute;
}
var SCREEN_WEATHER_KEY = "{screen.weather}";
function validateVisibility(value, name) {
  const visibility = record(value, name);
  exact(visibility, ["enabled", "from", "until", "windows", "data"], name);
  if (typeof visibility.enabled !== "boolean")
    throw usageError("".concat(name, ".enabled must be boolean."));
  if (visibility.data !== void 0) {
    const dataName = "".concat(name, ".data");
    const data = record(visibility.data, dataName);
    exact(data, ["key", "path", "equals"], dataName);
    if (data.key !== SCREEN_WEATHER_KEY) {
      const key = string(data, "key", dataName, 256).replace(/\{screen\.field\.[a-z0-9_]{1,32}\}/g, "x");
      if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(key) || key.startsWith("feed:"))
        throw usageError("".concat(dataName, ".key must name card data, not a feed."));
    }
    if (data.path !== void 0 && (typeof data.path !== "string" || Buffer.byteLength(data.path, "utf8") > 256 || data.path !== "" && !data.path.startsWith("/") || /~(?:[^01]|$)/.test(data.path) || data.path.split("/").length > 17)) {
      throw usageError("".concat(dataName, ".path must be an RFC 6901 pointer of at most 256 bytes and 16 segments."));
    }
    if (Object.hasOwn(data, "equals")) {
      const expected = data.equals;
      if (expected !== null && typeof expected !== "string" && typeof expected !== "boolean" && !(typeof expected === "number" && Number.isFinite(expected))) {
        throw usageError("".concat(dataName, ".equals must be a JSON scalar."));
      }
      if (typeof expected === "string" && Buffer.byteLength(expected, "utf8") > 1024) {
        throw usageError("".concat(dataName, ".equals must be at most 1024 bytes."));
      }
    }
  }
  for (const key of ["from", "until"]) {
    if (visibility[key] !== void 0 && (typeof visibility[key] !== "string" || !validCivil2(visibility[key]))) {
      throw usageError("".concat(name, ".").concat(key, " must be a valid civil YYYY-MM-DDTHH:MM value."));
    }
  }
  if (typeof visibility.from === "string" && typeof visibility.until === "string" && visibility.from >= visibility.until) {
    throw usageError("".concat(name, ".until must be later than from."));
  }
  if (visibility.windows !== void 0) {
    if (!Array.isArray(visibility.windows) || visibility.windows.length < 1 || visibility.windows.length > 16) {
      throw usageError("".concat(name, ".windows must contain 1 to 16 windows."));
    }
    for (const [index, value2] of visibility.windows.entries()) {
      const windowName = "".concat(name, ".windows[").concat(index, "]");
      const window = record(value2, windowName);
      exact(window, ["days", "start", "end"], windowName);
      if (!Array.isArray(window.days) || window.days.length < 1 || window.days.length > 7 || new Set(window.days).size !== window.days.length || window.days.some((day) => typeof day !== "string" || !DAYS.has(day))) {
        throw usageError("".concat(windowName, ".days must contain unique civil weekdays."));
      }
      const hasStart = window.start !== void 0;
      const hasEnd = window.end !== void 0;
      if (hasStart !== hasEnd || hasStart && (typeof window.start !== "string" || typeof window.end !== "string" || !TIME_PATTERN.test(window.start) || !TIME_PATTERN.test(window.end))) {
        throw usageError("".concat(windowName, ".start and end must both be valid HH:MM values or both be absent."));
      }
    }
  }
  if (visibility.enabled === true && visibility.from === void 0 && visibility.until === void 0 && visibility.windows === void 0 && visibility.data === void 0) {
    throw usageError("".concat(name, " with enabled true must bound visibility."));
  }
}
function validateRect(value, name) {
  const rect = record(value, name);
  exact(rect, ["x", "y", "width", "height"], name);
  number(rect, "x", name);
  number(rect, "y", name);
  number(rect, "width", name, { min: Number.MIN_VALUE });
  number(rect, "height", name, { min: Number.MIN_VALUE });
}
function validateEnter(value, name) {
  const enter = record(value, name);
  exact(enter, ["type", "stagger"], name);
  if (!["fade-up", "fade-down", "fade-left", "fade-right", "fade-in", "zoom-in", "zoom-out"].includes(String(enter.type))) {
    throw usageError("".concat(name, ".type is invalid."));
  }
  if (enter.stagger !== void 0)
    number(enter, "stagger", name, { integer: true, min: 0, max: 8 });
}
function validateMotion(value, name, primitive) {
  const motion = record(value, name);
  if (motion.type === "spin") {
    exact(motion, ["type", "direction", "speed"], name);
    if (primitive === "application" || primitive === "iframe") {
      throw usageError("".concat(name, " spin is not allowed for application and iframe primitives."));
    }
    if (!["cw", "ccw"].includes(String(motion.direction)))
      throw usageError("".concat(name, ".direction is invalid."));
    if (!["slow", "medium", "fast"].includes(String(motion.speed)))
      throw usageError("".concat(name, ".speed is invalid."));
    return;
  }
  if (motion.type === "path") {
    exact(motion, ["type", "points", "rate", "loop"], name);
    if (!Array.isArray(motion.points) || motion.points.length < 1 || motion.points.length > 64) {
      throw usageError("".concat(name, ".points must contain 1 to 64 waypoints."));
    }
    for (const [index, pointValue] of motion.points.entries()) {
      const pointName = "".concat(name, ".points[").concat(index, "]");
      const point = record(pointValue, pointName);
      exact(point, ["x", "y"], pointName);
      number(point, "x", pointName);
      number(point, "y", pointName);
    }
    const rate = motion.rate;
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0 || rate > 1e4) {
      throw usageError("".concat(name, ".rate is invalid."));
    }
    if (motion.loop !== void 0 && !["loop", "ping-pong", "once"].includes(String(motion.loop))) {
      throw usageError("".concat(name, ".loop is invalid."));
    }
    return;
  }
  if (motion.type === "drift") {
    exact(motion, ["type", "zoom", "direction", "speed"], name);
    if (primitive === "application" || primitive === "iframe") {
      throw usageError("".concat(name, " drift is not allowed for application and iframe primitives."));
    }
    if (!["in", "out"].includes(String(motion.zoom)))
      throw usageError("".concat(name, ".zoom is invalid."));
    if (!["left", "right", "up", "down", "none"].includes(String(motion.direction)))
      throw usageError("".concat(name, ".direction is invalid."));
    if (!["slow", "medium", "fast"].includes(String(motion.speed)))
      throw usageError("".concat(name, ".speed is invalid."));
    return;
  }
  throw usageError("".concat(name, ".type is invalid."));
}
function validateIframeAddress(value, key, name) {
  const address = string(value, key, name, 4096);
  let source;
  try {
    source = iframeSnippetSource(address) ?? address;
  } catch (error) {
    if (error instanceof CliError)
      throw error;
    throw usageError("".concat(name, ".").concat(key, " must be an http or https URL."));
  }
  const templated = hasScreenToken2(source);
  if (templated) {
    const refusal = screenTemplateRefusal2(source);
    if (refusal !== void 0)
      throw usageError("".concat(name, ".").concat(key, " ").concat(refusal, "."));
  }
  let parsed;
  try {
    parsed = new URL(templated ? screenTokenStandIn2(source) : source);
  } catch {
    throw usageError("".concat(name, ".").concat(key, " must be an http or https URL."));
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:" || !parsed.hostname) {
    throw usageError("".concat(name, ".").concat(key, " must be an http or https URL."));
  }
}
function validateIframe(value, name) {
  exact(value, ["type", "src", "title", "reload_s", "fallback_src", "navigation_allowlist"], name);
  validateIframeAddress(value, "src", name);
  string(value, "title", name, 200);
  if (value.fallback_src !== void 0)
    validateIframeAddress(value, "fallback_src", name);
  if (value.navigation_allowlist !== void 0) {
    const list = value.navigation_allowlist;
    if (!Array.isArray(list) || list.length < 1 || list.length > 64) {
      throw usageError("".concat(name, ".navigation_allowlist must be 1 to 64 strings."));
    }
    for (const [index, entry] of list.entries()) {
      if (typeof entry !== "string" || entry.length < 1 || entry.length > 2048) {
        throw usageError("".concat(name, ".navigation_allowlist[").concat(index, "] must be a string of 1 to 2048 characters."));
      }
    }
  }
  if (value.reload_s !== void 0) {
    const seconds = number(value, "reload_s", name, { integer: true, min: 0, max: 86400 });
    if (seconds > 0 && seconds < 60)
      throw usageError("".concat(name, ".reload_s must be 0 (no reload) or 60 to 86400 seconds."));
  }
}
function validateSelector(value, name, primitive, mediaPrimitives, referenced) {
  const selector = record(value, name);
  let ids;
  if (selector.by === "id") {
    exact(selector, ["by", "media_id", "one_at_a_time"], name);
    ids = [string(selector, "media_id", name, 256, MEDIA_ID_PATTERN)];
    if (selector.one_at_a_time !== void 0 && selector.one_at_a_time !== false)
      throw usageError("".concat(name, ".one_at_a_time must be false for by:id."));
  } else if (selector.by === "ids") {
    exact(selector, ["by", "media_ids", "one_at_a_time"], name);
    if (!Array.isArray(selector.media_ids) || selector.media_ids.length < 1 || selector.media_ids.length > 1024 || new Set(selector.media_ids).size !== selector.media_ids.length || selector.media_ids.some((id) => typeof id !== "string" || !MEDIA_ID_PATTERN.test(id))) {
      throw usageError("".concat(name, ".media_ids must contain 1 to 1024 unique media ids."));
    }
    optionalBoolean(selector, "one_at_a_time", name);
    ids = selector.media_ids;
  } else {
    throw usageError("".concat(name, " must be snapshotted to by:id or by:ids."));
  }
  for (const id of ids) {
    const actual = mediaPrimitives.get(id);
    if (!actual)
      throw usageError("".concat(name, " references media missing from the bundle: ").concat(id, "."));
    if (actual !== primitive)
      throw usageError("".concat(name, " references ").concat(actual, " media from an ").concat(primitive, " primitive: ").concat(id, "."));
    referenced.add(id);
  }
  return { count: ids.length, oneAtATime: selector.one_at_a_time === true };
}
function validateAdvance(value, name) {
  const advance = record(value, name);
  if (advance.mode === "duration") {
    exact(advance, ["mode", "after_ms", "until"], name);
    number(advance, "after_ms", name, { integer: true, min: 1e3, max: 864e5 });
    if (advance.until !== void 0 && advance.until !== "video_end")
      throw usageError("".concat(name, ".until must be video_end."));
    return "duration";
  }
  if (advance.mode === "application") {
    exact(advance, ["mode", "max_ms"], name);
    number(advance, "max_ms", name, { integer: true, min: 1e3, max: 864e5 });
    return "application";
  }
  if (advance.mode === "media_end") {
    exact(advance, ["mode", "max_ms"], name);
    if (advance.max_ms !== void 0)
      number(advance, "max_ms", name, { integer: true, min: 1e3, max: 864e5 });
    return "media_end";
  }
  if (advance.mode === "audio_end") {
    exact(advance, ["mode", "max_ms"], name);
    if (advance.max_ms !== void 0)
      number(advance, "max_ms", name, { integer: true, min: 1e3, max: 864e5 });
    return "audio_end";
  }
  throw usageError("".concat(name, ".mode is invalid."));
}
var MAX_AUDIO_TRACKS = 128;
function validateAudio(value, mediaPrimitives, referenced) {
  const name = "playlist.audio";
  const audio = record(value, name);
  exact(audio, ["tracks", "loop", "volume", "cued"], name);
  if (!Array.isArray(audio.tracks))
    throw usageError("".concat(name, ".tracks must be an array of 1 to ").concat(MAX_AUDIO_TRACKS, " tracks."));
  if (audio.tracks.length < 1 || audio.tracks.length > MAX_AUDIO_TRACKS) {
    throw usageError("".concat(name, ".tracks must contain 1 to ").concat(MAX_AUDIO_TRACKS, " tracks; this playlist has ").concat(audio.tracks.length, "."));
  }
  optionalBoolean(audio, "loop", name);
  optionalBoolean(audio, "cued", name);
  if (audio.volume !== void 0)
    number(audio, "volume", name, { min: 0, max: 1 });
  const trackIds = /* @__PURE__ */ new Set();
  for (const [index, trackValue] of audio.tracks.entries()) {
    const trackName = "".concat(name, ".tracks[").concat(index, "]");
    const track = record(trackValue, trackName);
    exact(track, ["id", "media_id"], trackName);
    const id = string(track, "id", trackName, 64, ID_PATTERN);
    if (trackIds.has(id))
      throw usageError("Playlist audio track id is duplicated: ".concat(id, "."));
    trackIds.add(id);
    const mediaId = string(track, "media_id", trackName, 256, MEDIA_ID_PATTERN);
    const actual = mediaPrimitives.get(mediaId);
    if (!actual)
      throw usageError("".concat(trackName, " references media missing from the bundle: ").concat(mediaId, "."));
    if (actual !== "audio")
      throw usageError("".concat(trackName, " references ").concat(actual, " media; soundtrack tracks must be audio: ").concat(mediaId, "."));
    referenced.add(mediaId);
  }
  return trackIds;
}
function validateAudioCue(value, name, trackIds) {
  const cue = record(value, name);
  exact(cue, ["track", "restart"], name);
  const track = string(cue, "track", name, 64, ID_PATTERN);
  optionalBoolean(cue, "restart", name);
  if (!trackIds)
    throw usageError("".concat(name, " requires a playlist audio soundtrack."));
  if (!trackIds.has(track))
    throw usageError("".concat(name, ".track must name a track id in audio.tracks."));
}
function validatePlaylistWrite(value, mediaPrimitives) {
  const playlist = record(value, "playlist.json");
  exact(playlist, ["name", "audio", "pages"], "playlist.json");
  string(playlist, "name", "playlist.json", 120);
  if (!Array.isArray(playlist.pages) || playlist.pages.length < 1 || playlist.pages.length > 100) {
    throw usageError("playlist.json.pages must contain 1 to 100 pages.");
  }
  const pageIds = /* @__PURE__ */ new Set();
  const referenced = /* @__PURE__ */ new Set();
  const trackIds = playlist.audio === void 0 ? void 0 : validateAudio(playlist.audio, mediaPrimitives, referenced);
  let unscheduled = 0;
  for (const [pageIndex, pageValue] of playlist.pages.entries()) {
    const pageName = "playlist.pages[".concat(pageIndex, "]");
    const page = record(pageValue, pageName);
    exact(page, ["id", "canvas", "transition", "advance", "visibility", "audio_cue", "primitives"], pageName);
    const pageId = string(page, "id", pageName, 64, ID_PATTERN);
    if (pageIds.has(pageId))
      throw usageError("Playlist page id is duplicated: ".concat(pageId, "."));
    pageIds.add(pageId);
    validateCanvas(page.canvas, "".concat(pageName, ".canvas"));
    validateTransition(page.transition, "".concat(pageName, ".transition"));
    const advance = validateAdvance(page.advance, "".concat(pageName, ".advance"));
    if (page.visibility === void 0)
      unscheduled += 1;
    else
      validateVisibility(page.visibility, "".concat(pageName, ".visibility"));
    if (page.audio_cue !== void 0)
      validateAudioCue(page.audio_cue, "".concat(pageName, ".audio_cue"), trackIds);
    else if (advance === "audio_end")
      throw usageError("".concat(pageName, ".advance audio_end requires an audio_cue on the same page."));
    if (!Array.isArray(page.primitives) || page.primitives.length < 1 || page.primitives.length > 24) {
      throw usageError("".concat(pageName, ".primitives must contain 1 to 24 primitives."));
    }
    const primitiveIds = /* @__PURE__ */ new Set();
    const mediaPrimitivesOnPage = [];
    let iframeCount = 0;
    for (const [primitiveIndex, primitiveValue] of page.primitives.entries()) {
      const primitiveName = "".concat(pageName, ".primitives[").concat(primitiveIndex, "]");
      const primitive = record(primitiveValue, primitiveName);
      const primitiveId = string(primitive, "id", primitiveName, 64, ID_PATTERN);
      if (primitiveIds.has(primitiveId))
        throw usageError("".concat(pageName, " primitive id is duplicated: ").concat(primitiveId, "."));
      primitiveIds.add(primitiveId);
      validateRect(primitive.rect, "".concat(primitiveName, ".rect"));
      number(primitive, "layer", primitiveName, { integer: true, min: 0, max: 1024 });
      if (primitive.enter !== void 0)
        validateEnter(primitive.enter, "".concat(primitiveName, ".enter"));
      if (primitive.primitive === "application")
        throw usageError("Playlist bundles do not support application primitives.");
      if (primitive.primitive === "iframe") {
        exact(primitive, ["id", "primitive", "src", "title", "reload_s", "fallback_src", "navigation_allowlist", "rect", "layer", "content_fit", "enter", "motion"], primitiveName);
        validateIframe({
          type: "iframe",
          src: primitive.src,
          title: primitive.title,
          ...primitive.reload_s !== void 0 ? { reload_s: primitive.reload_s } : {},
          ...primitive.fallback_src !== void 0 ? { fallback_src: primitive.fallback_src } : {},
          ...primitive.navigation_allowlist !== void 0 ? { navigation_allowlist: primitive.navigation_allowlist } : {}
        }, primitiveName);
        if (primitive.content_fit !== "fill")
          throw usageError("".concat(primitiveName, ".content_fit must be fill for an iframe."));
        if (primitive.motion !== void 0)
          validateMotion(primitive.motion, "".concat(primitiveName, ".motion"), "iframe");
        iframeCount += 1;
        continue;
      }
      if (primitive.primitive !== "image" && primitive.primitive !== "video")
        throw usageError("".concat(primitiveName, ".primitive is unsupported."));
      if (!["contain", "cover", "fill"].includes(String(primitive.content_fit)))
        throw usageError("".concat(primitiveName, ".content_fit is invalid."));
      const category = primitive.primitive;
      exact(primitive, category === "image" ? ["id", "primitive", "selector", "alt", "dwell_ms", "rect", "layer", "content_fit", "enter", "motion"] : ["id", "primitive", "selector", "muted", "loop", "rect", "layer", "content_fit", "enter", "motion"], primitiveName);
      if (primitive.motion !== void 0)
        validateMotion(primitive.motion, "".concat(primitiveName, ".motion"), category);
      const selector = validateSelector(primitive.selector, "".concat(primitiveName, ".selector"), category, mediaPrimitives, referenced);
      if (category === "image") {
        if (primitive.alt !== void 0 && (typeof primitive.alt !== "string" || primitive.alt.length > 300))
          throw usageError("".concat(primitiveName, ".alt is invalid."));
        if (primitive.dwell_ms !== void 0)
          number(primitive, "dwell_ms", primitiveName, { integer: true, min: 1e3, max: 864e5 });
      } else {
        if (primitive.muted !== void 0 && primitive.muted !== true)
          throw usageError("".concat(primitiveName, ".muted must be true."));
        optionalBoolean(primitive, "loop", primitiveName);
      }
      mediaPrimitivesOnPage.push({ primitive: category, value: primitive, selector });
    }
    if (iframeCount > 2)
      throw usageError("".concat(pageName, ".primitives must contain at most 2 iframe primitives."));
    if (advance === "application")
      throw usageError("".concat(pageName, " application advance is unsupported because bundles exclude applications."));
    if (advance === "media_end") {
      if (page.primitives.length !== 1 || mediaPrimitivesOnPage.length !== 1 || iframeCount > 0)
        throw usageError("".concat(pageName, " media_end requires exactly one image or video primitive."));
      const only = mediaPrimitivesOnPage[0];
      if (only.primitive === "image" && only.value.dwell_ms === void 0)
        throw usageError("".concat(pageName, " media_end image requires dwell_ms."));
      if (only.primitive === "video" && only.value.loop === true)
        throw usageError("".concat(pageName, " media_end video must not loop."));
    } else {
      for (const media of mediaPrimitivesOnPage) {
        if (media.primitive === "image" && media.value.dwell_ms !== void 0)
          throw usageError("".concat(pageName, " ").concat(advance, " pages forbid image dwell_ms."));
        if (media.selector.count > 1 && !media.selector.oneAtATime)
          throw usageError("".concat(pageName, " multi-item selectors require one_at_a_time true."));
      }
    }
  }
  if (unscheduled === 0)
    throw usageError("Every playlist must keep at least one page with no visibility field.");
  return referenced;
}
function pageLabel(page, index) {
  return typeof page.id === "string" && page.id.length > 0 ? "Page ".concat(page.id) : "pages[".concat(index, "]");
}
var PRIMITIVE_NEXT = {
  command: "screenrig media generate --help",
  reason: "Finished stills come from media generate; live text comes from built-in cards."
};
function assertWirePages(pages) {
  for (const [index, page] of pages.entries()) {
    if (!page || typeof page !== "object" || Array.isArray(page))
      continue;
    const owner = page;
    if (!Array.isArray(owner.primitives))
      continue;
    const label = pageLabel(owner, index);
    for (const [primitiveIndex, primitive] of owner.primitives.entries()) {
      if (!primitive || typeof primitive !== "object" || Array.isArray(primitive))
        continue;
      const wire = primitive;
      const category = wire.primitive;
      if (typeof category !== "string" || !WIRE_PRIMITIVES.includes(category)) {
        throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "].primitive must be ").concat(WIRE_PRIMITIVES.join("|"), ". Generate a finished still with media generate, or use a built-in card for live text."), PRIMITIVE_NEXT);
      }
      if (category === "image" || category === "video") {
        const selector = wire.selector;
        if (!selector || typeof selector !== "object" || Array.isArray(selector) || !["id", "ids", "all", "tag", "folder"].includes(String(selector.by))) {
          throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "] ").concat(category, " requires a selector with by id|ids|all|tag|folder."));
        }
      } else if ("selector" in wire) {
        throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "] ").concat(category, " does not take a selector."));
      }
    }
  }
}

// dist/playlist-validate.js
var import__ = __toESM(require__(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);

// dist/playlist-lint.js
var LINT_CODES = [
  "collision",
  "motion_overuse",
  "adjacent_repeat",
  "safe_margin"
];
var COLLISION_OVERLAP = 0.2;
var FULL_BLEED_COVERAGE = 0.95;
var SAFE_MARGIN = 0.04;
function sortLint(findings, pageOrder) {
  const order = new Map(pageOrder.map((id, index) => [id, index]));
  const codeOrder = new Map(LINT_CODES.map((code, index) => [code, index]));
  return [...findings].sort((left, right) => {
    const page = (order.get(left.page_id) ?? 0) - (order.get(right.page_id) ?? 0);
    if (page !== 0)
      return page;
    const code = (codeOrder.get(left.code) ?? 0) - (codeOrder.get(right.code) ?? 0);
    if (code !== 0)
      return code;
    return left.id.localeCompare(right.id);
  });
}
function lintPlaylistPages(pages) {
  const findings = [];
  const records = pages.map(pageRecord);
  for (const [index, page] of records.entries()) {
    if (!page)
      continue;
    findings.push(...lintPlaylistPage(page));
    if (index === 0)
      continue;
    const previous = records[index - 1];
    if (!previous)
      continue;
    if (contentSet(previous) === contentSet(page) && contentSet(page) !== "" && page.primitives.every((primitive) => primitive.content !== "")) {
      findings.push({
        page_id: page.id,
        code: "adjacent_repeat",
        id: page.primitives[0]?.id ?? page.id,
        message: "".concat(page.id, ": shows the same media at the same rects as ").concat(previous.id, ".")
      });
    }
  }
  return sortLint(findings, records.map((page) => page?.id ?? ""));
}
function lintPlaylistPage(page) {
  const findings = [];
  const canvas = page.canvas;
  const motions = page.primitives.filter((primitive) => primitive.motion);
  if (motions.length > 1) {
    for (const extra of motions.slice(1)) {
      findings.push({
        page_id: page.id,
        code: "motion_overuse",
        id: extra.id,
        message: "".concat(page.id, ": more than one persistent motion (").concat(extra.id, ").")
      });
    }
  }
  const enters = page.primitives.filter((primitive) => primitive.enter && !(primitive.rect && isFullBleed(primitive.rect, canvas)));
  if (enters.length > 2) {
    for (const extra of enters.slice(2)) {
      findings.push({
        page_id: page.id,
        code: "motion_overuse",
        id: extra.id,
        message: "".concat(page.id, ": more than two enter effects with text (").concat(extra.id, ").")
      });
    }
  }
  for (let i = 0; i < page.primitives.length; i++) {
    for (let j = i + 1; j < page.primitives.length; j++) {
      const first = page.primitives[i];
      const second = page.primitives[j];
      if (!first.rect || !second.rect)
        continue;
      if (isFullBleed(first.rect, canvas) || isFullBleed(second.rect, canvas))
        continue;
      const overlap = overlapBox(first.rect, second.rect);
      if (!overlap)
        continue;
      const ratio = area(overlap) / Math.min(area(first.rect), area(second.rect));
      if (ratio > COLLISION_OVERLAP) {
        findings.push({
          page_id: page.id,
          code: "collision",
          id: second.id,
          message: "".concat(page.id, ": ").concat(first.id, " overlaps ").concat(second.id, " by ").concat((ratio * 100).toFixed(0), "%.")
        });
      }
    }
  }
  for (const primitive of page.primitives) {
    const rect = primitive.rect;
    if (!rect || isFullBleed(rect, canvas))
      continue;
    if (withinSafeMargin(rect, canvas)) {
      findings.push({
        page_id: page.id,
        code: "safe_margin",
        id: primitive.id,
        message: "".concat(page.id, ": ").concat(primitive.id, " sits within 4% of a canvas edge.")
      });
    }
  }
  return findings;
}
function primitiveContent(primitive) {
  const selector = primitive.selector;
  if (selector && typeof selector === "object" && !Array.isArray(selector)) {
    const record2 = selector;
    if (typeof record2.media_id === "string")
      return "id:".concat(record2.media_id);
    if (Array.isArray(record2.media_ids))
      return "ids:".concat(record2.media_ids.filter((id) => typeof id === "string").sort().join(","));
    if (typeof record2.tag === "string")
      return "tag:".concat(record2.tag);
    if (typeof record2.folder_id === "string")
      return "folder:".concat(record2.folder_id);
    if (record2.by === "all")
      return "all";
  }
  if (typeof primitive.src === "string")
    return "src:".concat(primitive.src);
  if (typeof primitive.release_id === "string")
    return "release:".concat(primitive.release_id);
  if (typeof primitive.application_id === "string")
    return "application:".concat(primitive.application_id);
  return "";
}
function pageRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return void 0;
  const raw = value;
  const id = typeof raw.id === "string" ? raw.id : "page";
  const canvasValue = raw.canvas;
  const canvasRecord = canvasValue && typeof canvasValue === "object" && !Array.isArray(canvasValue) ? canvasValue : {};
  const canvas = {
    x: 0,
    y: 0,
    width: numberOf(canvasRecord.width, 1920),
    height: numberOf(canvasRecord.height, 1080)
  };
  const primitives = Array.isArray(raw.primitives) ? raw.primitives.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      return [];
    const primitive = item;
    const rectValue = primitive.rect;
    const rectRecord = rectValue && typeof rectValue === "object" && !Array.isArray(rectValue) ? rectValue : void 0;
    return [{
      id: typeof primitive.id === "string" ? primitive.id : "primitive",
      kind: typeof primitive.primitive === "string" ? primitive.primitive : "image",
      ...rectRecord ? { rect: {
        x: numberOf(rectRecord.x, 0),
        y: numberOf(rectRecord.y, 0),
        width: numberOf(rectRecord.width, 0),
        height: numberOf(rectRecord.height, 0)
      } } : {},
      content: primitiveContent(primitive),
      motion: primitive.motion,
      enter: primitive.enter
    }];
  }) : [];
  return { id, canvas, primitives };
}
function contentSet(page) {
  return page.primitives.map((primitive) => "".concat(primitive.content, "@").concat(primitive.rect ? "".concat(primitive.rect.x, ",").concat(primitive.rect.y, ",").concat(primitive.rect.width, ",").concat(primitive.rect.height) : "derived")).sort().join("|");
}
function area(box) {
  return Math.max(0, box.width) * Math.max(0, box.height);
}
function overlapBox(left, right) {
  const x = Math.max(left.x, right.x);
  const y = Math.max(left.y, right.y);
  const width = Math.min(left.x + left.width, right.x + right.width) - x;
  const height = Math.min(left.y + left.height, right.y + right.height) - y;
  if (width <= 1 || height <= 1)
    return void 0;
  return { x, y, width, height };
}
function isFullBleed(box, frame) {
  const coverage = area(overlapBox(box, { x: 0, y: 0, width: frame.width, height: frame.height }) ?? { x: 0, y: 0, width: 0, height: 0 }) / Math.max(1, frame.width * frame.height);
  return coverage >= FULL_BLEED_COVERAGE;
}
function withinSafeMargin(box, frame) {
  const inset = Math.min(frame.width, frame.height) * SAFE_MARGIN;
  return box.x < inset || box.y < inset || box.x + box.width > frame.width - inset || box.y + box.height > frame.height - inset;
}
function numberOf(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

// dist/screen-wall.js
var WALL_ARRANGEMENTS = ["row", "column", "grid"];
var WALL_ROTATIONS = ["0", "90", "180", "270"];
var MAX_OUTPUTS = 12;
var OUTPUT_NAME = /^[A-Za-z0-9._-]{1,64}$/;
function wallOutputs(value, flag = "--outputs") {
  const names = value.split(",").map((name) => name.trim());
  if (names.length < 2 || names.length > MAX_OUTPUTS) {
    throw usageError("".concat(flag, " takes 2 to ").concat(MAX_OUTPUTS, " comma-separated output names in physical order, left to right then top to bottom, for example ").concat(flag, " HDMI-A-1,HDMI-A-2."));
  }
  if (names.some((name) => !OUTPUT_NAME.test(name))) {
    throw usageError("".concat(flag, " names are 1 to 64 letters, digits, dots, underscores or dashes: the output names screen show lists as observation.surfaces[].id."));
  }
  if (new Set(names).size !== names.length)
    throw usageError("".concat(flag, " lists an output more than once."));
  return names;
}
function wallOutputsOption(value) {
  wallOutputs(value);
  return value;
}
function wallFromFlags(outputs, arrangement, rotation, columns) {
  if (!WALL_ARRANGEMENTS.includes(arrangement))
    throw usageError("--arrangement must be row, column, or grid.");
  if (rotation !== void 0 && !WALL_ROTATIONS.includes(rotation))
    throw usageError("--rotation must be 0, 90, 180, or 270.");
  return {
    outputs: wallOutputs(outputs),
    arrangement,
    ...columns === void 0 ? {} : { columns: Number(columns) },
    ...rotation === void 0 ? {} : { rotation: Number(rotation) }
  };
}
function wallLine(wall) {
  const shape = wall.arrangement === "grid" && wall.columns !== void 0 ? "grid, ".concat(wall.columns, " columns") : wall.arrangement;
  return "".concat(wall.outputs.join(", "), " (").concat(shape, ", rotation ").concat(wall.rotation ?? 0, ")");
}
function wallSize(displays, arrangement, portrait, columns) {
  const [tileWidth, tileHeight] = portrait ? [1080, 1920] : [1920, 1080];
  const across = arrangement === "column" ? 1 : arrangement === "grid" ? columns : displays;
  return { width: tileWidth * across, height: tileHeight * (displays / across) };
}
function wallCanvas(screen) {
  const wall = screen?.wall;
  if (wall === void 0 || wall === null)
    return void 0;
  const { outputs, arrangement, rotation, columns } = wall;
  const count = Array.isArray(outputs) ? outputs.length : 0;
  const grid = arrangement === "grid";
  if (count < 2 || count > MAX_OUTPUTS || !WALL_ARRANGEMENTS.includes(arrangement) || grid && !(Number.isInteger(columns) && columns >= 2 && count % columns === 0 && count / columns >= 2) || rotation !== void 0 && ![0, 90, 180, 270].includes(rotation)) {
    throw usageError("Screen response has an invalid video wall.");
  }
  const portrait = rotation === 90 || rotation === 270;
  return {
    ...wallSize(count, arrangement, portrait, columns),
    format: { displays: count, arrangement, orientation: portrait ? "portrait" : "landscape", ...grid ? { columns } : {} }
  };
}
function wallProblem(error, id) {
  if (!(error instanceof CliError) || error.problem.next || error.problem.code !== "wall_unsupported")
    return error;
  return new CliError({
    ...error.problem,
    detail: "".concat(error.problem.detail, " Nothing was changed. A video wall needs the Linux Player's kiosk install (cage and wlr-randr) or the Windows Player, which declare the display.wall capability in their host report (screen show lists host.capabilities); this screen's Player did not."),
    next: { command: "screenrig screen show ".concat(id), reason: "Check host.capabilities for display.wall and observation.surfaces for the Player's output names." }
  }, error.exitCode, error.warnings);
}

// dist/playlist-authoring.js
var DEFAULT_PAGE_DURATION_MS = 8e3;
var APPLICATION_PAGE_DURATION_MS = 864e5;
var APPLICATION_SHORT_PAGE_MS = 6e4;
function object2(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw usageError("Expected a playlist object.");
  return value;
}
var CARD_INSTANCE_UID = /^(?:(?:stage|qa|development)_)?crd_[A-Za-z0-9_-]+$/;
function editablePlaylist(value) {
  const resource = object2(value);
  const document = structuredClone({
    name: resource.name,
    ...resource.audio !== void 0 && resource.audio !== null ? { audio: resource.audio } : {},
    // Omitting the format on a PUT would turn a wall playlist into an ordinary one.
    ...resource.format !== void 0 && resource.format !== null ? { format: resource.format } : {},
    // A template's fields travel with its pages: they are what its tokens name.
    ...Array.isArray(resource.fields) && resource.fields.length > 0 ? { fields: resource.fields } : {},
    pages: resource.pages
  });
  if (!Array.isArray(document.pages))
    throw usageError("Playlist pages are missing.");
  for (const page of document.pages) {
    object2(page);
    if (page.type === "adslot")
      continue;
    delete page.comments;
    if (page.advance?.mode === "media_end" || page.advance?.mode === "audio_end")
      delete page.advance.max_ms;
    if (!Array.isArray(page.primitives))
      throw usageError("Playlist primitives are missing.");
    for (const primitive of page.primitives) {
      object2(primitive);
      if (primitive.primitive !== "application" || primitive.controller !== true)
        delete primitive.controller;
      if (["image", "video", "stream"].includes(primitive.primitive)) {
        delete primitive.resolved_media;
        if (primitive.selector?.by === "id" && primitive.selector.one_at_a_time === false)
          delete primitive.selector.one_at_a_time;
      }
      if (primitive.primitive === "card") {
        delete primitive.feed;
        delete primitive.resolved_media;
        if (typeof primitive.card === "string" && CARD_INSTANCE_UID.test(primitive.card)) {
          for (const member of ["type", "major", "params"])
            delete primitive[member];
          if (primitive.data === primitive.card)
            delete primitive.data;
          if (typeof primitive.layout === "string" && primitive.layout !== "free") {
            delete primitive.rect;
            delete primitive.layer;
          }
        }
      }
    }
  }
  assertPlaylistValid(document);
  return document;
}
function isAdSlotPage(page) {
  if (typeof page !== "object" || page === null || Array.isArray(page))
    return false;
  return "type" in page && page.type === "adslot";
}
function shortApplicationPageWarning(document) {
  const pages = document?.pages;
  if (!Array.isArray(pages))
    return void 0;
  const short = [];
  for (const page of pages) {
    if (!page || typeof page !== "object" || isAdSlotPage(page) || !Array.isArray(page.primitives))
      continue;
    if (!page.primitives.some((primitive) => primitive?.primitive === "application"))
      continue;
    const ms = page.advance?.mode === "duration" ? page.advance.after_ms : page.advance?.mode === "application" ? page.advance.max_ms : void 0;
    if (typeof ms === "number" && ms < APPLICATION_SHORT_PAGE_MS)
      short.push("".concat(typeof page.id === "string" ? page.id : "(unnamed)", " (").concat(ms, " ms)"));
  }
  if (short.length === 0)
    return void 0;
  return {
    code: "application_page_short",
    message: "Application page ".concat(short.join(", "), " advances in under ").concat(APPLICATION_SHORT_PAGE_MS / 1e3, " seconds, so the app restarts each time the page returns and loses its state. For an app-driven board set advance after_ms (or --duration-ms) to a long hold; applications default to ").concat(APPLICATION_PAGE_DURATION_MS, " ms.")
  };
}
function preparePlaylist(options) {
  const tracks = options.content.filter((media) => media.primitive === "audio").map((media, index) => {
    if (media.state !== "ready")
      throw usageError("Every media item must be a ready image, video, or audio object.");
    return { id: "track_".concat(index + 1), media_id: media.id };
  });
  const pageContent = options.content.filter((media) => media.primitive !== "audio");
  if (pageContent.length === 0)
    throw usageError("A playlist needs at least one page; audio inputs only become its soundtrack.");
  const document = { name: options.name, ...tracks.length > 0 ? { audio: { tracks } } : {}, ...options.format ? { format: options.format } : {}, pages: pageContent.map((media, index) => {
    const live = media.primitive === "iframe" || media.primitive === "application";
    if (!live && (media.state !== "ready" || !["image", "video"].includes(media.primitive)))
      throw usageError("Every media item must be a ready image, video, or audio object.");
    const video = media.primitive === "video";
    return {
      id: "page_".concat(index + 1),
      canvas: { width: options.width, height: options.height, viewport_fit: "contain", background: "#000000FF" },
      transition: { type: "crossfade", duration_ms: 200 },
      // An explicit duration applies to every non-video page; an omitted one
      // holds an application for the contract maximum and other pages for 8 s.
      advance: video ? { mode: "media_end" } : { mode: "duration", after_ms: options.durationMs ?? (media.primitive === "application" ? APPLICATION_PAGE_DURATION_MS : DEFAULT_PAGE_DURATION_MS) },
      primitives: [{
        id: "content",
        primitive: media.primitive,
        ...media.primitive === "iframe" ? { src: media.src, title: media.title } : media.primitive === "application" ? { release_id: media.release_id } : { selector: { by: "id", media_id: media.id } },
        rect: { x: 0, y: 0, width: options.width, height: options.height },
        layer: 0,
        content_fit: live ? "fill" : options.fit,
        ...video ? { muted: true, loop: false } : {}
      }]
    };
  }) };
  assertPlaylistValid(document);
  return document;
}
function targetDimensions(screen, width, height) {
  if (width === void 0 !== (height === void 0))
    throw usageError("Provide both --target-width and --target-height.");
  if (width === void 0) {
    const wall = wallCanvas(screen);
    if (wall)
      return wall;
    const surfaces = screen?.observation?.surfaces;
    if (!Array.isArray(surfaces) || surfaces.length !== 1)
      throw usageError("Screen dimensions are unknown or ambiguous; provide --target-width and --target-height.");
    width = surfaces[0]?.width;
    height = surfaces[0]?.height;
  }
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0)
    throw usageError("Provide positive whole-number target dimensions.");
  return { width, height };
}

// dist/playlist-template-check.js
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var TOKEN = /\{field\.([a-z0-9_]{1,32})\}/g;
var WHOLE_TOKEN = /^\{field\.([a-z0-9_]{1,32})\}$/;
function declaresFields(document) {
  return isObject(document) && Array.isArray(document.fields) && document.fields.length > 0;
}
function withFieldStandIns(document) {
  if (!declaresFields(document))
    return document;
  const copy = structuredClone(document);
  for (const page of Array.isArray(copy.pages) ? copy.pages : []) {
    if (!isObject(page))
      continue;
    for (const primitive of Array.isArray(page.primitives) ? page.primitives : []) {
      if (!isObject(primitive))
        continue;
      const selector = primitive.selector;
      if ((primitive.primitive === "image" || primitive.primitive === "video") && isObject(selector) && selector.by === "id" && typeof selector.media_id === "string" && WHOLE_TOKEN.test(selector.media_id))
        selector.media_id = "med_template_field";
      if (primitive.primitive === "iframe" && typeof primitive.src === "string" && WHOLE_TOKEN.test(primitive.src))
        primitive.src = "https://example.com/field";
    }
  }
  return copy;
}
var SITES = "a field token stands only in a card's params, an image or video selector media_id and an iframe src";
function stringsUnder(value, path, visit) {
  if (typeof value === "string")
    visit(value, path);
  else if (Array.isArray(value))
    value.forEach((item, index) => stringsUnder(item, "".concat(path, "/").concat(index), visit));
  else if (isObject(value))
    for (const [key, item] of Object.entries(value))
      stringsUnder(item, "".concat(path, "/").concat(key), visit);
}
function templateIssues(document) {
  if (!declaresFields(document))
    return [];
  const doc = document;
  const fields = /* @__PURE__ */ new Map();
  for (const field of doc.fields)
    if (isObject(field) && typeof field.name === "string")
      fields.set(field.name, field);
  const issues = [];
  const uses = [];
  const stray = (path) => issues.push({ path, message: SITES });
  const pages = Array.isArray(doc.pages) ? doc.pages : [];
  pages.forEach((page, pageIndex) => {
    if (!isObject(page))
      return;
    const pagePath = "/pages/".concat(pageIndex);
    for (const [key, value] of Object.entries(page)) {
      if (key !== "primitives")
        stringsUnder(value, "".concat(pagePath, "/").concat(key), (text, path) => {
          if (text.includes("{field.") && new RegExp(TOKEN.source).test(text))
            stray(path);
        });
    }
    (Array.isArray(page.primitives) ? page.primitives : []).forEach((primitive, index) => {
      if (!isObject(primitive))
        return;
      const path = "".concat(pagePath, "/primitives/").concat(index);
      const kind = primitive.primitive;
      const before = uses.length;
      for (const [key, value] of Object.entries(primitive)) {
        const keyPath = "".concat(path, "/").concat(key);
        if (key === "params" && kind === "card") {
          stringsUnder(value, keyPath, (text, at) => {
            for (const match of text.matchAll(TOKEN))
              uses.push({ name: match[1], site: "card", path: at });
          });
        } else if (key === "selector" && (kind === "image" || kind === "video") && isObject(value)) {
          for (const [member, item] of Object.entries(value)) {
            const whole = typeof item === "string" ? WHOLE_TOKEN.exec(item) : null;
            if (whole && member === "media_id" && value.by === "id")
              uses.push({ name: whole[1], site: kind, path: "".concat(keyPath, "/media_id") });
            else
              stringsUnder(item, "".concat(keyPath, "/").concat(member), (text, at) => {
                if (new RegExp(TOKEN.source).test(text))
                  stray(at);
              });
          }
        } else if (key === "src" && kind === "iframe" && typeof value === "string") {
          const whole = WHOLE_TOKEN.exec(value);
          if (whole)
            uses.push({ name: whole[1], site: "iframe", path: keyPath });
          else if (new RegExp(TOKEN.source).test(value))
            issues.push({ path: keyPath, message: "an iframe src takes a url field only as the whole address" });
        } else {
          stringsUnder(value, keyPath, (text, at) => {
            if (text.includes("{field.") && new RegExp(TOKEN.source).test(text))
              stray(at);
          });
        }
      }
      if (primitive.locked === true && uses.length > before)
        issues.push({ path: "".concat(path, "/locked"), message: "a locked primitive cannot read a field: locked elements are the template's fixed content" });
    });
  });
  const used = /* @__PURE__ */ new Map();
  for (const use of uses) {
    const field = fields.get(use.name);
    if (!field) {
      issues.push({ path: use.path, message: "{field.".concat(use.name, "} is not a declared field") });
      continue;
    }
    const type = field.type;
    if ((use.site === "image" || use.site === "video") && type !== "media")
      issues.push({ path: use.path, message: "{field.".concat(use.name, "} is a ").concat(String(type), " field; an image or video media_id takes a media field") });
    else if (use.site === "iframe" && type !== "url")
      issues.push({ path: use.path, message: "{field.".concat(use.name, "} is a ").concat(String(type), " field; an iframe src takes a url field") });
    else if (use.site === "card" && type === "media")
      issues.push({ path: use.path, message: "{field.".concat(use.name, "} is a media field; a card's params take text and url fields") });
    const previous = used.get(use.name);
    if ((use.site === "image" || use.site === "video") && previous && previous !== use.site)
      issues.push({ path: use.path, message: "{field.".concat(use.name, "} is used as an ").concat(previous, " and as a ").concat(use.site, "; a media field has one kind") });
    used.set(use.name, use.site);
  }
  doc.fields.forEach((field, index) => {
    if (isObject(field) && typeof field.name === "string" && !used.has(field.name))
      issues.push({ path: "/fields/".concat(index), message: "{field.".concat(field.name, "} is declared but no page uses it") });
  });
  return issues;
}

// dist/playlist-validate.js
function buildValidators() {
  const asset = "playlist-write-v2.schema.json";
  const ajv = new import__.Ajv2020({ allErrors: true, strict: true });
  import_ajv_formats.default.default(ajv);
  const schema = JSON.parse(readAsset(asset).toString("utf8"));
  const validate = ajv.compile(schema);
  const diagnosticSchema = structuredClone(schema);
  const pageUnion = diagnosticSchema.$defs.PlaylistPageWriteV2;
  if (Array.isArray(pageUnion?.oneOf) && diagnosticSchema.$defs.AdslotPageWrite && diagnosticSchema.$defs.PlaylistPageWrite) {
    delete pageUnion.oneOf;
    pageUnion.if = { type: "object", properties: { type: { const: "adslot" } }, required: ["type"] };
    pageUnion.then = { $ref: "#/$defs/AdslotPageWrite" };
    pageUnion.else = { $ref: "#/$defs/PlaylistPageWrite" };
  }
  for (const definition of Object.values(diagnosticSchema.$defs)) {
    if (!Array.isArray(definition.oneOf))
      continue;
    const branches = definition.oneOf.map((item) => item.$ref?.startsWith("#/$defs/") ? diagnosticSchema.$defs[item.$ref.slice(8)] : void 0);
    if (branches.some((branch) => !branch?.properties))
      continue;
    for (const key of Object.keys(branches[0].properties)) {
      const tags = branches.map((branch) => branch.required?.includes(key) && branch.properties[key]?.enum?.length === 1 ? branch.properties[key].enum[0] : void 0);
      if (tags.every((tag) => typeof tag === "string") && new Set(tags).size === branches.length) {
        definition.type = "object";
        definition.discriminator = { propertyName: key };
        break;
      }
    }
  }
  const diagnosticAjv = new import__.Ajv2020({ allErrors: true, strict: true, discriminator: true });
  import_ajv_formats.default.default(diagnosticAjv);
  const diagnose = diagnosticAjv.compile(diagnosticSchema);
  return { validate, diagnose };
}
var compiled;
function cached() {
  return compiled ??= buildValidators();
}
var PLAYLIST_SERVER_CHECKS = ["reference authorization and readiness", "media durations", "DNS and remote availability"];
function adslotPageIssues(pages) {
  const issues = [];
  const adslots = pages.reduce((count, page) => count + (isAdSlotPage(page) ? 1 : 0), 0);
  if (adslots > 16) {
    issues.push({ path: "/pages", message: "must contain at most 16 adslot pages so player lookahead stays bounded" });
  }
  const ordinaryUnscheduled = pages.some((page) => !isAdSlotPage(page) && (typeof page !== "object" || page === null || !Object.hasOwn(page, "visibility")));
  if (!ordinaryUnscheduled) {
    issues.push({ path: "/pages", message: "must retain at least one ordinary page with no visibility rule as the ad-slot fallback" });
  }
  return issues;
}
function playlistIssues(value) {
  if (declaresFields(value)) {
    const issues = playlistDocumentIssues(withFieldStandIns(value));
    return issues.length ? issues : templateIssues(value);
  }
  return playlistDocumentIssues(value);
}
function playlistDocumentIssues(value) {
  const pages = value !== null && typeof value === "object" && !Array.isArray(value) && "pages" in value && Array.isArray(value.pages) ? value.pages : void 0;
  const adslot = pages?.some(isAdSlotPage) === true;
  const { validate, diagnose } = cached();
  if (!validate(value)) {
    diagnose(value);
    const errors = diagnose.errors ?? validate.errors ?? [];
    const issues = errors.filter((error) => error.keyword !== "oneOf" && error.keyword !== "anyOf" && error.keyword !== "if").map((error) => ({
      path: error.instancePath + (error.keyword === "additionalProperties" ? "/".concat(String(error.params.additionalProperty).replaceAll("~", "~0").replaceAll("/", "~1")) : error.keyword === "required" ? "/".concat(String(error.params.missingProperty)) : ""),
      message: error.keyword === "false schema" && /\/then\/properties\/(major|params)\/false schema$/.test(error.schemaPath) ? "belongs to the card instance; send only its UID" : error.keyword === "additionalProperties" && error.instancePath.endsWith("/enter") ? "unsupported entry field; keep only type and optional stagger (player timing is fixed)" : error.message ?? "does not match the canonical playlist schema"
    }));
    return [...new Map(issues.map((issue) => ["".concat(issue.path, ":").concat(issue.message), issue])).values()];
  }
  const transitionIssues = (pages ?? []).flatMap((page, index) => {
    if (!page || typeof page !== "object" || Array.isArray(page) || isAdSlotPage(page))
      return [];
    const issue = playlistTransitionIssue(page.transition);
    if (!issue)
      return [];
    const suffix = issue.path.map((key) => "/".concat(key.replaceAll("~", "~0").replaceAll("/", "~1"))).join("");
    return [{ path: "/pages/".concat(index, "/transition").concat(suffix), message: issue.message }];
  });
  if (transitionIssues.length)
    return transitionIssues;
  return adslot && pages ? [...validatePlaylistWriteSemantics(value), ...adslotPageIssues(pages)] : validatePlaylistWriteSemantics(value);
}
function assertPlaylistValid(value) {
  const errors = playlistIssues(value);
  if (errors.length)
    throw new CliError(makeProblem("usage_error", "Playlist is not valid", 400, "Local canonical validation found ".concat(errors.length, " issue(s). Fix the reported JSON paths before uploading or publishing."), { errors }), ExitCode.Usage);
}
function playlistLint(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return [];
  const pages = value.pages;
  return Array.isArray(pages) ? lintPlaylistPages(pages) : [];
}

export {
  playlistNeedsTimezone,
  iframeSnippetSource,
  hasScreenToken2 as hasScreenToken,
  screenTokenStandIn2 as screenTokenStandIn,
  screenTemplateRefusal2 as screenTemplateRefusal,
  validatePlaylistWrite,
  assertWirePages,
  PLAYLIST_SERVER_CHECKS,
  assertPlaylistValid,
  playlistLint,
  WALL_ARRANGEMENTS,
  WALL_ROTATIONS,
  wallOutputsOption,
  wallFromFlags,
  wallLine,
  wallSize,
  wallProblem,
  editablePlaylist,
  isAdSlotPage,
  shortApplicationPageWarning,
  preparePlaylist,
  targetDimensions
};
