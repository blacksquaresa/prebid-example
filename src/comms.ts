import { Advert } from "./advert";
import { AdvertFactory } from "./advertFactory";

const APIURL = "https://60bcfd7fb8ab3700175a005b.mockapi.io/eg/ads";

/**
 * The Comms class is used exclusively for communicating to APIs
 * In this case, there is just one method representing one call
 *
 * @export
 * @class Comms
 */
export class Comms {
  /**
   * Representing a call to the Adverts API provided for this project.
   * If the call is successful, this method will return an array of Advert objects
   *
   * @return An array of advert objects
   */
  public async fetchAdvertsFromAPI(): Promise<Advert[]> {
    try {
      let response = await fetch(APIURL);
      if (!response.ok) {
        throw new Error(
          `Response from the API failed with ${response.status} ${response.statusText}`
        );
      }

      let data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error("Data is not an array");
      }

      var factory = new AdvertFactory();
      var result: Advert[] = (data as Array<any>).map(factory.fromData);
      return result;
    } catch (err) {
      console.log(
        "Failed to download data from the API. Errors will be swallowed so as not to interupt users' experience"
      );
      console.error(err);
    }

    return [];
  }
}
