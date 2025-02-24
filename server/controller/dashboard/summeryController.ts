import { Response, Request } from "express";
import { Prisma } from "../../lib/prisma/prismaClinet";



export const getLocationAnalytic = async (req: Request, res: Response) => {
    try {
      console.log("Fetching location analytics...");
      
      // Get ALL salesmen
      const allSalesmen = await Prisma.salesMan.findMany();
      console.log(`Total salesmen fetched: ${allSalesmen.length}`);
      
      // Get ALL locations
      const allLocations = await Prisma.managedLocation.findMany();
      console.log(`Total locations fetched: ${allLocations.length}`);
      
      // Get ALL visited locations with related data
      const visitedLocations = await Prisma.visitedLocation.findMany({
        include: {
          Location: true,
          SalesMan: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      
      console.log(`Total visited locations fetched: ${visitedLocations.length}`);
      
      // Create a map to track which locations have been visited by which salesmen
      const visitedMap = new Map();
      
      // Build our locationAnalytics array
      const locationAnalytics = [];
      
      // Process all visited locations first
      visitedLocations.forEach(visit => {
        // Convert createdAt to minutes since midnight (for inTime)
        const inTimeMinutes = visit.createdAt.getHours() * 60 + visit.createdAt.getMinutes();
        
        // Create a unique key for this salesman-location combination
        const key = `${visit.salesManId}-${visit.locationId}`;
        visitedMap.set(key, true);
        
        locationAnalytics.push({
          region: visit.Location.region,
          state: visit.Location.state,
          storeType: visit.Location.storeType,
          salesmanName: visit.SalesMan.name,
          salesmanType: visit.SalesMan.salesManType,
          locationName: visit.Location.name,
          address: visit.Location.address,
          marketName: visit.Location.market_name,
          inTime: inTimeMinutes,
          visited: "Yes",
          visitedDistance: visit.scanDistance,
        });
      });
      
      // Now add records for all salesman-location combinations that don't exist
      for (const salesman of allSalesmen) {
        for (const location of allLocations) {
          const key = `${salesman.id}-${location.id}`;
          
          // If this combination hasn't been visited yet, add it
          if (!visitedMap.has(key)) {
            locationAnalytics.push({
              region: location.region,
              state: location.state,
              storeType: location.storeType,
              salesmanName: salesman.name,
              salesmanType: salesman.salesManType,
              locationName: location.name,
              address: location.address,
              marketName: location.market_name,
              inTime: null,
              visited: "No",
              visitedDistance: null,
            });
          }
        }
      }
      
      console.log(`Total location analytics records generated: ${locationAnalytics.length}`);
      
      // Debug info - log sample records
      locationAnalytics.slice(0, 5).forEach((record, index) => {
        console.log(`Record ${index + 1}:`, JSON.stringify({
          salesmanName: record.salesmanName,
          locationName: record.locationName,
          visited: record.visited,
          inTime: record.inTime
        }));
      });
      
      return res.status(200).json({
        success: true,
        data: locationAnalytics,
      });
    } catch (error) {
      console.error("Error fetching location analytics:", error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  };
  
  
  

export const getSalesmanVisits = async (req:Request, res:Response) => {
    try {
      const visits = await Prisma.assignSalesman.findMany({
        include: {
          Manager: true,
          SalesMan: true,
          Location: true,
        },
      });
  
      const formattedVisits = await Promise.all(
        visits.map(async (visit) => {
          // Fetch visited location details
          const visitedLocation = await Prisma.visitedLocation.findFirst({
            where: {
              salesManId: visit.salesManId,
              locationId: visit.locationId,
            },
            orderBy: {
              createdAt: "asc", // Get earliest visit time
            },
          });
  
          return {
            state: visit.Location.state,
            storeType: visit.Location.storeType,
            salesman: visit.SalesMan.name,
            salesmanType: visit.SalesMan.salesManType,
            storeName: visit.Location.name,
            address: visit.Location.address,
            market: visit.Location.market_name,
            intime: visitedLocation ? visitedLocation.createdAt : null,
            visited: visitedLocation ? "yes" : "no",
            scanDistance: visitedLocation ? visitedLocation.scanDistance : null,
          };
        })
      );
  
      return res.status(200).json({ success: true, data: formattedVisits });
    } catch (error) {
      console.error("Error fetching visits:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };



