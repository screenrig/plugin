import { createRequire as screenrigCreateRequire } from "node:module";
const require = screenrigCreateRequire(import.meta.url);
import {
  plainText
} from "./chunk-XWMHWXE7.js";
import {
  flagBool,
  flagString
} from "./chunk-V5GOKJGU.js";
import {
  usageError
} from "./chunk-JP4OQPAN.js";
import {
  require__,
  require_ajv
} from "./chunk-PGM5AQER.js";
import {
  __toESM
} from "./chunk-3FYAGULW.js";

// dist/screen-facts.js
var SCREEN_FIELD_NAME_PATTERN = /^[a-z0-9_]{1,32}$/;
var SCREEN_FIELDS_MAX = 32;
var SCREEN_FIELD_VALUE_MAX = 200;
var SCREEN_LOCATION_NAME_MAX = 40;
var SCREEN_LOCATION_ADDRESS_MAX = 200;
var SCREEN_LOCATION_TOKEN = "{screen.location}";
var TEXT_TOKEN = /\{screen\.(?:name|timezone|field\.[a-z0-9_]{1,32})\}/g;
var KEY_TOKEN = /\{screen\.field\.[a-z0-9_]{1,32}\}/g;
var DECIMAL = /^-?\d+(?:\.\d+)?$/;
var CONTROL = new RegExp("\\p{Cc}", "u");
var characters = (value) => [...value].length;
function screenTextPlaceholders(value) {
  if (typeof value === "string")
    return value.replace(TEXT_TOKEN, "x");
  if (Array.isArray(value))
    return value.map(screenTextPlaceholders);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, member]) => [key, screenTextPlaceholders(member)]));
  }
  return value;
}
function screenKeyPlaceholder(key) {
  return key.replace(KEY_TOKEN, "x");
}
function fieldEntry(input, hint) {
  const at = input.indexOf("=");
  if (at < 0)
    throw usageError("--field takes NAME=VALUE, such as --field store_number=0142.");
  const name = input.slice(0, at).trim();
  if (!SCREEN_FIELD_NAME_PATTERN.test(name)) {
    throw usageError("--field takes a name of 1 to 32 lower case letters, digits or underscores, such as --field store_number=0142.");
  }
  const value = input.slice(at + 1).trim();
  if (!value || characters(value) > SCREEN_FIELD_VALUE_MAX || CONTROL.test(value)) {
    throw usageError("--field ".concat(name, " takes a value of 1 to ").concat(SCREEN_FIELD_VALUE_MAX, " characters after trimming, without control characters.").concat(hint));
  }
  return { name, value };
}
function fieldEntries(accumulated) {
  if (accumulated === void 0)
    return [];
  return accumulated.split("\n").map((line) => {
    const at = line.indexOf("=");
    return { name: line.slice(0, at), value: line.slice(at + 1) };
  });
}
function fieldOption(hint) {
  return (input, previous) => {
    const entry = fieldEntry(input, hint);
    const held = fieldEntries(previous);
    if (held.some((item) => item.name === entry.name))
      throw usageError("--field ".concat(entry.name, " is given more than once."));
    if (held.length >= SCREEN_FIELDS_MAX)
      throw usageError("--field takes at most ".concat(SCREEN_FIELDS_MAX, " fields."));
    return [...held, entry].map((item) => "".concat(item.name, "=").concat(item.value)).join("\n");
  };
}
var screenFieldSetOption = fieldOption(" --unset-field NAME removes a field.");
var screenFieldFilterOption = fieldOption("");
var fleetLinkFieldOption = fieldOption("");
function fieldMap(accumulated) {
  if (accumulated === void 0)
    return void 0;
  return Object.fromEntries(fieldEntries(accumulated).map((entry) => [entry.name, entry.value]));
}
function screenUnsetFieldOption(input, previous) {
  const name = input.trim();
  if (!SCREEN_FIELD_NAME_PATTERN.test(name)) {
    throw usageError("--unset-field takes a field name of 1 to 32 lower case letters, digits or underscores.");
  }
  const held = previous === void 0 ? [] : previous.split("\n");
  if (held.includes(name))
    throw usageError("--unset-field ".concat(name, " is given more than once."));
  return [...held, name].join("\n");
}
function coordinates(input, flag, shape, example, count) {
  const parts = input.split(",").map((part) => part.trim());
  if (parts.length !== count || !parts.every((part) => DECIMAL.test(part))) {
    throw usageError("".concat(flag, " takes ").concat(shape, " as decimal numbers, such as ").concat(flag, " ").concat(example, "."));
  }
  const [latitude, longitude] = parts.map(Number);
  if (latitude < -90 || latitude > 90)
    throw usageError("".concat(flag, " latitude must be from -90 to 90."));
  if (longitude < -180 || longitude > 180)
    throw usageError("".concat(flag, " longitude must be from -180 to 180."));
  return parts.join(",");
}
function screenLocationOption(input) {
  return coordinates(input, "--location", "LAT,LON", "47.6062,-122.3321", 2);
}
function screenNearOption(input) {
  const near = coordinates(input, "--near", "LAT,LON,KM", "47.6062,-122.3321,25", 3);
  if (!(Number(near.split(",")[2]) > 0))
    throw usageError("--near KM must be greater than zero.");
  return near;
}
function placeText(input, flag, max) {
  const value = input.trim();
  if (!value || characters(value) > max || CONTROL.test(value)) {
    throw usageError("".concat(flag, " takes 1 to ").concat(max, " characters after trimming, without control characters."));
  }
  return value;
}
function screenLocationNameOption(input) {
  return placeText(input, "--location-name", SCREEN_LOCATION_NAME_MAX);
}
function screenAddressOption(input) {
  return placeText(input, "--address", SCREEN_LOCATION_ADDRESS_MAX);
}
function screenFactsPatch(flags) {
  const assigned = flagString(flags, "field");
  const unset = flagString(flags, "unset-field");
  const location = flagString(flags, "location");
  const placeName = flagString(flags, "location-name");
  const address = flagString(flags, "address");
  const clearFields = flagBool(flags, "clear-fields");
  const clearLocation = flagBool(flags, "clear-location");
  if (clearFields && (assigned !== void 0 || unset !== void 0))
    throw usageError("--clear-fields cannot be used with --field or --unset-field.");
  if (clearLocation && location !== void 0)
    throw usageError("--clear-location cannot be used with --location.");
  if (location === void 0 && (placeName !== void 0 || address !== void 0)) {
    throw usageError("".concat(placeName !== void 0 ? "--location-name" : "--address", " requires --location."));
  }
  const patch = {};
  if (clearFields) {
    patch.fields = null;
  } else if (assigned !== void 0 || unset !== void 0) {
    const sets = fieldEntries(assigned);
    const removed = unset === void 0 ? [] : unset.split("\n");
    const clash = removed.find((name) => sets.some((entry) => entry.name === name));
    if (clash !== void 0)
      throw usageError("--field and --unset-field both name ".concat(clash, "."));
    patch.fields = Object.fromEntries([...sets.map((entry) => [entry.name, entry.value]), ...removed.map((name) => [name, null])]);
  }
  if (clearLocation) {
    patch.location = null;
  } else if (location !== void 0) {
    const [latitude, longitude] = location.split(",").map(Number);
    patch.location = { latitude, longitude, ...placeName !== void 0 ? { name: placeName } : {}, ...address !== void 0 ? { address } : {} };
  }
  return patch;
}
function screenListFacts(flags) {
  const near = flagString(flags, "near");
  const field = flagString(flags, "field");
  return {
    query: near === void 0 ? {} : { near },
    ...field === void 0 ? {} : { repeated: { field: fieldEntries(field).map((entry) => "".concat(entry.name, ":").concat(entry.value)) } }
  };
}
function printableFields(screen) {
  const fields = screen?.fields;
  if (fields === null || typeof fields !== "object" || Array.isArray(fields))
    return [];
  return Object.entries(fields).filter((entry) => SCREEN_FIELD_NAME_PATTERN.test(entry[0]) && typeof entry[1] === "string").map(([name, value]) => [name, plainText(value)]);
}
function printableLocation(screen) {
  const place = screen?.location;
  if (place === null || typeof place !== "object")
    return void 0;
  const { latitude, longitude, name, address } = place;
  if (typeof latitude !== "number" || !Number.isFinite(latitude) || typeof longitude !== "number" || !Number.isFinite(longitude))
    return void 0;
  const text = (value) => typeof value === "string" ? plainText(value).trim() || void 0 : void 0;
  return { latitude: String(latitude), longitude: String(longitude), name: text(name), address: text(address) };
}
function screenFactsLines(screen) {
  const fields = printableFields(screen);
  const place = printableLocation(screen);
  return [
    ...fields.length ? ["Fields: ".concat(fields.map(([name, value]) => "".concat(name, "=").concat(value)).join(", "))] : [],
    ...place ? ["Location: ".concat(place.latitude, ", ").concat(place.longitude).concat(place.name ? " (".concat(place.name, ")") : "").concat(place.address ? " \xB7 ".concat(place.address) : "")] : []
  ];
}
function screenFieldsCell(screen) {
  return printableFields(screen).map(([name, value]) => "".concat(name, "=").concat(value)).join(",");
}
function screenLocationCell(screen) {
  const place = printableLocation(screen);
  return place ? "".concat(place.latitude, ",").concat(place.longitude).concat(place.name ? " (".concat(place.name, ")") : "") : "";
}

// dist/cards.js
var import_ajv = __toESM(require_ajv(), 1);
var import__ = __toESM(require__(), 1);
function cardId(value) {
  if (!/^[a-z][a-z0-9-]{0,39}$/.test(value))
    throw usageError("Card id must be 1\u201340 lowercase letters, digits or hyphens, starting with a letter.");
  return value;
}
function cardUid(value) {
  if (!/^(?:(?:stage|qa|development)_)?crd_[A-Za-z0-9_-]+$/.test(value))
    throw usageError("Use a card instance ID (crd_...).");
  return value;
}
function validCardDataKey(value) {
  return /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,255}$/.test(value) && !value.startsWith("feed:");
}
function cardDataKeyTemplate(value) {
  if (!validCardDataKey(screenKeyPlaceholder(value))) {
    throw usageError("Card data key must follow the K/V key grammar and may not start with feed:. It may carry {screen.field.NAME} tokens, where NAME is 1 to 32 lower case letters, digits or underscores.");
  }
  return value;
}
function property(schema, root) {
  if (typeof schema.$ref !== "string" || !schema.$ref.startsWith("#/$defs/"))
    return schema;
  const name = schema.$ref.slice(8).replace(/~1/g, "/").replace(/~0/g, "~");
  return { ...root.$defs?.[name], ...schema };
}
function cardProperties(card) {
  const result = { static: {}, dynamic: {} };
  for (const [name, value] of Object.entries(card.params_schema.properties ?? {})) {
    const schema = property(value, card.params_schema);
    const dynamic = schema.dynamic === true || Object.hasOwn(card.data_schema.properties ?? {}, name);
    Object.defineProperty(result[dynamic ? "dynamic" : "static"], name, {
      value: { schema, required: (card.params_schema.required ?? []).includes(name) },
      enumerable: true
    });
  }
  return result;
}
function cardDetailsHuman(card) {
  const properties = cardProperties(card);
  const section = (name) => [
    "".concat(name, " properties:"),
    ...Object.entries(properties[name]).map(([key, value]) => "  ".concat(key, ": ").concat(JSON.stringify(value))),
    ...Object.keys(properties[name]).length ? [] : ["  (none)"]
  ];
  return [
    "".concat(card.id, " v").concat(card.version, " (major ").concat(card.major, ")"),
    ...section("static"),
    ...section("dynamic"),
    "tier: ".concat(card.tier),
    "layouts: ".concat(card.layouts.length ? card.layouts.join(", ") : "(none)"),
    "feed: ".concat(card.feed || "(none)"),
    "example placement:\n".concat(JSON.stringify(card.example, null, 2))
  ].join("\n");
}
function assertParams(schema, params, field) {
  const ajv = schema.$schema?.includes("2020-12") ? new import__.Ajv2020({ allErrors: true, strict: false }) : new import_ajv.Ajv({ allErrors: true, strict: false });
  ajv.addKeyword({ keyword: "dynamic", schemaType: "boolean", valid: true });
  const validate = ajv.compile(schema);
  if (!validate(params)) {
    const errors = (validate.errors ?? []).map((error) => "".concat(field).concat(error.instancePath, ": ").concat(error.message)).join("; ");
    throw usageError("Invalid card params: ".concat(errors));
  }
}
function objectForm(schema, root, depth = 0) {
  if (!schema || typeof schema !== "object" || depth > 8)
    return void 0;
  const resolved = property(schema, root);
  const types = Array.isArray(resolved.type) ? resolved.type : resolved.type === void 0 ? [] : [resolved.type];
  if (resolved.properties && typeof resolved.properties === "object" && (types.length === 0 || types.includes("object")))
    return resolved;
  for (const branch of Array.isArray(resolved.anyOf) ? resolved.anyOf : []) {
    const found = objectForm(branch, root, depth + 1);
    if (found)
      return found;
  }
  return void 0;
}
function screenLocationStandIn(card) {
  const root = card.params_schema;
  const place = objectForm(root?.properties?.location, root);
  if (!place?.properties?.latitude || !place.properties.longitude)
    return void 0;
  return { latitude: 0, longitude: 0, ...place.properties.name ? { name: "" } : {} };
}
function screenFactParams(card, params, field) {
  if (params === null || typeof params !== "object" || Array.isArray(params))
    return params;
  const checked = screenTextPlaceholders(params);
  if (params.location === SCREEN_LOCATION_TOKEN) {
    const standIn = screenLocationStandIn(card);
    if (!standIn)
      throw usageError("".concat(field, ".location cannot be ").concat(SCREEN_LOCATION_TOKEN, ": the ").concat(card.id, " card's location is not a latitude and longitude."));
    checked.location = standIn;
  }
  return checked;
}
async function validatePlaylistCards(client, playlist) {
  const cards = /* @__PURE__ */ new Map();
  for (const [pageIndex, page] of playlist.pages.entries()) {
    for (const [index, item] of (page.primitives ?? []).entries()) {
      if (item.primitive !== "card")
        continue;
      if (typeof item.card === "string" && /^(?:(?:stage|qa|development)_)?crd_/.test(item.card))
        continue;
      const id = cardId(item.card);
      let card = cards.get(id);
      if (!card) {
        card = (await client.call({ method: "GET", path: "/api/card-types/".concat(id) })).body;
        cards.set(id, card);
      }
      if (item.major !== void 0 && item.major !== card.major)
        continue;
      if (typeof item.layout === "string" && Array.isArray(card.layouts) && !card.layouts.includes(item.layout)) {
        throw usageError("pages[".concat(pageIndex, "].primitives[").concat(index, "].layout: card ").concat(id, " (").concat(card.tier, " tier) takes ").concat(card.layouts.length ? card.layouts.join(", ") : "no layout", ", not ").concat(item.layout, "."));
      }
      const schema = structuredClone(card.params_schema);
      const field = "pages[".concat(pageIndex, "].primitives[").concat(index, "].params");
      if (item.data !== void 0) {
        cardDataKeyTemplate(item.data);
        const dynamic = Object.keys(cardProperties(card).dynamic);
        for (const name of dynamic) {
          if (Object.hasOwn(item.params ?? {}, name))
            throw usageError("".concat(field, ".").concat(name, " is dynamic and comes from the bound data document; leave it out of params, or use a card instance (card create, then card data put crd_ID)."));
          delete schema.properties?.[name];
        }
        schema.required = (schema.required ?? []).filter((name) => !dynamic.includes(name));
      }
      assertParams(schema, screenFactParams(card, item.params ?? {}, field), field);
    }
  }
}
var FEED_FAMILIES = [
  "weather",
  "airquality",
  "alerts",
  "rates",
  "crypto",
  "earthquakes",
  "cyclones",
  "headlines",
  "cap",
  "tides",
  "launches",
  "drugalerts",
  "respiratory",
  "almanac",
  "outdoorsafety",
  "departures",
  "bikeshare"
];
var FEED_SEVERITIES = ["minor", "moderate", "severe", "extreme"];
var FEED_URGENCIES = ["past", "future", "expected", "immediate"];
var FEED_CERTAINTIES = ["unlikely", "possible", "likely", "observed"];
var FEED_STATUSES = ["Actual", "Exercise", "Test", "System"];
var FEED_SCOPES = ["Public", "Restricted", "Private"];
var FEED_AREA_UNKNOWN = ["hide", "show"];
var FEED_CATEGORIES = ["drug", "food"];
var FEED_PROVIDERS = ["tfl", "entur", "digitransit"];
var FEED_REPEATABLE_FLAGS = ["url", "geocode", "event", "exclude-event", "sender", "status", "scope", "language"];
var FEED_FLAGS = {
  weather: ["lat", "lon"],
  airquality: ["lat", "lon"],
  alerts: ["lat", "lon"],
  earthquakes: ["lat", "lon", "radius-km", "min-magnitude", "hours"],
  cyclones: ["basins", "lat", "lon", "radius-km"],
  rates: ["base"],
  crypto: ["symbols", "currency"],
  headlines: ["url"],
  cap: [
    "url",
    "public",
    "lat",
    "lon",
    "geocode",
    "min-severity",
    "max-severity",
    "min-urgency",
    "min-certainty",
    "event",
    "exclude-event",
    "sender",
    "status",
    "scope",
    "language",
    "area-unknown"
  ],
  tides: ["station", "lat", "lon"],
  launches: [],
  drugalerts: ["country", "category"],
  respiratory: ["country", "region"],
  almanac: ["country", "language", "lat", "lon", "date"],
  outdoorsafety: ["lat", "lon"],
  departures: ["provider", "stops"],
  bikeshare: ["lat", "lon", "system"]
};
var FEED_RANGES = {
  lat: [-90, 90],
  lon: [-180, 180],
  "radius-km": [10, 2e4],
  "min-magnitude": [0, 9],
  hours: [1, 168]
};
var FEED_REQUIRED = {
  weather: ["lat", "lon"],
  airquality: ["lat", "lon"],
  alerts: ["lat", "lon"],
  earthquakes: ["lat", "lon"],
  crypto: ["symbols"],
  headlines: ["url"],
  drugalerts: ["country"],
  respiratory: ["country"],
  outdoorsafety: ["lat", "lon"],
  bikeshare: ["lat", "lon"],
  departures: ["provider", "stops"]
};
var FEED_COUNTRIES = { drugalerts: ["us", "ca", "gb"], respiratory: ["us", "gb"] };
var CYCLONE_BASINS = ["at", "ep", "cp", "wp"];
var CAP_SOURCES_MAX = 5;
var DEPARTURE_STOPS_MAX = 4;
function feedListOption(name, maxLength, choices) {
  return (value, previous) => {
    if (new RegExp("\\p{Cc}", "u").test(value))
      throw usageError("--".concat(name, " must not contain control characters."));
    if (value.length > maxLength)
      throw usageError("--".concat(name, " takes values of at most ").concat(maxLength, " characters."));
    if (choices && !choices.includes(value))
      throw usageError("--".concat(name, " must be one of ").concat(choices.join(", "), "."));
    return previous === void 0 ? value : "".concat(previous, "\n").concat(value);
  };
}
function feedQuery(args) {
  const family = args.positionals[2];
  const names = FEED_FLAGS[family];
  if (!names)
    throw usageError("Unknown feed family.");
  const query = {};
  const repeated = {};
  for (const name of new Set(Object.values(FEED_FLAGS).flat())) {
    let value = name === "public" ? flagBool(args.flags, name) ? "true" : void 0 : flagString(args.flags, name);
    if (value === void 0)
      continue;
    if (!names.includes(name))
      throw usageError("--".concat(name, " does not apply to ").concat(family, "."));
    const range = FEED_RANGES[name];
    if (range) {
      const [min, max] = range;
      if (!value.trim() || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) {
        throw usageError("--".concat(name, " must be a number from ").concat(min, " to ").concat(max, "."));
      }
    }
    if (name === "basins" && (value.length > 16 || value.split(",").some((basin) => !CYCLONE_BASINS.includes(basin.trim().toLowerCase())))) {
      throw usageError("--basins takes a comma-separated list of ".concat(CYCLONE_BASINS.join(", "), "."));
    }
    if (name === "geocode") {
      for (const code of value.split("\n")) {
        const colon = code.indexOf(":");
        if (colon < 1 || colon > 40 || colon === code.length - 1 || code.length - colon - 1 > 120) {
          throw usageError("--geocode takes NAME:VALUE, such as UGC:WAC033.");
        }
      }
    }
    if (name === "station" && !/^[A-Za-z0-9]{7}$/.test(value)) {
      throw usageError("--station takes a NOAA tide prediction station id of seven letters or digits, such as 9414290.");
    }
    if (name === "country") {
      const countries = FEED_COUNTRIES[family];
      if (!/^[A-Za-z]{2}$/.test(value) || countries && !countries.includes(value.toLowerCase())) {
        throw usageError(countries ? "--country takes ".concat(countries.join(", "), " for ").concat(family, ".") : "--country takes an ISO 3166-1 alpha-2 country code, such as US or GB.");
      }
    }
    if (name === "region" && (value.length > 48 || new RegExp("\\p{Cc}", "u").test(value)))
      throw usageError("--region takes at most 48 characters: a US state, territory or DC by name or postal code, or England or a UKHSA region.");
    if (name === "date" && !validDay(value))
      throw usageError("--date takes one day as YYYY-MM-DD, such as 2026-12-25.");
    if (name === "system" && (value.length > 64 || new RegExp("\\p{Cc}", "u").test(value)))
      throw usageError("--system takes a bike share system id of at most 64 characters, such as Mobibikes_CA_Vancouver.");
    if (name === "stops") {
      const stops = value.split(",").map((stop) => stop.trim());
      if (value.length > 200 || stops.length > DEPARTURE_STOPS_MAX || stops.some((stop) => !stop || /[\s\p{Cc}]/u.test(stop))) {
        throw usageError("--stops takes one to ".concat(DEPARTURE_STOPS_MAX, " stop ids, comma-separated, such as 940GZZLUOXC (TfL), NSR:StopPlace:337 (Entur) or HSL:1040129 (Digitransit)."));
      }
      value = stops.join(",");
    }
    const param = name.replaceAll("-", "_");
    if (FEED_REPEATABLE_FLAGS.includes(name))
      repeated[param] = value.split("\n");
    else
      query[param] = value;
  }
  const urls = repeated.url;
  if (urls && family === "headlines") {
    if (urls.length > 1)
      throw usageError("headlines takes one --url.");
    query.url = urls[0];
    delete repeated.url;
  }
  if (urls && family === "cap" && urls.length > CAP_SOURCES_MAX)
    throw usageError("--url takes at most ".concat(CAP_SOURCES_MAX, " CAP source URLs."));
  if (family === "almanac" && repeated.language) {
    if (repeated.language.length > 1)
      throw usageError("almanac takes one --language: the On This Day edition (ar, bs, cs, de, en, es, fr, it, pt, ru, sv, tr, uk or zh).");
    query.language = repeated.language[0];
    delete repeated.language;
  }
  const has = (param) => query[param] !== void 0 || repeated[param] !== void 0;
  for (const name of FEED_REQUIRED[family] ?? [])
    if (!has(name))
      throw usageError("".concat(family, " requires --").concat(name, "."));
  if (family === "tides" && !has("station") && !has("lat"))
    throw usageError("tides requires --station, or --lat and --lon for the nearest tide prediction station within 100 km.");
  if (family === "cyclones" && ["lat", "lon", "radius_km"].some(has) && !["lat", "lon", "radius_km"].every(has)) {
    throw usageError("cyclones takes --lat, --lon and --radius-km together for the storms near a place, or none of them for every storm.");
  }
  if (family === "cap" && !has("url") && !has("lat"))
    throw usageError("cap requires --url, or --lat and --lon for the public alert feeds.");
  return { query, repeated };
}
function validDay(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const day = new Date("".concat(value, "T00:00:00Z"));
  return Number.isFinite(day.getTime()) && day.toISOString().startsWith(value);
}

export {
  screenFieldSetOption,
  screenFieldFilterOption,
  fleetLinkFieldOption,
  fieldMap,
  screenUnsetFieldOption,
  screenLocationOption,
  screenNearOption,
  screenLocationNameOption,
  screenAddressOption,
  screenFactsPatch,
  screenListFacts,
  screenFactsLines,
  screenFieldsCell,
  screenLocationCell,
  cardId,
  cardUid,
  cardProperties,
  cardDetailsHuman,
  validatePlaylistCards,
  FEED_FAMILIES,
  FEED_SEVERITIES,
  FEED_URGENCIES,
  FEED_CERTAINTIES,
  FEED_STATUSES,
  FEED_SCOPES,
  FEED_AREA_UNKNOWN,
  FEED_CATEGORIES,
  FEED_PROVIDERS,
  FEED_REPEATABLE_FLAGS,
  feedListOption,
  feedQuery
};
