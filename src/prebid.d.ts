export let que: Function[];

export let requestSent: boolean;

export function addAdUnits(adUnits: any): void;

export function setTargetingForAst(): void;

export function requestBids(options: {
  bidsBackHandler: Function;
  timeout: number;
}): void;

export as namespace pbjs;
