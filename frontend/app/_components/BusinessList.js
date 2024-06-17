import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React from 'react'

function BusinessList({ title }) {
    return (
        <div className="mt-5">
            <h2 className="font-bold text-[22px]">{title}</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:girf-cols-4 gap-6 mt-5 shadow-sm">
                <div className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                    <Image src="/person1.jpg"
                        alt=""
                        width={500}
                        height={200}
                        className="h-[150px] md:h-[200px] object-cover rounded-lg"
                    />
                    <div className="flex flex-col items-baseline p-3 gap-1">
                        <h2 className="p-1 bg-blue-100 text-primary rounded-full px-2 text-[12px]">Cleaning</h2>
                        <h2 className="font-bold text-lg">House Cleaning</h2>
                        <h2 className="text-primary">Jenny Wilson</h2>
                        <h2 className="text-gray-500 text-sm9">255 Grand Park Ave, New York</h2>
                        <Button className="rounded-lg mt-3">Book Now</Button>
                    </div>
                </div>

                <div className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                    <Image src="/person2.jpg"
                        alt=""
                        width={500}
                        height={200}
                        className="h-[150px] md:h-[200px] object-cover rounded-lg"
                    />
                    <div className="flex flex-col items-baseline p-3 gap-1">
                        <h2 className="p-1 bg-blue-100 text-primary rounded-full px-2 text-[12px]">Masonry</h2>
                        <h2 className="font-bold text-lg">Building Works</h2>
                        <h2 className="text-primary">Emma Potter</h2>
                        <h2 className="text-gray-500 text-sm9">525 Tyron Street, New York</h2>
                        <Button className="rounded-lg mt-3">Book Now</Button>
                    </div>
                </div>

                <div className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                    <Image src="/person3.jpg"
                        alt=""
                        width={500}
                        height={200}
                        className="h-[150px] md:h-[200px] object-cover rounded-lg"
                    />
                    <div className="flex flex-col items-baseline p-3 gap-1">
                        <h2 className="p-1 bg-blue-100 text-primary rounded-full px-2 text-[12px]">Plumbing</h2>
                        <h2 className="font-bold text-lg">Water Works</h2>
                        <h2 className="text-primary">Dexter Daps</h2>
                        <h2 className="text-gray-500 text-sm9">30 Red Hills Road, Kingston</h2>
                        <Button className="rounded-lg mt-3">Book Now</Button>
                    </div>
                </div>

                <div className="shadow-md rounded-lg hover:shadow-lg cursor-pointer hover:shadow-primary hover:scale-105 transition-all ease-in-out">
                    <Image src="/person2.jpg"
                        alt=""
                        width={500}
                        height={200}
                        className="h-[150px] md:h-[200px] object-cover rounded-lg"
                    />
                    <div className="flex flex-col items-baseline p-3 gap-1">
                        <h2 className="p-1 bg-blue-100 text-primary rounded-full px-2 text-[12px]">Electric</h2>
                        <h2 className="font-bold text-lg">House Wiring</h2>
                        <h2 className="text-primary">Buju Banton</h2>
                        <h2 className="text-gray-500 text-sm9">70 East St Kingston, Jamaica</h2>
                        <Button className="rounded-lg mt-3">Book Now</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessList