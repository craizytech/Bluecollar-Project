import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function List({ data }) {
    const nearbyProviders = data.filter((provider) => provider.distance !== null && provider.distance <= 6000);

    return (
      <div className="mt-8 w-full">
        <h2 className="font-bold text-[22px]">Service providers near me</h2>
        {nearbyProviders.length === 0 ? (
        // Display a message if no providers are nearby
        <p className="mt-5 text-3xl text-gray-600">
          No service providers nearby. Please try again later.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-5 shadow-sm w-full">
          {nearbyProviders.map((provider, index) => (
            <li
              key={`${provider.id || provider.providerId}-${index}`}
              // style={{
              //   marginBottom: "10px",
              //   padding: "10px",
              //   border:
              //     provider.distance !== null && provider.distance <= 5000
              //       ? "2px solid green"
              //       : "1px solid gray",
              //   borderRadius: "5px",
              // }}
              className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out"
            >
              <Image
                src={`/person${provider.providerId % 3 + 1}.jpg`}
                alt=""
                width={500}
                height={200}
                className="h-[150px] md:h-[200px] object-cover rounded-lg"
              />
              <div className="flex flex-col items-baseline p-3 gap-1">
                <h4 className="text-primary">{provider.name}</h4>
                <h2 className="font-bold text-lg">{provider.serviceName}</h2>
                {provider.distance !== null && (
                  <p className="text-gray-500 text-m">
                    Distance: {(provider.distance / 1000).toFixed(2)} km
                    {provider.distance <= 5000 && (
                      <span style={{ color: "green", marginLeft: "5px" }}>
                        (Nearby)
                      </span>
                    )}
                  </p>
                )}
                <Link
                  href={`/Booking?serviceId=${provider.serviceId}&categoryId=${provider.categoryId}`}
                >
                  <Button className="rounded-lg mt-3">View Details</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    );
  }
  
  export default List;