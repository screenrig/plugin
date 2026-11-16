import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  readAsset
} from "./chunk-4QJFIFQH.js";
import {
  flatPrimitives,
  playlistTransitionIssue,
  require__,
  require_ajv,
  validatePlaylistWriteSemantics
} from "./chunk-ZARW5VRV.js";
import {
  require_codegen
} from "./chunk-TXFBSTEK.js";
import {
  CliError,
  ExitCode,
  makeProblem,
  usageError
} from "./chunk-VYWS3KLY.js";
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
    var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function date(str) {
      const matches = DATE.exec(str);
      if (!matches)
        return false;
      const year = +matches[1];
      const month = +matches[2];
      const day = +matches[3];
      return month >= 1 && month <= 12 && day >= 1 && day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]);
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
    const record = selector;
    if (typeof record.media_id === "string")
      return "id:".concat(record.media_id);
    if (Array.isArray(record.media_ids))
      return "ids:".concat(record.media_ids.filter((id) => typeof id === "string").sort().join(","));
    if (typeof record.tag === "string")
      return "tag:".concat(record.tag);
    if (typeof record.folder_id === "string")
      return "folder:".concat(record.folder_id);
    if (record.by === "all")
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
  if (names.length < 1 || names.length > MAX_OUTPUTS) {
    throw usageError("".concat(flag, " takes 1 to ").concat(MAX_OUTPUTS, " comma-separated output names in physical order, left to right then top to bottom, for example ").concat(flag, " HDMI-A-1,HDMI-A-2 (one name rotates a single screen)."));
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
  if (arrangement !== void 0 && !WALL_ARRANGEMENTS.includes(arrangement))
    throw usageError("--arrangement must be row, column, or grid.");
  if (rotation !== void 0 && !WALL_ROTATIONS.includes(rotation))
    throw usageError("--rotation must be 0, 90, 180, or 270.");
  const names = wallOutputs(outputs);
  if (names.length === 1) {
    if (arrangement !== void 0 && arrangement !== "row")
      throw usageError("--arrangement ".concat(arrangement, " needs two or more outputs; one output rotates a single screen, so leave --arrangement out or use row."));
    if (columns !== void 0)
      throw usageError("--columns is only for a grid of two or more outputs; one output rotates a single screen.");
  }
  return {
    outputs: names,
    arrangement: arrangement ?? "row",
    ...columns === void 0 ? {} : { columns: Number(columns) },
    ...rotation === void 0 ? {} : { rotation: Number(rotation) }
  };
}
function wallLine(wall) {
  if (wall.outputs.length === 1)
    return "".concat(wall.outputs[0], " (single screen, rotation ").concat(wall.rotation ?? 0, ")");
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
  if (count < 1 || count > MAX_OUTPUTS || !WALL_ARRANGEMENTS.includes(arrangement) || grid && !(Number.isInteger(columns) && columns >= 2 && count % columns === 0 && count / columns >= 2) || rotation !== void 0 && ![0, 90, 180, 270].includes(rotation)) {
    throw usageError("Screen response has an invalid video wall.");
  }
  const portrait = rotation === 90 || rotation === 270;
  if (count === 1)
    return wallSize(1, "row", portrait);
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
    detail: "".concat(error.problem.detail, " Nothing was changed. A video wall of two or more displays needs the Linux Player's kiosk install (cage and wlr-randr) or the Windows Player, which declare the display.wall capability, and one rotated screen needs the Linux Player's kiosk install, which declares display.rotate. screen show lists host.capabilities; this screen's Player did not declare the one this layout needs."),
    next: { command: "screenrig screen show ".concat(id), reason: "Check host.capabilities for display.wall (two or more outputs) or display.rotate (one output) and observation.surfaces for the Player's output names." }
  }, error.exitCode, error.warnings);
}

// dist/playlist-authoring.js
var DEFAULT_PAGE_DURATION_MS = 8e3;
var APPLICATION_PAGE_DURATION_MS = 864e5;
var APPLICATION_SHORT_PAGE_MS = 6e4;
function object(value) {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw usageError("Expected a playlist object.");
  return value;
}
var CARD_INSTANCE_UID = /^(?:(?:stage|qa|development)_)?crd_[A-Za-z0-9_-]+$/;
function authoringPrimitive(primitive) {
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
  if (primitive.primitive === "container" && Array.isArray(primitive.items)) {
    for (const item of primitive.items)
      authoringPrimitive(object(item));
  }
  return primitive;
}
function editablePlaylist(value) {
  const resource = object(value);
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
    object(page);
    if (page.type === "adslot")
      continue;
    delete page.comments;
    if (page.advance?.mode === "media_end" || page.advance?.mode === "audio_end")
      delete page.advance.max_ms;
    if (!Array.isArray(page.primitives))
      throw usageError("Playlist primitives are missing.");
    for (const primitive of page.primitives)
      authoringPrimitive(object(primitive));
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
        ...video ? { muted: options.sound !== true, loop: false } : {}
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
    for (const { primitive } of flatPrimitives(page.primitives)) {
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
  const scanPrimitive = (primitive, path) => {
    const kind = primitive.primitive;
    for (const [key, value] of Object.entries(primitive)) {
      const keyPath = "".concat(path, "/").concat(key);
      if (key === "items" && kind === "container")
        continue;
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
  };
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
      const before = uses.length;
      scanPrimitive(primitive, path);
      (primitive.primitive === "container" && Array.isArray(primitive.items) ? primitive.items : []).forEach((item, itemIndex) => {
        if (isObject(item))
          scanPrimitive(item, "".concat(path, "/items/").concat(itemIndex));
      });
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
