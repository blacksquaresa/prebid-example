import fetchMock from "jest-fetch-mock";
import { Comms } from "../src/comms";
import { Advert } from "../src/advert";

fetchMock.enableMocks();

describe("Comms class", () => {
  let comms: Comms;
  beforeEach(() => {
    comms = new Comms();
  });
  afterEach(() => {
    fetchMock.mockClear();
  });
  describe("fetchAdvertsFromAPI method", () => {
    test("fails silently for a network error", async () => {
      fetchMock.mockRejectOnce();
      let result = await comms.fetchAdvertsFromAPI();
      expect(result).toEqual([]);
    });
    test("fails silently for a non 200 response", async () => {
      fetchMock.mockResponseOnce(() =>
        Promise.resolve({ status: 404, body: "not found" })
      );
      let result = await comms.fetchAdvertsFromAPI();
      expect(result).toEqual([]);
    });
    test("fails silently if the response is not an array", async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ not: "an array" }));
      let result = await comms.fetchAdvertsFromAPI();
      expect(result).toEqual([]);
    });
    test("creates an advert from a well formed response", async () => {
      fetchMock.mockResponseOnce(
        JSON.stringify([
          {
            unit: "/19968336/header-bid-tag-2",
            id: "eg-ad-1",
            sizes: [[160, 600]],
            refresh: true,
            positon: "left",
            refreshSettings: {
              delay: 30000,
              repeat: 50,
            },
            closeBtn: true,
            bids: [
              {
                bidder: "appnexus",
                params: {
                  placementId: 13144370,
                },
              },
            ],
          },
        ])
      );
      let result = await comms.fetchAdvertsFromAPI();
      expect(result).toEqual(expect.arrayContaining([expect.any(Advert)]));
    });
  });
});
