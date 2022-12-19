import { getUrlParamsObj, searchParmsToKeep } from "./utils";

import { Amplify, API, graphqlOperation } from "aws-amplify";
import * as queries from "../../src/graphql/queries";
import awsExports from "../../src/aws-exports";
Amplify.configure(awsExports);

let CACHED_CONSTRAINTS = {}; //save constant calls to web api
//let CONSTRAINTS = {};

let COMMUNITY_TYPES = {
  "Active Adult": "Active Adult",
  Resort: "Amenities/Resort",
  Future: "Future",
  Golf: "Golf",
  Rental: "Luxury Rental",
  Waterfront: "Waterfront",
  Urban: "City Living",
  "Student Housing": null,
  "Luxury Home": null,
};

let HOMES_TYPES = {
  "Single Family": "Single Family",
  Townhome: "Townhome",
  Condo: "Condo",
  Rental: null,
  Attached: null,
};

let FILTER_TYPES = {
  bed: "bed",
  bath: "bath",
  hbath: "halfbath",
  pbed: "masterBedLoc",
  p_min: "price_min",
  p_max: "price_max",
  sqft: "sqft",
  sqftMax: null,
  stories: "stories",
  garage: "garages",
  h_type: "homeTypes",
  c_type: "communityTypes",
  county: "counties",
  schoolDist: "schoolDistricts",
};

const updateSelectedFilters = (selectedOptions, constraints) => {
  let newOptions = {};

  for (let key in selectedOptions) {
    let options = selectedOptions[key];
    let constraintOptions = constraints[key];

    if (key === "homes") {
      newOptions[key] = options;
    } else if (Array.isArray(options) && constraintOptions) {
      newOptions[key] = [];
      options.forEach((selectedOption) => {
        constraintOptions.forEach((cOption) => {
          if (selectedOption == cOption.value && !cOption.disabled) {
            newOptions[key].push(selectedOption);
          }
        });
      });
    } else {
      newOptions[key] = options;
    }
  }

  return newOptions;
};

const updateConstraints = (constraints, selectedOptions, count) => {
  let newConstraints = JSON.parse(JSON.stringify(constraints));

  for (let key in newConstraints) {
    let value = selectedOptions[key];
    let newConstraintOptions = [];
    let constraintOptions = newConstraints[key];

    if (Array.isArray(constraintOptions)) {
      constraintOptions.forEach((option) => {
        let selected = false;
        if (typeof value === "object" && Array.isArray(value)) {
          if (value.indexOf(option.value + "") >= 0 || value.indexOf(option.value) >= 0) {
            selected = true;
          }
        } else if (value) {
          selected = option.value == value;
        }
        newConstraintOptions.push({
          label: option.label,
          value: option.value,
          selected: selected,
          disabled: option.disabled,
        });
      });

      newConstraints[key] = newConstraintOptions;
    }
  }

  if (count || count === 0) newConstraints["count"] = count;

  return newConstraints;
};

let createHomeOrCommunityTypes = (constraints, type) => {
  let options = [];
  let H_OR_C = HOMES_TYPES;
  if (type === "c_type") H_OR_C = COMMUNITY_TYPES;

  for (let key in H_OR_C) {
    if (H_OR_C[key]) {
      options.push({
        label: H_OR_C[key],
        value: key,
        selected: false,
        disabled: constraints.indexOf(key) < 0,
      });
    }
  }

  return options;
};

let createRangeOptions = (min, max, tick) => {
  let ranges = [];
  let options = [];
  let TICK = tick;
  //let THRESHOLD = 2000000;
  //let LARGE_TICK = 500000;

  min = Number(min);
  max = Number(max);

  if (min !== 0 && max !== 0) {
    min = min - TICK;

    //SET MIN PRICE TO 100,000 IF LOWER THAN 100K APPEARS
    if (min < TICK) {
      min = TICK;
    }

    //Make Whole Number
    let diff = min % TICK;
    min -= diff;

    max = max + TICK;
    diff = max % TICK;

    if (diff > 0) {
      max -= diff;
    } else {
      max -= TICK;
    }

    max = max + TICK;
    ranges = [min];

    // if (max >= 3000000) {
    //     let minLen = (THRESHOLD - min)/TICK + 1;
    //     let maxLen = Math.ceil((Number(max) - THRESHOLD)/LARGE_TICK);

    //     for (let i = 1; i < minLen; i++) {
    //         let nextRange = min + i*TICK;
    //         ranges.push(nextRange)
    //     }

    //     for (let i = 1; i < maxLen; i++) {
    //         let nextRange = THRESHOLD + i*LARGE_TICK;
    //         ranges.push(nextRange);
    //     }

    //     ranges.push(max);
    // }
    // else {
    let len = (max - min) / TICK + 1;
    for (let i = 1; i < len; i++) {
      let nextRange = min + i * TICK;
      ranges.push(nextRange);
    }
    // }
  }

  let rangeObj = {
    min: [],
    max: [],
  };

  if (ranges && ranges.length > 0) {
    ranges.forEach((range) => {
      options.push({
        label: range,
        value: range,
        selected: false,
        disabled: false,
      });
    });

    rangeObj.min = options;
    rangeObj.max = options;
  }

  return rangeObj;
};

let createOptions = (constraints, type) => {
  let options = [];

  if (type === "h_type" || type === "c_type") {
    return createHomeOrCommunityTypes(constraints, type);
  }

  if (Array.isArray(constraints)) {
    let plus = "";
    let addAny = false;
    if (type === "bed" || type === "bath" || type === "hbath" || type === "garage") {
      plus = "+";
      addAny = true;
    } else if (type === "stories" || type === "pbed") {
      addAny = true;
    }

    if (addAny) {
      options.push({
        label: "Any",
        value: "",
        selected: false,
      });
    }

    constraints.forEach((constraint) => {
      options.push({
        label: constraint + plus,
        value: constraint,
        selected: false,
      });
    });
  }

  return options;
};

const createFilterConstraints = (data, searchType) => {
  let constraints = {};

  for (let key in FILTER_TYPES) {
    if (key === "p_min") {
      let prices = createRangeOptions(data[FILTER_TYPES["p_min"]], data[FILTER_TYPES["p_max"]], 100000);
      constraints["p_min"] = prices.min;
      constraints["p_max"] = prices.max;
    } else if (key === "sqft") {
      let sqftConstraints = data[FILTER_TYPES["sqft"]];
      let min = 0;
      let max = 0;

      if (sqftConstraints.length > 1) {
        min = sqftConstraints[0];
        max = sqftConstraints[sqftConstraints.length - 1] + 250;
      }
      let sqft = createRangeOptions(min, max, 250);
      constraints["sqft"] = sqft.min;
      constraints["sqftMax"] = sqft.max;
    } else if (key !== "p_max") {
      let otherConstraints = data[FILTER_TYPES[key]];
      if (otherConstraints) constraints[key] = createOptions(otherConstraints, key);
    }
  }

  constraints["count"] = data.planCount;
  if (searchType === "normal") {
    constraints["count"] = data.communityCount;
  }

  return constraints;
};

const constraintsAPI = (region = 'Nevada', params = { bts: 'y', decorated: 'y', qdh: 'y' }, callback) => {
  const data = {
    "bath": [
      2,
      3,
      4,
      5,
      6
    ],
    "bed": [
      2,
      3,
      4,
      5,
      6
    ],
    "buildToSuit": true,
    "communityCount": 25,
    "communityTypes": [
      "Active Adult",
      "Future",
      "Golf",
      "Luxury Home",
      "Resort"
    ],
    "counties": [
      "Clark",
      "Washington",
      "Washoe"
    ],
    "garages": [
      2,
      3,
      4
    ],
    "halfbath": [
      0,
      1,
      2,
      3
    ],
    "hasMasterCommunity": true,
    "hasResults": true,
    "homeTypes": [
      "Attached",
      "Condo",
      "Single Family",
      "Townhome"
    ],
    "masterBedLoc": [
      "1",
      "2",
      "3"
    ],
    "maxRent": 5000,
    "minRent": 0,
    "movein_dates": [
      "01-12-2023",
      "01-25-2023",
      "01-26-2023",
      "01-31-2023",
      "02-16-2023",
      "02-22-2023",
      "02-28-2023",
      "03-16-2023",
      "03-17-2023",
      "03-29-2023",
      "03-31-2023",
      "04-06-2023",
      "05-04-2023",
      "05-18-2023",
      "09-19-2022",
      "09-28-2022",
      "09-29-2022",
      "10-20-2022",
      "10-26-2022",
      "10-27-2022",
      "10-28-2022",
      "11-16-2022",
      "11-18-2022",
      "11-30-2022",
      "12-21-2022",
      "12-28-2022",
      "12-29-2022",
      "12-30-2022",
      "12-31-2022"
    ],
    "neighborhoods": [],
    "planCount": 262,
    "price_max": 1624995,
    "price_min": 471995,
    "qdh": true,
    "schoolDistricts": [
      "Clark County",
      "Washington County",
      "Washoe County"
    ],
    "sqft": [
      1250,
      1500,
      1750,
      2000,
      2250,
      2500,
      2750,
      3000,
      3250,
      3500,
      3750,
      4000,
      4250,
      4500,
      4750,
      5000
    ],
    "states": [
      "NV",
      "UT"
    ],
    "stories": [
      1,
      2,
      3,
      4
    ]
  }
  callback(data)
};

const getConstraints = (searchOptions, router, callback) => {
  //let query = 'getSearchConstraint';
  let searchType = "normal";
  let region = "";
  let params = {};

  if (router && router.region) {
    region = router.region;
  } else {
    //query = 'getAllSearchConstraintAll';
    params = getUrlParamsObj(searchParmsToKeep(router));
    //params = params + getUrlParams(searchParmsToKeep(router));
  }

  if (router && router.homes && (router.homes === "quick-delivery" || router.homes[0] === "quick-delivery")) {
    searchType = "qdh";
    params["bts"] = "n";
    params["decorated"] = "n";
    params["incPlan"] = "y";
    params["qdh"] = "y";
  } else {
    params["bts"] = "y";
    params["decorated"] = "y";
    params["qdh"] = "y";
  }

  if (router && router.modelSearch) {
    searchType = "modelSearch";
    params["modelSearch"] = "y";
    params["incPlan"] = "y";
  }

  //let url = `https://dev.tollbrothers.com/luxury-homes${region}?d=constraints${params}`;

  if (CACHED_CONSTRAINTS[region] && CACHED_CONSTRAINTS[region][searchType]) {
    let constraints = JSON.parse(JSON.stringify(CACHED_CONSTRAINTS[region][searchType]));
    callback(constraints);
    return;
  } else if (!CACHED_CONSTRAINTS[region]) {
    CACHED_CONSTRAINTS[region] = {};
    CACHED_CONSTRAINTS[region]["normal"] = null;
    CACHED_CONSTRAINTS[region]["qdh"] = null;
  }

  constraintsAPI(region, params, (data) => {
    if (data === "error") {
      callback("error");
      return;
    }
    const constraints = createFilterConstraints(data, searchType);
    if (region) CACHED_CONSTRAINTS[region][searchType] = JSON.parse(JSON.stringify(constraints));
    callback(constraints);
  });

  // API.graphql({
  //     query: queries[query],
  //     variables: {
  //         params: {
  //             path: region
  //         },
  //         query: {
  //             d: "constraints",
  //             ...params
  //         }
  //     }
  // }).then(function(response){
  //     const data = response.data[query];
  //     const constraints = createFilterConstraints(data, searchType);
  //     if (region) CACHED_CONSTRAINTS[region][searchType] = JSON.parse(JSON.stringify(constraints));
  //     callback(constraints);
  // }).catch(error => {
  //     console.log(error)
  //     callback('error');
  // });
};

export { constraintsAPI };
export { getConstraints };

// applyConstraints
export { updateConstraints };
export { updateSelectedFilters };
