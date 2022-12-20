import { Amplify, API, graphqlOperation } from "aws-amplify";
import * as queries from "../../src/graphql/queries";
import awsExports from "../../src/aws-exports";
Amplify.configure(awsExports);

import { searchParmsToKeep, getUrlParamsObj } from "./utils";
import getMockStoryBookHomes from '../../lib/getMockStoryBookHomes'

const groupPlansByCommunity = function (plans) {
  var len = plans.length;
  var coms = {};
  var tempPlans = [...plans];

  for (var i = 0; i < len; i++) {
    var com = {};
    var plan = tempPlans[i];
    var com_id = plan.communityId;

    if (plan.masterCommunityId) {
      //if masterID exists, group by masterId so all plans are on one master marker on map
      com_id = plan.masterCommunityId;
    }

    if (coms[com_id]) {
      coms[com_id].plans.push(plan);
    } else {
      com = {
        plans: [plan],
        lon: plan.communityLon,
        lat: plan.communityLat,
        metroId: plan.metroId,
        metroName: plan.metroName,
      };

      coms[com_id] = com;
    }
  }

  return Object.keys(coms).map(function (key) {
    return coms[key];
  });
};

const getCleanComData = function (data, planSearch, metroFilters) {
  var coms = [];
  var combined_coms = {}; //combining coms by their lat, lon to eliminate coms that have same exact lat, lon and showing them all with one marker
  var key = "";
  var coords = [];
  var isQdhSearch = planSearch;

  if (!isQdhSearch) {
    if (data[0] && data[0].planid) {
      isQdhSearch = true;
    }
  }

  if (!isQdhSearch) {
    coms = data;
  } else {
    coms = groupPlansByCommunity(data);
  }

  var len = coms.length;

  if (len > 0) {
    for (var i = 0; i < len; i++) {
      var com = coms[i];
      var isMetroActive = true;

      if (metroFilters) isMetroActive = metroFilters.indexOf(com.metroId) > -1;
      if (metroFilters && metroFilters.length === 0) isMetroActive = true;

      if (com.isMaster && isMetroActive) {
        var items = [com];
        //var collections = com.communities;

        //var col_len = collections.length;
        key = Math.abs(com.lon) + "_" + Math.abs(com.lat);
        coords = [com.lon, com.lat];

        //for (var j = 0; j < col_len; j++) {
        //var collection = collections[j];
        //items.push(collection);
        //}

        if (!combined_coms[key]) {
          combined_coms[key] = {
            items: items,
            coords: coords,
            isMaster: true,
          };
        } else {
          combined_coms[key].items = combined_coms[key].items.concat(items);
        }
      } else if (isMetroActive) {
        var items = [];
        var isPlans = false;
        key = Math.abs(com.lon) + "_" + Math.abs(com.lat);
        coords = [com.lon, com.lat];

        if (!isQdhSearch) {
          items = [com];
        } else {
          isPlans = true;
          items = com.plans;
        }

        if (!combined_coms[key]) {
          combined_coms[key] = {
            items: items,
            coords: coords,
            isPlans: isPlans,
          };
        } else {
          combined_coms[key].items = combined_coms[key].items.concat(items);
        }
      }
    }

    return combined_coms;
  } else {
    return [];
  }
};

const getDisplayName = (data) => {
  let displayName = "";

  if (data.geoSearch) {
    displayName = "Current Location";
  } else if (data.megaSearchCity) {
    displayName = data.megaSearchCity + ", " + data.displayStateAbbreviation;
  } else {
    displayName = data.displaySearchName;
  }

  return displayName;
};





//This gets Storybook data only
const getAllData = async() => {
  try {
    let query = queries.getStoryBookHomes;
    let response = await API.graphql({
      query: query
    });

    //Parse the Data here...

    return response;
  } catch (e) {
    console.error(e)
    // TODO Dev only
    // return getMockStoryBookHomes()
  }
}






//This is likely unneeded
const SearchData = async (type, searchFilters, location, data, metroFilters, callback) => {
  console.log('type', type)
  let query = queries.getSearchResult;
  let params = {};

  if (type === "METRO_CHANGED") {
    console.log("clean data by metro filters");
    let cleanData = getCleanComData(data, null, metroFilters);
    callback(cleanData);
  } else if (type === "DEFAULT") {
    console.log("clean data using original data");
    let cleanData = getCleanComData(data, null, metroFilters);
    callback(cleanData);
  } else {
    //fetch with filters
    console.log("fetch search data");
    console.log('location', location)
    let searchLocation = "";
    if (location.region) {
      searchLocation = `${location.region}`;
      if (location.modelSearch) {
        params = getUrlParamsObj(searchParmsToKeep(location, true));
      }
    } else {
      //most likely for search such as 'communityId=12356&communityId=44566 or lat/lon?
      query = queries.getAllSearchResultAll;
      params = getUrlParamsObj(searchParmsToKeep(location));
    }

    let filters = getUrlParamsObj(searchFilters);

    let response = await API.graphql({
      query: query,
      variables: {
        params: {
          path: searchLocation,
        },
        query: {
          d: "json",
          c_type: 'Storybook',
          ...params,
          ...filters,
        },
      },
    });
    // .then(response => {
    //     let fetchedData = response.data.getSearchResult || response.data.getAllSearchResultAll;
    //     if (fetchedData) {
    //         //console.log(fetchedData)
    //         let cleanData = getCleanComData(fetchedData.perfect, fetchedData.onlyQDHSearch, metroFilters);
    //         if (callback) callback(cleanData, fetchedData, fetchedData.metros);
    //         else return fetchedData;
    //     }
    // }).catch(error => {
    //     console.log(error)
    //     callback('error');
    // });

    const fetchedData = response.data.getSearchResult || response.data.getAllSearchResultAll;

    if (!fetchedData) {
      console.log(response.errors);
      if (callback) callback("error");
    } else if (callback) {
      let cleanData = getCleanComData(fetchedData.perfect, fetchedData.onlyQDHSearch, metroFilters);
      callback(cleanData, fetchedData, fetchedData.metros);
    } else {
      return fetchedData;
    }
  }
};

export { SearchData, getCleanComData, getDisplayName, getAllData };
