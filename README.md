# Prebid Example

This project was put together to demonstrate the use of the [PreBid js](https://docs.prebid.org/prebid/prebidjs.html) system using an [AppNexus AST](https://docs.xandr.com/bundle/seller-tag/page/seller-tag.html).

> See a demonstration of the project with [Absolutely African Animals](https://www.blacksquare.co.za/prebid-example)

The requirements for this project are as follows:

Docs: https://docs.prebid.org/prebid/prebidjs.html
The endpoint to use: https://60bcfd7fb8ab3700175a005b.mockapi.io/eg/ads

1. Build a prebid.js file with AppNexus bidder adapter.
2. Create a publicly accessible test page with 3 ad units with div id's (eg-ad-1, eg-ad-2, eg-ad-3) respectively on the page
3. These three adunits have to be sticky units and the position of the stickies is determined by the response from the endpoint URL: https://60bcfd7fb8ab3700175a005b.mockapi.io/eg/ads
4. The response is an array of objects with properties associated with each of these div ids:

- "closeBtn": type boolean - if true, then add a "close x" button on the top right of the adunit that deletes the div element on page. if false, do not add the button
- "position": type string - if the value is "left" add the sticky unit to the left, if the value is "right" add the sticky unit to the right and if the value is "bottom" add the sticky unit to the bottom. please center align these divs on the page
- "refresh": type boolean - This property decides if we have to refresh adunits. it only works with the "refreshSettings" property. if a refresh is true and there is a missing "refreshSettings" property from the object please throw an error and add proper exception handlers. if a refresh is false, then do not refresh the ad.
- "refreshSettings": type object - It has three properties: "delay", "repeat" and "btnClick". when btnClick is enabled add a button to the bottom of the ad with the innerText "Refresh AD" when clicked refreshes the ad otherwise, we should turn on automatic refresh with an interval of value provided in delay in ms, repeat until the given count in repeat property
- "bids": type array - use this property for bids in the prebid adUnits request object
- "sizes": type array - use this property for sizes in the prebid adUnits request object
- "id": type string - id of the element that request ads
- "unit": type string - GAM unit path to define slots

#### Additional Notes:

Refreshing an ad means requesting a new ad for the div element on the page. Can be done in two ways:

1. automatically send bid requests using delay and repeat properties in refreshSettings
2. request new bids every time user clicks the button "Refresh AD" created from the above steps

## Structure of the Project

This little demonstration is made up of the following components:

1. Comms - a class to handle communication with the initial API. Uses fetch.
2. Advert Factory - used to generate an Advert object from the data returned from the API request
3. Advert - a class to encapsulate all the information about an individual advert, and to handle the DOM interactions for that advert
4. Advert Observer - monitors the advert DIV, and reacts when it changes. This class adds (or re-adds) the close and refresh buttons, and initiates the refresh timer
5. Advert Service - encapsulates all the code required to initialise the Prebid and AST libraries. This code is run only once, when the page is initialised. Encapsulated into a service to make it easy to test.
6. Index - the entry point for the whole system. Orchestrates the startup.

## Notes on the Project

### Usage

A user might use this system by adding the following code snippet to the head of their page:

```
<link rel="stylesheet" href="advert.css" />
<script type="text/javascript" src="prebid5.0.0.js" async></script>
<script type="text/javascript" src="//acdn.adnxs.com/ast/ast.js" async></script>
<script src="advert.js" defer></script>
```

If the user knows about the adverts, and would like to place them inline in the page, they can provide placeholders for each advert, and apply whatever CSS they like to the element. the ID for this element must be container-for-_id-of-element_ where _id-of-element_ is the ID as provided by the API data.

```
<div id="container-for-eg-1-div" class="my-container></div>
```

If no container is provided for the advert, an absolutely positioned container will be created.

### Testing

I have added unit tests for a lot of the project. I expect we'd find about 80% coverage. I have not added end-to-end tests.

In some cases (the AdvertObserver being the most obvious example), I have made some methods that should have been private into public methods to make them easier to test. While I understand the general need to keep private methods private, and not to change the code base for testing, it is sometimes just more important to be able to test code than to follow the rules.

### Browser compatibility

I have only tested this on Chrome on Windows (desktop). The CSS and JavaScript used here is generally standard, and most modern browsers should handle it all the same, but there will inevitably be some differences (I'd put my money on IOS Safari having some issues).

### Stickiness

I wasn't quite sure what was meant by sticky. The `position: sticky` option didn't make a lot of sense for the left and right adverts, so I initially used absolutely positioned adverts (that stick to left, right and bottom). In the end, there are two pages to demonstrate this system using two possible options:

- [Absolutely African Animals](https://www.blacksquare.co.za/prebid-example)
- [Sticky African Animals](https://www.blacksquare.co.za/prebid-example/sticky.html)

### Why African Animals?

I like African animals, and I have a lot of photos of them. Who doesn't like wild animals? I needed enough content to demonstrate scrolling.

### Localhost

I spent an embarrassingly long time working out that the ad service will not work for localhost. I has a whole webpack dev server set up and everything. Almost immediately after I discovered the issue and fixed it, I found [this](https://docs.xandr.com/bundle/seller-tag/page/ast-api-reference.html). Moral of the story - read the docs properly first.

### AST Member ID

I couldn't find anywhere that told me what member ID to use, so I just used the one they publish with all their demonstrations.

### Positon

The position property of the initial API call is mis-spelled. I assume this was deliberate to catch me out ;). In the end, I support both correct and incorrect spellings.
