import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  decodeHTML,
  require_discriminator,
  require_draft2020,
  require_draft7
} from "./chunk-IZRCMRT5.js";
import {
  RESOURCE_ID_PATTERNS
} from "./chunk-SFYZH3GR.js";
import {
  require_data,
  require_json_schema_2020_12,
  require_json_schema_draft_07,
  require_uri
} from "./chunk-IYX5JHXW.js";
import {
  require_codegen,
  require_compile,
  require_dataType,
  require_ref_error,
  require_resolve,
  require_rules,
  require_util,
  require_validate,
  require_validation_error
} from "./chunk-TXFBSTEK.js";
import {
  CliError,
  usageError
} from "./chunk-VYWS3KLY.js";
import {
  __commonJS,
  __export
} from "./chunk-3FYAGULW.js";

// node_modules/ajv/dist/core.js
var require_core = __commonJS({
  "node_modules/ajv/dist/core.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    var ref_error_1 = require_ref_error();
    var rules_1 = require_rules();
    var compile_1 = require_compile();
    var codegen_2 = require_codegen();
    var resolve_1 = require_resolve();
    var dataType_1 = require_dataType();
    var util_1 = require_util();
    var $dataRefSchema = require_data();
    var uri_1 = require_uri();
    var defaultRegExp = (str, flags) => new RegExp(str, flags);
    defaultRegExp.code = "new RegExp";
    var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
    var EXT_SCOPE_NAMES = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]);
    var removedOptions = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    };
    var deprecatedOptions = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    };
    var MAX_EXPRESSION = 200;
    function requiredOptions(o) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
      const s = o.strict;
      const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
      const optimize = _optz === true || _optz === void 0 ? 1 : _optz || 0;
      const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
      const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
      return {
        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
        uriResolver
      };
    }
    var Ajv = class {
      constructor(opts = {}) {
        this.schemas = {};
        this.refs = {};
        this.formats = {};
        this._compilations = /* @__PURE__ */ new Set();
        this._loading = {};
        this._cache = /* @__PURE__ */ new Map();
        opts = this.opts = { ...opts, ...requiredOptions(opts) };
        const { es5, lines } = this.opts.code;
        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
        this.logger = getLogger(opts.logger);
        const formatOpt = opts.validateFormats;
        opts.validateFormats = false;
        this.RULES = (0, rules_1.getRules)();
        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
        this._metaOpts = getMetaSchemaOptions.call(this);
        if (opts.formats)
          addInitialFormats.call(this);
        this._addVocabularies();
        this._addDefaultMetaSchema();
        if (opts.keywords)
          addInitialKeywords.call(this, opts.keywords);
        if (typeof opts.meta == "object")
          this.addMetaSchema(opts.meta);
        addInitialSchemas.call(this);
        opts.validateFormats = formatOpt;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data, meta, schemaId } = this.opts;
        let _dataRefSchema = $dataRefSchema;
        if (schemaId === "id") {
          _dataRefSchema = { ...$dataRefSchema };
          _dataRefSchema.id = _dataRefSchema.$id;
          delete _dataRefSchema.$id;
        }
        if (meta && $data)
          this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
      }
      defaultMeta() {
        const { meta, schemaId } = this.opts;
        return this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : void 0;
      }
      validate(schemaKeyRef, data) {
        let v;
        if (typeof schemaKeyRef == "string") {
          v = this.getSchema(schemaKeyRef);
          if (!v)
            throw new Error('no schema with key or ref "'.concat(schemaKeyRef, '"'));
        } else {
          v = this.compile(schemaKeyRef);
        }
        const valid = v(data);
        if (!("$async" in v))
          this.errors = v.errors;
        return valid;
      }
      compile(schema, _meta) {
        const sch = this._addSchema(schema, _meta);
        return sch.validate || this._compileSchemaEnv(sch);
      }
      compileAsync(schema, meta) {
        if (typeof this.opts.loadSchema != "function") {
          throw new Error("options.loadSchema should be a function");
        }
        const { loadSchema } = this.opts;
        return runCompileAsync.call(this, schema, meta);
        async function runCompileAsync(_schema, _meta) {
          await loadMetaSchema.call(this, _schema.$schema);
          const sch = this._addSchema(_schema, _meta);
          return sch.validate || _compileAsync.call(this, sch);
        }
        async function loadMetaSchema($ref) {
          if ($ref && !this.getSchema($ref)) {
            await runCompileAsync.call(this, { $ref }, true);
          }
        }
        async function _compileAsync(sch) {
          try {
            return this._compileSchemaEnv(sch);
          } catch (e) {
            if (!(e instanceof ref_error_1.default))
              throw e;
            checkLoaded.call(this, e);
            await loadMissingSchema.call(this, e.missingSchema);
            return _compileAsync.call(this, sch);
          }
        }
        function checkLoaded({ missingSchema: ref, missingRef }) {
          if (this.refs[ref]) {
            throw new Error("AnySchema ".concat(ref, " is loaded but ").concat(missingRef, " cannot be resolved"));
          }
        }
        async function loadMissingSchema(ref) {
          const _schema = await _loadSchema.call(this, ref);
          if (!this.refs[ref])
            await loadMetaSchema.call(this, _schema.$schema);
          if (!this.refs[ref])
            this.addSchema(_schema, ref, meta);
        }
        async function _loadSchema(ref) {
          const p = this._loading[ref];
          if (p)
            return p;
          try {
            return await (this._loading[ref] = loadSchema(ref));
          } finally {
            delete this._loading[ref];
          }
        }
      }
      // Adds schema to the instance
      addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
        if (Array.isArray(schema)) {
          for (const sch of schema)
            this.addSchema(sch, void 0, _meta, _validateSchema);
          return this;
        }
        let id;
        if (typeof schema === "object") {
          const { schemaId } = this.opts;
          id = schema[schemaId];
          if (id !== void 0 && typeof id != "string") {
            throw new Error("schema ".concat(schemaId, " must be string"));
          }
        }
        key = (0, resolve_1.normalizeId)(key || id);
        this._checkUnique(key);
        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
        return this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
        this.addSchema(schema, key, true, _validateSchema);
        return this;
      }
      //  Validate schema against its meta-schema
      validateSchema(schema, throwOrLogError) {
        if (typeof schema == "boolean")
          return true;
        let $schema;
        $schema = schema.$schema;
        if ($schema !== void 0 && typeof $schema != "string") {
          throw new Error("$schema must be a string");
        }
        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
        if (!$schema) {
          this.logger.warn("meta-schema not available");
          this.errors = null;
          return true;
        }
        const valid = this.validate($schema, schema);
        if (!valid && throwOrLogError) {
          const message = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(message);
          else
            throw new Error(message);
        }
        return valid;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(keyRef) {
        let sch;
        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
          keyRef = sch;
        if (sch === void 0) {
          const { schemaId } = this.opts;
          const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
          sch = compile_1.resolveSchema.call(this, root, keyRef);
          if (!sch)
            return;
          this.refs[keyRef] = sch;
        }
        return sch.validate || this._compileSchemaEnv(sch);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(schemaKeyRef) {
        if (schemaKeyRef instanceof RegExp) {
          this._removeAllSchemas(this.schemas, schemaKeyRef);
          this._removeAllSchemas(this.refs, schemaKeyRef);
          return this;
        }
        switch (typeof schemaKeyRef) {
          case "undefined":
            this._removeAllSchemas(this.schemas);
            this._removeAllSchemas(this.refs);
            this._cache.clear();
            return this;
          case "string": {
            const sch = getSchEnv.call(this, schemaKeyRef);
            if (typeof sch == "object")
              this._cache.delete(sch.schema);
            delete this.schemas[schemaKeyRef];
            delete this.refs[schemaKeyRef];
            return this;
          }
          case "object": {
            const cacheKey = schemaKeyRef;
            this._cache.delete(cacheKey);
            let id = schemaKeyRef[this.opts.schemaId];
            if (id) {
              id = (0, resolve_1.normalizeId)(id);
              delete this.schemas[id];
              delete this.refs[id];
            }
            return this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(definitions) {
        for (const def of definitions)
          this.addKeyword(def);
        return this;
      }
      addKeyword(kwdOrDef, def) {
        let keyword;
        if (typeof kwdOrDef == "string") {
          keyword = kwdOrDef;
          if (typeof def == "object") {
            this.logger.warn("these parameters are deprecated, see docs for addKeyword");
            def.keyword = keyword;
          }
        } else if (typeof kwdOrDef == "object" && def === void 0) {
          def = kwdOrDef;
          keyword = def.keyword;
          if (Array.isArray(keyword) && !keyword.length) {
            throw new Error("addKeywords: keyword must be string or non-empty array");
          }
        } else {
          throw new Error("invalid addKeywords parameters");
        }
        checkKeyword.call(this, keyword, def);
        if (!def) {
          (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
          return this;
        }
        keywordMetaschema.call(this, def);
        const definition = {
          ...def,
          type: (0, dataType_1.getJSONTypes)(def.type),
          schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
        };
        (0, util_1.eachItem)(keyword, definition.type.length === 0 ? (k) => addRule.call(this, k, definition) : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
        return this;
      }
      getKeyword(keyword) {
        const rule = this.RULES.all[keyword];
        return typeof rule == "object" ? rule.definition : !!rule;
      }
      // Remove keyword
      removeKeyword(keyword) {
        const { RULES } = this;
        delete RULES.keywords[keyword];
        delete RULES.all[keyword];
        for (const group of RULES.rules) {
          const i = group.rules.findIndex((rule) => rule.keyword === keyword);
          if (i >= 0)
            group.rules.splice(i, 1);
        }
        return this;
      }
      // Add format
      addFormat(name, format) {
        if (typeof format == "string")
          format = new RegExp(format);
        this.formats[name] = format;
        return this;
      }
      errorsText(errors = this.errors, { separator = ", ", dataVar = "data" } = {}) {
        if (!errors || errors.length === 0)
          return "No errors";
        return errors.map((e) => "".concat(dataVar).concat(e.instancePath, " ").concat(e.message)).reduce((text, msg) => text + separator + msg);
      }
      $dataMetaSchema(metaSchema, keywordsJsonPointers) {
        const rules = this.RULES.all;
        metaSchema = JSON.parse(JSON.stringify(metaSchema));
        for (const jsonPointer of keywordsJsonPointers) {
          const segments = jsonPointer.split("/").slice(1);
          let keywords = metaSchema;
          for (const seg of segments)
            keywords = keywords[seg];
          for (const key in rules) {
            const rule = rules[key];
            if (typeof rule != "object")
              continue;
            const { $data } = rule.definition;
            const schema = keywords[key];
            if ($data && schema)
              keywords[key] = schemaOrData(schema);
          }
        }
        return metaSchema;
      }
      _removeAllSchemas(schemas, regex) {
        for (const keyRef in schemas) {
          const sch = schemas[keyRef];
          if (!regex || regex.test(keyRef)) {
            if (typeof sch == "string") {
              delete schemas[keyRef];
            } else if (sch && !sch.meta) {
              this._cache.delete(sch.schema);
              delete schemas[keyRef];
            }
          }
        }
      }
      _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
        let id;
        const { schemaId } = this.opts;
        if (typeof schema == "object") {
          id = schema[schemaId];
        } else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          else if (typeof schema != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let sch = this._cache.get(schema);
        if (sch !== void 0)
          return sch;
        baseId = (0, resolve_1.normalizeId)(id || baseId);
        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
        this._cache.set(sch.schema, sch);
        if (addSchema && !baseId.startsWith("#")) {
          if (baseId)
            this._checkUnique(baseId);
          this.refs[baseId] = sch;
        }
        if (validateSchema)
          this.validateSchema(schema, true);
        return sch;
      }
      _checkUnique(id) {
        if (this.schemas[id] || this.refs[id]) {
          throw new Error('schema with key or id "'.concat(id, '" already exists'));
        }
      }
      _compileSchemaEnv(sch) {
        if (sch.meta)
          this._compileMetaSchema(sch);
        else
          compile_1.compileSchema.call(this, sch);
        if (!sch.validate)
          throw new Error("ajv implementation error");
        return sch.validate;
      }
      _compileMetaSchema(sch) {
        const currentOpts = this.opts;
        this.opts = this._metaOpts;
        try {
          compile_1.compileSchema.call(this, sch);
        } finally {
          this.opts = currentOpts;
        }
      }
    };
    Ajv.ValidationError = validation_error_1.default;
    Ajv.MissingRefError = ref_error_1.default;
    exports.default = Ajv;
    function checkOptions(checkOpts, options, msg, log = "error") {
      for (const key in checkOpts) {
        const opt = key;
        if (opt in options)
          this.logger[log]("".concat(msg, ": option ").concat(key, ". ").concat(checkOpts[opt]));
      }
    }
    function getSchEnv(keyRef) {
      keyRef = (0, resolve_1.normalizeId)(keyRef);
      return this.schemas[keyRef] || this.refs[keyRef];
    }
    function addInitialSchemas() {
      const optsSchemas = this.opts.schemas;
      if (!optsSchemas)
        return;
      if (Array.isArray(optsSchemas))
        this.addSchema(optsSchemas);
      else
        for (const key in optsSchemas)
          this.addSchema(optsSchemas[key], key);
    }
    function addInitialFormats() {
      for (const name in this.opts.formats) {
        const format = this.opts.formats[name];
        if (format)
          this.addFormat(name, format);
      }
    }
    function addInitialKeywords(defs) {
      if (Array.isArray(defs)) {
        this.addVocabulary(defs);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const keyword in defs) {
        const def = defs[keyword];
        if (!def.keyword)
          def.keyword = keyword;
        this.addKeyword(def);
      }
    }
    function getMetaSchemaOptions() {
      const metaOpts = { ...this.opts };
      for (const opt of META_IGNORE_OPTIONS)
        delete metaOpts[opt];
      return metaOpts;
    }
    var noLogs = { log() {
    }, warn() {
    }, error() {
    } };
    function getLogger(logger) {
      if (logger === false)
        return noLogs;
      if (logger === void 0)
        return console;
      if (logger.log && logger.warn && logger.error)
        return logger;
      throw new Error("logger must implement log, warn and error methods");
    }
    var KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
    function checkKeyword(keyword, def) {
      const { RULES } = this;
      (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
          throw new Error("Keyword ".concat(kwd, " is already defined"));
        if (!KEYWORD_NAME.test(kwd))
          throw new Error("Keyword ".concat(kwd, " has invalid name"));
      });
      if (!def)
        return;
      if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
      }
    }
    function addRule(keyword, definition, dataType) {
      var _a;
      const post = definition === null || definition === void 0 ? void 0 : definition.post;
      if (dataType && post)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES } = this;
      let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
      if (!ruleGroup) {
        ruleGroup = { type: dataType, rules: [] };
        RULES.rules.push(ruleGroup);
      }
      RULES.keywords[keyword] = true;
      if (!definition)
        return;
      const rule = {
        keyword,
        definition: {
          ...definition,
          type: (0, dataType_1.getJSONTypes)(definition.type),
          schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
        }
      };
      if (definition.before)
        addBeforeRule.call(this, ruleGroup, rule, definition.before);
      else
        ruleGroup.rules.push(rule);
      RULES.all[keyword] = rule;
      (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
    }
    function addBeforeRule(ruleGroup, rule, before) {
      const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
      if (i >= 0) {
        ruleGroup.rules.splice(i, 0, rule);
      } else {
        ruleGroup.rules.push(rule);
        this.logger.warn("rule ".concat(before, " is not defined"));
      }
    }
    function keywordMetaschema(def) {
      let { metaSchema } = def;
      if (metaSchema === void 0)
        return;
      if (def.$data && this.opts.$data)
        metaSchema = schemaOrData(metaSchema);
      def.validateSchema = this.compile(metaSchema, true);
    }
    var $dataRef = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function schemaOrData(schema) {
      return { anyOf: [schema, $dataRef] };
    }
  }
});

// node_modules/ajv/dist/ajv.js
var require_ajv = __commonJS({
  "node_modules/ajv/dist/ajv.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv = void 0;
    var core_1 = require_core();
    var draft7_1 = require_draft7();
    var discriminator_1 = require_discriminator();
    var draft7MetaSchema = require_json_schema_draft_07();
    var META_SUPPORT_DATA = ["/properties"];
    var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
    var Ajv = class extends core_1.default {
      _addVocabularies() {
        super._addVocabularies();
        draft7_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        if (!this.opts.meta)
          return;
        const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv = Ajv;
    module.exports = exports = Ajv;
    module.exports.Ajv = Ajv;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// node_modules/ajv/dist/2020.js
var require__ = __commonJS({
  "node_modules/ajv/dist/2020.js"(exports, module) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MissingRefError = exports.ValidationError = exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = exports.Ajv2020 = void 0;
    var core_1 = require_core();
    var draft2020_1 = require_draft2020();
    var discriminator_1 = require_discriminator();
    var json_schema_2020_12_1 = require_json_schema_2020_12();
    var META_SCHEMA_ID = "https://json-schema.org/draft/2020-12/schema";
    var Ajv2020 = class extends core_1.default {
      constructor(opts = {}) {
        super({
          ...opts,
          dynamicRef: true,
          next: true,
          unevaluated: true
        });
      }
      _addVocabularies() {
        super._addVocabularies();
        draft2020_1.default.forEach((v) => this.addVocabulary(v));
        if (this.opts.discriminator)
          this.addKeyword(discriminator_1.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data, meta } = this.opts;
        if (!meta)
          return;
        json_schema_2020_12_1.default.call(this, $data);
        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
      }
    };
    exports.Ajv2020 = Ajv2020;
    module.exports = exports = Ajv2020;
    module.exports.Ajv2020 = Ajv2020;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ajv2020;
    var validate_1 = require_validate();
    Object.defineProperty(exports, "KeywordCxt", { enumerable: true, get: function() {
      return validate_1.KeywordCxt;
    } });
    var codegen_1 = require_codegen();
    Object.defineProperty(exports, "_", { enumerable: true, get: function() {
      return codegen_1._;
    } });
    Object.defineProperty(exports, "str", { enumerable: true, get: function() {
      return codegen_1.str;
    } });
    Object.defineProperty(exports, "stringify", { enumerable: true, get: function() {
      return codegen_1.stringify;
    } });
    Object.defineProperty(exports, "nil", { enumerable: true, get: function() {
      return codegen_1.nil;
    } });
    Object.defineProperty(exports, "Name", { enumerable: true, get: function() {
      return codegen_1.Name;
    } });
    Object.defineProperty(exports, "CodeGen", { enumerable: true, get: function() {
      return codegen_1.CodeGen;
    } });
    var validation_error_1 = require_validation_error();
    Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function() {
      return validation_error_1.default;
    } });
    var ref_error_1 = require_ref_error();
    Object.defineProperty(exports, "MissingRefError", { enumerable: true, get: function() {
      return ref_error_1.default;
    } });
  }
});

// dist/backgrounds.js
var backgrounds_exports = {};
__export(backgrounds_exports, {
  BACKGROUNDS_PATH: () => BACKGROUNDS_PATH,
  BACKGROUND_COLOR_PATTERN: () => BACKGROUND_COLOR_PATTERN,
  BACKGROUND_ID_MAX: () => BACKGROUND_ID_MAX,
  BACKGROUND_ID_PATTERN: () => BACKGROUND_ID_PATTERN,
  BACKGROUND_ORIENTATIONS: () => BACKGROUND_ORIENTATIONS,
  DEFAULT_BACKGROUND_COLOR: () => DEFAULT_BACKGROUND_COLOR,
  backgroundColor: () => backgroundColor,
  backgroundId: () => backgroundId,
  backgroundOrSetId: () => backgroundOrSetId,
  backgroundUrl: () => backgroundUrl,
  imageBackgroundOf: () => imageBackgroundOf,
  isBackgroundId: () => isBackgroundId,
  setBackgroundColor: () => setBackgroundColor,
  withCanvasBackground: () => withCanvasBackground
});
var BACKGROUNDS_PATH = "/api/backgrounds";
var BACKGROUND_ID_PATTERN = /^bg_[a-z0-9][a-z0-9._-]*-[0-9a-f]{8}$/;
var BACKGROUND_ID_MAX = 160;
var BACKGROUND_COLOR_PATTERN = /^#[0-9A-F]{8}$/;
var DEFAULT_BACKGROUND_COLOR = "#000000FF";
var BACKGROUND_ORIENTATIONS = ["landscape", "portrait"];
function isBackgroundId(value) {
  return typeof value === "string" && value.length <= BACKGROUND_ID_MAX && BACKGROUND_ID_PATTERN.test(value);
}
function backgroundId(value) {
  if (!isBackgroundId(value)) {
    throw usageError("A background id starts with bg_ and names one image, such as bg_blockbuster-laser-rush__landscape__bottom-banner-73d2f112.", {
      command: "screenrig background sets",
      reason: "List the sets, then background show SET_ID lists a set's image ids."
    });
  }
  return value;
}
function backgroundOrSetId(value) {
  if (value.startsWith("bg_"))
    return backgroundId(value);
  if (!value || value.length > BACKGROUND_ID_MAX) {
    throw usageError("Give a set id or a background id (bg_...).", { command: "screenrig background sets", reason: "List the sets and their ids." });
  }
  return value;
}
function backgroundColor(value) {
  const color = value.toUpperCase();
  if (!BACKGROUND_COLOR_PATTERN.test(color)) {
    throw usageError("--color takes #RRGGBBAA, such as #09111BFF (quote it in a shell).");
  }
  return color;
}
function setBackgroundColor(group) {
  const first = Array.isArray(group?.colors) ? group.colors[0] : void 0;
  return typeof first === "string" && /^#[0-9A-Fa-f]{6}$/.test(first) ? "".concat(first.toUpperCase(), "FF") : DEFAULT_BACKGROUND_COLOR;
}
var isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
function imageBackgroundOf(page) {
  const canvas = isObject(page) && isObject(page.canvas) ? page.canvas : void 0;
  const background = canvas && isObject(canvas.background) ? canvas.background : void 0;
  if (!background || background.type !== "image" || typeof background.background_id !== "string")
    return void 0;
  const color = typeof background.color === "string" && BACKGROUND_COLOR_PATTERN.test(background.color) ? background.color : void 0;
  return { background_id: background.background_id, ...color ? { color } : {} };
}
function withCanvasBackground(page, background) {
  if (!isObject(page.canvas)) {
    throw usageError("Page ".concat(String(page.id), " has no canvas, so it has no background to set."));
  }
  return { ...page, canvas: { ...page.canvas, background } };
}
function backgroundUrl(path, apiUrl) {
  if (!path)
    return "";
  if (!path.startsWith("/"))
    return path;
  try {
    return new URL(path, apiUrl).toString();
  } catch {
    return path;
  }
}

// dist/generated/playlist-write-semantics.js
var playlist_write_semantics_exports = {};
__export(playlist_write_semantics_exports, {
  decodeAttributeEntities: () => decodeAttributeEntities,
  playlistNeedsTimezone: () => playlistNeedsTimezone,
  validatePlaylistWriteSemantics: () => validatePlaylistWriteSemantics
});
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
var MAX_PRIMITIVES = 24;
var MAX_CONTAINERS = 4;
var CONTAINER_REFUSED = ["content_fit", "controller", "motion"];
function cardLayoutIssue(card) {
  const layout = card.layout;
  const anchors = layout === "corner" || layout === "chip" ? CORNERS : layout === "strip" ? EDGES : [];
  if (typeof layout !== "string" || !LAYOUTS.includes(layout))
    return { member: "layout", message: "is required and must be one of ".concat(LAYOUTS.join(", ")) };
  if (anchors.length === 0 && Object.hasOwn(card, "anchor"))
    return { member: "anchor", message: "is not allowed for layout ".concat(layout) };
  if (anchors.length > 0 && !anchors.includes(card.anchor))
    return { member: "anchor", message: "is required for layout ".concat(layout, " and must be one of ").concat(anchors.join(", ")) };
  return void 0;
}
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
    let controllers = 0, web = 0, streams = 0, containers = 0, counted = primitives.length;
    const videoTurns = [];
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
        const layoutIssue = cardLayoutIssue(primitive);
        if (layoutIssue !== void 0)
          fail("".concat(itemPath, "/").concat(layoutIssue.member), layoutIssue.message);
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
      if (primitive.primitive === "container") {
        containers++;
        if (containers > MAX_CONTAINERS)
          fail(itemPath, "a page holds at most ".concat(MAX_CONTAINERS, " containers"));
        for (const key of CONTAINER_REFUSED)
          if (Object.hasOwn(primitive, key))
            fail("".concat(itemPath, "/").concat(key), "is not allowed on a container: each item fits its own content");
        const turn = object(primitive.turn), turnPath = "".concat(itemPath, "/turn");
        if (turn.on === "clock") {
          for (const key of ["match", "no_match"])
            if (Object.hasOwn(turn, key))
              fail("".concat(turnPath, "/").concat(key), "is allowed only with on video");
        }
        if (turn.on === "video")
          videoTurns.push("".concat(turnPath, "/on"));
        if (typeof turn.every_ms === "number" && typeof turn.offset_ms === "number" && turn.offset_ms >= turn.every_ms)
          fail("".concat(turnPath, "/offset_ms"), "must be less than every_ms");
        const items = array(primitive.items).map(object);
        counted += items.length;
        let plain = 0;
        for (const [childIndex, child] of items.entries()) {
          const childPath = "".concat(itemPath, "/items/").concat(childIndex);
          if (ids.has(child.id))
            fail("".concat(childPath, "/id"), "must be unique within the page, across primitives and container items");
          ids.add(child.id);
          if (!Object.hasOwn(child, "when"))
            plain++;
          if (child.primitive === "image") {
            if (object(child.selector).by !== "id")
              fail("".concat(childPath, "/selector/by"), "must be id: a container's image item shows one media object");
          } else if (child.primitive === "card") {
            const layoutIssue = cardLayoutIssue(child);
            if (layoutIssue !== void 0)
              fail("".concat(childPath, "/").concat(layoutIssue.member), layoutIssue.message);
          } else if (typeof child.primitive === "string")
            fail("".concat(childPath, "/primitive"), "must be card or image: a container holds cards and images");
        }
        if (items.length > 0 && plain === 0)
          fail("".concat(itemPath, "/items"), "must hold at least one item without when");
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
        if (mode === "duration" || mode === "application" || mode === "audio_end" || mode === "media_end") {
          if (Object.hasOwn(primitive, "dwell_ms"))
            fail("".concat(itemPath, "/dwell_ms"), "is forbidden on duration, application, audio_end and media_end pages");
          const selector = object(primitive.selector);
          if ((mode !== "media_end" || primitive.primitive === "image") && (selector.by === "all" || selector.by === "tag" || selector.by === "folder" || selector.by === "ids" && array(selector.media_ids).length > 1) && selector.one_at_a_time !== true)
            fail("".concat(itemPath, "/selector/one_at_a_time"), "must be true for multiple media on a timed page");
        }
        if (mode === "media_end" && primitive.primitive === "video" && primitive.loop === true)
          fail("".concat(itemPath, "/loop"), "must be false for media_end");
      }
    }
    if (counted > MAX_PRIMITIVES)
      fail("".concat(path, "/primitives"), "must contain at most ".concat(MAX_PRIMITIVES, " primitives, counting each container and each of its items"));
    if (videoTurns.length > 0 && primitives.filter((primitive) => primitive.primitive === "video").length !== 1)
      fail(videoTurns[0], "video needs exactly one video primitive on the page");
    if (mode === "application" && controllers !== 1)
      fail("".concat(path, "/primitives"), "application advance requires exactly one controller application");
    if (streams > 1)
      fail("".concat(path, "/primitives"), "must contain at most one stream primitive");
    if (web > 2)
      fail("".concat(path, "/primitives"), "must contain at most two application or iframe primitives");
    if (mode === "media_end") {
      if (web > 0)
        fail("".concat(path, "/advance"), "media_end forbids application and iframe primitives");
      else if (primitives.filter((primitive) => primitive.primitive === "video").length !== 1)
        fail("".concat(path, "/advance"), "media_end needs exactly one video primitive; images never drive advance");
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
    if (array(page.primitives).map(object).some((primitive) => (primitive.primitive === "video" || primitive.primitive === "stream") && primitive.muted === false))
      fail("/pages/".concat(index, "/audio_cue"), "a page with sound cannot cue the soundtrack");
    if (!Object.hasOwn(playlist, "audio"))
      fail("/pages/".concat(index, "/audio_cue"), "requires a playlist audio soundtrack");
    else if (!trackIds.has(object(page.audio_cue).track))
      fail("/pages/".concat(index, "/audio_cue/track"), "must name a track id in audio.tracks");
  }
  return issues;
}

// dist/iframe-snippet.js
var iframe_snippet_exports = {};
__export(iframe_snippet_exports, {
  iframeSnippetSource: () => iframeSnippetSource
});
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
var screen_tokens_exports = {};
__export(screen_tokens_exports, {
  hasScreenToken: () => hasScreenToken2,
  screenTemplateRefusal: () => screenTemplateRefusal2,
  screenTokenStandIn: () => screenTokenStandIn2
});
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
var playlist_write_validation_exports = {};
__export(playlist_write_validation_exports, {
  PAGE_VIDEO_DATA_KEY: () => PAGE_VIDEO_DATA_KEY,
  assertWirePages: () => assertWirePages,
  containerItems: () => containerItems,
  flatPrimitives: () => flatPrimitives,
  playlistTransitionIssue: () => playlistTransitionIssue,
  validatePlaylistWrite: () => validatePlaylistWrite
});
var WIRE_PRIMITIVES = ["image", "video", "iframe", "application", "stream", "card", "container"];
var PAGE_VIDEO_DATA_KEY = "{page.video}";
function containerItems(primitive) {
  if (!primitive || typeof primitive !== "object" || Array.isArray(primitive))
    return [];
  const owner = primitive;
  if (owner.primitive !== "container" || !Array.isArray(owner.items))
    return [];
  return owner.items.filter((item) => !!item && typeof item === "object" && !Array.isArray(item));
}
function flatPrimitives(primitives) {
  if (!Array.isArray(primitives))
    return [];
  const out = [];
  const isRecord = (value) => !!value && typeof value === "object" && !Array.isArray(value);
  for (const [index, value] of primitives.entries()) {
    if (!isRecord(value))
      continue;
    out.push({ primitive: value, at: "primitives[".concat(index, "]") });
    if (value.primitive !== "container" || !Array.isArray(value.items))
      continue;
    for (const [itemIndex, item] of value.items.entries()) {
      if (isRecord(item))
        out.push({ primitive: item, at: "primitives[".concat(index, "].items[").concat(itemIndex, "]") });
    }
  }
  return out;
}
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
      throw usageError("".concat(name, " must be an uppercase #RRGGBBAA color, a linear gradient or a catalog image."));
    return;
  }
  const background = record(value, name);
  if (background.type === "image") {
    exact(background, ["type", "background_id", "color"], name);
    string(background, "background_id", name, BACKGROUND_ID_MAX, BACKGROUND_ID_PATTERN);
    if (background.color !== void 0)
      string(background, "color", name, 9, COLOR_PATTERN);
    return;
  }
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
  const extraStinger = Object.keys(stinger).find((key) => !["theme", "look", "title", "subtitle", "logo", "accent", "hang_ms"].includes(key));
  if (extraStinger !== void 0)
    return fail(["stinger", extraStinger], "is not allowed");
  if (Object.hasOwn(stinger, "theme") && (typeof stinger.theme !== "string" || !["neomustard", "cyanotype", "propaganda", "signal", "avant-garde", "bloom", "primetime"].includes(stinger.theme))) {
    return fail(["stinger", "theme"], "must name one of the seven stinger themes");
  }
  if (Object.hasOwn(stinger, "look") && (typeof stinger.look !== "string" || !["theme", "wipe", "alert"].includes(stinger.look))) {
    return fail(["stinger", "look"], "must be theme, wipe or alert");
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
    if (data.key !== SCREEN_WEATHER_KEY && data.key !== PAGE_VIDEO_DATA_KEY) {
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
      if (primitive.primitive === "container")
        throw usageError("Playlist bundles do not support container primitives.");
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
          throw usageError("".concat(primitiveName, ".dwell_ms is not accepted: an image takes its page's timing, and a media_end page advances on its video."));
      } else {
        optionalBoolean(primitive, "muted", primitiveName);
        optionalBoolean(primitive, "loop", primitiveName);
      }
      mediaPrimitivesOnPage.push({ primitive: category, value: primitive, selector });
    }
    if (iframeCount > 2)
      throw usageError("".concat(pageName, ".primitives must contain at most 2 iframe primitives."));
    if (page.audio_cue !== void 0 && mediaPrimitivesOnPage.some((media) => media.primitive === "video" && media.value.muted === false)) {
      throw usageError("".concat(pageName, ".audio_cue: a page with sound cannot cue the soundtrack."));
    }
    if (advance === "application")
      throw usageError("".concat(pageName, " application advance is unsupported because bundles exclude applications."));
    const videos = mediaPrimitivesOnPage.filter((media) => media.primitive === "video");
    if (advance === "media_end") {
      if (iframeCount > 0)
        throw usageError("".concat(pageName, " media_end forbids iframe primitives."));
      if (videos.length !== 1)
        throw usageError("".concat(pageName, " media_end needs exactly one video primitive; images never drive advance."));
      if (videos[0].value.loop === true)
        throw usageError("".concat(pageName, " media_end video must not loop."));
    }
    for (const media of mediaPrimitivesOnPage) {
      if (advance === "media_end" && media.primitive === "video")
        continue;
      if (media.selector.count > 1 && !media.selector.oneAtATime)
        throw usageError("".concat(pageName, " multi-item selectors require one_at_a_time true."));
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
  command: "screenrig media upload --help",
  reason: "A finished still is an image you upload with media upload; live text comes from built-in cards."
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
        throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "].primitive must be ").concat(WIRE_PRIMITIVES.join("|"), ". Upload a finished still with media upload, or use a built-in card for live text."), PRIMITIVE_NEXT);
      }
      if (category === "image" || category === "video") {
        const selector = wire.selector;
        if (!selector || typeof selector !== "object" || Array.isArray(selector) || !["id", "ids", "all", "tag", "folder"].includes(String(selector.by))) {
          throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "] ").concat(category, " requires a selector with by id|ids|all|tag|folder."));
        }
      } else if ("selector" in wire) {
        throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "] ").concat(category, " does not take a selector."));
      }
      if (category !== "container" || !Array.isArray(wire.items))
        continue;
      for (const [itemIndex, item] of wire.items.entries()) {
        const kind = item && typeof item === "object" && !Array.isArray(item) ? item.primitive : void 0;
        if (kind !== "card" && kind !== "image") {
          throw usageError("".concat(label, " primitives[").concat(primitiveIndex, "].items[").concat(itemIndex, "].primitive must be card or image: a container holds cards and images."));
        }
      }
    }
  }
}

export {
  require_core,
  require_ajv,
  require__,
  BACKGROUNDS_PATH,
  DEFAULT_BACKGROUND_COLOR,
  BACKGROUND_ORIENTATIONS,
  backgroundId,
  backgroundOrSetId,
  backgroundColor,
  setBackgroundColor,
  imageBackgroundOf,
  withCanvasBackground,
  backgroundUrl,
  backgrounds_exports,
  validatePlaylistWriteSemantics,
  playlist_write_semantics_exports,
  iframeSnippetSource,
  iframe_snippet_exports,
  hasScreenToken2 as hasScreenToken,
  screenTokenStandIn2 as screenTokenStandIn,
  screenTemplateRefusal2 as screenTemplateRefusal,
  screen_tokens_exports,
  PAGE_VIDEO_DATA_KEY,
  flatPrimitives,
  playlistTransitionIssue,
  validatePlaylistWrite,
  assertWirePages,
  playlist_write_validation_exports
};
