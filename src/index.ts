import { Comms } from "./comms";

(async function () {
  var comms = new Comms();
  var adverts = await comms.FetchDataFromAPI();
  console.log(adverts);
})();
