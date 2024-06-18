import Image from 'next/image'
import React from 'react'

function CategorySideBar() {
    return (
        <div>
            <h2 className="font-bold mb-3 text-lg text-primary">Categories</h2>
            <div className="">
                <div className="flex gap-2 p-3 border rounded-lg mb-3 md:mr-10 cursor-pointer hover:bg-blue-50 hover:text-primary hover:border-primary transition-all ease-in-out shadow-md items-center">
                    <Image src="/mop.png"
                        alt="icon"
                        width={30}
                        height={30} />
                    <h2 className="">Cleaning</h2>
                </div>


                <div className="flex gap-2 p-3 border rounded-lg mb-3 md:mr-10 cursor-pointer hover:bg-blue-50 hover:text-primary hover:border-primary transition-all ease-in-out shadow-md items-center">
                    <Image src="/bricklayer.png"
                        alt="icon"
                        width={30}
                        height={30} />
                    <h2 className="">Masonry</h2>
                </div>

                <div className="flex gap-2 p-3 border rounded-lg mb-3 md:mr-10 cursor-pointer hover:bg-blue-50 hover:text-primary hover:border-primary transition-all ease-in-out shadow-md items-center">
                    <Image src="/repairing.png"
                        alt="icon"
                        width={30}
                        height={30} />
                    <h2 className="">Plumbing</h2>
                </div>

                <div className="flex gap-2 p-3 border rounded-lg mb-3 md:mr-10 cursor-pointer hover:bg-blue-50 hover:text-primary hover:border-primary transition-all ease-in-out shadow-md items-center">
                    <Image src="/energy.png"
                        alt="icon"
                        width={30}
                        height={30} />
                    <h2 className="">Electric</h2>
                </div>

            </div>
        </div>
    )
}

export default CategorySideBar