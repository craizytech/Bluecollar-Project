import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function CategoryList() {
    return (
        <div className="mt-14 mx-4 md:mx-22 lg:mx-52 grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/search/cleaning" className="flex flex-col items-center justify-center gap-2 bg-blue-50 p-4 rounded-lg hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                <Image src="/mop.png"
                    alt="icon"
                    width={35}
                    height={35} />

                <h2 className="text-primary">Cleaning</h2>
            </Link>
            <Link href="/search/masonry" className="flex flex-col items-center justify-center gap-2 bg-blue-50 p-4 rounded-lg hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                <Image src="/bricklayer.png"
                    alt="icon"
                    width={35}
                    height={35} />
                <h2 className="text-primary">Masonry</h2>
            </Link>
            <Link href="/search/plumbing" className="flex flex-col items-center justify-center gap-2 bg-blue-50 p-4 rounded-lg hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                <Image src="/repairing.png"
                    alt="icon"
                    width={35}
                    height={35} />
                <h2 className="text-primary">Plumbing</h2>
            </Link>
            <Link href="/search/electric" className="flex flex-col items-center justify-center gap-2 bg-blue-50 p-4 rounded-lg hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                <Image src="/energy.png"
                    alt="icon"
                    width={35}
                    height={35} />
                <h2 className="text-primary">Electric</h2>
            </Link>
        </div>
    )
}

export default CategoryList