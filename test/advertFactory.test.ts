import { AdvertFactory } from "../src/advertFactory";

describe("Advert Factory", () => {
  let factory: AdvertFactory;
  beforeEach(() => {
    factory = new AdvertFactory();
  });
  describe("FromData method", () => {
    test("fails if the element is null", () => {
      expect(() => factory.fromData(null)).toThrow();
    });
    test("fails if the element is undefined", () => {
      expect(() => factory.fromData(undefined)).toThrow();
    });
    test("fails if the unit is missing", () => {
      expect(() =>
        factory.fromData({ id: "id", sizes: [], bids: [] })
      ).toThrow();
    });
    test("fails if the id is missing", () => {
      expect(() =>
        factory.fromData({ unit: "unit", sizes: [], bids: [] })
      ).toThrow();
    });
    test("fails if the sizes is missing", () => {
      expect(() =>
        factory.fromData({ unit: "unit", id: "id", bids: [] })
      ).toThrow();
    });
    test("fails if the sizes is not an array", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: "notanarray",
          bids: [],
        })
      ).toThrow();
    });
    test("fails if a size is not an array", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: ["notanarray"],
          bids: [],
        })
      ).toThrow();
    });
    test("fails if a size array has less than two elements", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [[1]],
          bids: [],
        })
      ).toThrow();
    });
    test("fails if a size array has more than two elements", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [[1, 2, 3]],
          bids: [],
        })
      ).toThrow();
    });
    test("fails if the bids is missing", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [],
          bids: "notanarray",
        })
      ).toThrow();
    });
    test("fails if a bid has no bidder", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [],
          bids: [{ params: { placementId: 12345 } }],
        })
      ).toThrow();
    });
    test("fails if a bid has no params", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [],
          bids: [{ bidder: "bidder" }],
        })
      ).toThrow();
    });
    test("fails if a bid has no placement Id", () => {
      expect(() =>
        factory.fromData({
          unit: "unit",
          id: "id",
          sizes: [],
          bids: [{ bidder: "bidder", params: {} }],
        })
      ).toThrow();
    });
    test("correctly creates an advert", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "left",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.unit).toBe("unit");
      expect(advert.id).toBe("id");
      expect(advert.refresh).toBe(true);
      expect(advert.position).toBe("left");
      expect(advert.closeBtn).toBe(true);
      expect(advert.refreshSettings).toEqual(
        expect.objectContaining({ btnClick: "enabled" })
      );
    });
    test("correctly sets sizes", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [
          [120, 240],
          [360, 480],
        ],
        bids: [],
        refresh: true,
        positon: "left",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.sizes).toEqual(
        expect.arrayContaining([
          { width: 120, height: 240 },
          { width: 360, height: 480 },
        ])
      );
    });
    test("correctly sets bids", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [
          { bidder: "bidder1", params: { placementId: 34567 } },
          { bidder: "bidder2", params: { placementId: 76543 } },
        ],
        refresh: true,
        positon: "left",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.bids).toEqual(
        expect.arrayContaining([
          { bidder: "bidder1", params: { placementId: 34567 } },
          { bidder: "bidder2", params: { placementId: 76543 } },
        ])
      );
    });
    test("supports right position", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "right",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.position).toBe("right");
    });
    test("defaults to bottom position", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "anythingElse",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.position).toBe("bottom");
    });
    test("uses a delay for a refreshSettings", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "anythingElse",
        closeBtn: true,
        refreshSettings: { delay: 100 },
      });
      expect(advert.refreshSettings).toEqual(
        expect.objectContaining({ delay: 100, repeat: 0 })
      );
    });
    test("uses a repeat for a refreshSettings", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "anythingElse",
        closeBtn: true,
        refreshSettings: { repeat: 50 },
      });
      expect(advert.refreshSettings).toEqual(
        expect.objectContaining({ delay: 0, repeat: 50 })
      );
    });
    test("uses a btnClick for a refreshSettings", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "anythingElse",
        closeBtn: true,
        refreshSettings: { btnClick: "enabled" },
      });
      expect(advert.refreshSettings).toEqual(
        expect.objectContaining({ btnClick: "enabled" })
      );
    });
    test("ignores a btnClick that is not enabled", () => {
      let advert = factory.fromData({
        unit: "unit",
        id: "id",
        sizes: [],
        bids: [],
        refresh: true,
        positon: "anythingElse",
        closeBtn: true,
        refreshSettings: { btnClick: "disabled" },
      });
      expect(advert.refreshSettings).toBeUndefined();
    });
  });
});
