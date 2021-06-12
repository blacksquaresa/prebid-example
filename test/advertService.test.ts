import { AdvertService } from "../src/advertService";
import { IApnTag, IAdUnit, Advert } from "../src/advert";

describe("Advert Service", () => {
  let service: AdvertService;
  let fakeGlobal: any;
  beforeEach(() => {
    fakeGlobal = {
      pbjs: {
        que: {
          push: jest.fn().mockImplementation((func) => func()),
        },
        addedAdUnits: [],
        addAdUnits: jest.fn().mockImplementation((adUnits) => {
          fakeGlobal.pbjs.addedAdUnits = adUnits;
        }),
        requestBids: jest.fn().mockImplementation((opts) => {
          opts.bidsBackHandler();
        }),
        setTargetingForAst: jest.fn(),
      },
      apntag: {
        anq: {
          push: jest.fn().mockImplementation((func) => func()),
        },
        loadTags: jest.fn(),
        pageOptsSet: null,
        setPageOpts: jest.fn().mockImplementation((opts) => {
          fakeGlobal.apntag.pageOptsSet = opts;
        }),
        definedTags: [],
        defineTag: jest.fn().mockImplementation((tag: IApnTag) => {
          fakeGlobal.apntag.definedTags.push(tag);
        }),
      },
    };
    service = new AdvertService(fakeGlobal);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe("requestBids method", () => {
    let adUnits: IAdUnit[];
    beforeEach(() => {
      adUnits = [
        {
          bids: [],
          code: "bidCode",
          mediaTypes: { banner: { sizes: [[123, 456]] } },
        },
      ];
    });
    test("uses the pjbs queue", () => {
      service.requestBids(adUnits);
      expect(fakeGlobal.pbjs.que.push).toHaveBeenCalled();
    });
    test("adds adUnits", () => {
      service.requestBids(adUnits);
      expect(fakeGlobal.pbjs.addAdUnits).toHaveBeenCalled();
      expect(fakeGlobal.pbjs.addedAdUnits).toEqual(adUnits);
    });
    test("requests bids passing our initServer method", () => {
      service.requestBids(adUnits);
      expect(fakeGlobal.pbjs.requestBids).toHaveBeenCalledWith(
        expect.objectContaining({
          bidsBackHandler: service.initAdServer,
          timeout: 1000,
        })
      );
    });
  });
  describe("initAdServer method", () => {
    test("uses the pjbs and apntag queues", () => {
      service.initAdServer();
      expect(fakeGlobal.pbjs.que.push).toHaveBeenCalled();
      expect(fakeGlobal.apntag.anq.push).toHaveBeenCalled();
    });
    test("does not run or use queues when already run", () => {
      fakeGlobal.pbjs.requestSent = true;
      service.initAdServer();
      expect(fakeGlobal.pbjs.que.push).not.toHaveBeenCalled();
    });
    test("sets targeting for AST", () => {
      service.initAdServer();
      expect(fakeGlobal.pbjs.setTargetingForAst).toHaveBeenCalled();
    });
    test("loads tags", () => {
      service.initAdServer();
      expect(fakeGlobal.apntag.loadTags).toHaveBeenCalled();
    });
  });
  describe("setPageOptions method", () => {
    let adverts: Advert[];
    beforeEach(() => {
      adverts = [
        new Advert("unit1", "id1", [{ width: 123, height: 456 }], []),
        new Advert("unit2", "id2", [{ width: 987, height: 654 }], []),
      ];
    });
    test("uses the apntag queue", () => {
      service.setPageOptions(adverts);
      expect(fakeGlobal.apntag.anq.push).toHaveBeenCalled();
    });
    test("sets page options", () => {
      service.setPageOptions(adverts);
      expect(fakeGlobal.apntag.setPageOpts).toHaveBeenCalledWith(
        expect.objectContaining({
          member: 1543,
        })
      );
    });
    test("defines each tag", () => {
      service.setPageOptions(adverts);
      expect(fakeGlobal.apntag.defineTag).toHaveBeenCalledTimes(2);
      expect(fakeGlobal.apntag.defineTag).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          tagId: "unit1",
          sizes: [[123, 456]],
          targetId: "id1",
        })
      );
      expect(fakeGlobal.apntag.defineTag).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          tagId: "unit2",
          sizes: [[987, 654]],
          targetId: "id2",
        })
      );
    });
  });
});
