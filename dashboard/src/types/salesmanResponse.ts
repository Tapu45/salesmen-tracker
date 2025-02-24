export interface LocationAnalytic {
    region: string;
    state: string;
    storeType: string;
    salesmanName: string;
    salesmanType: string;
    locationName: string;
    address: string;
    marketName: string;
    inTime: number | null;
    visited: string;
    visitedDistance: number | null;
    accuracyDistance: number | null;
  }
  
  export interface LocationAnalyticResponse {
    success: boolean;
    data: LocationAnalytic[];
  }