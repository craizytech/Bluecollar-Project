import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React from 'react'

function Hero() {
  return (
    <div className="flex items-center flex-col justify-center">
        <h2 className="font-bold text-[46px] text-center pt-14 pb-7">
            Find Home <span className="text-primary">Service/Repair</span> Near You</h2>
        <h2 className="text-xl text-gray-400">Explore Best Home Service & Repair near you</h2>
        <div className="flex gap-4 items-center mt-5">
            <Input placeholder='Search' className="rounded-lg md:w-[350px]"/>
            <Button className="">
                <Search/>
            </Button>
        </div>
    </div>
  )
}

export default Hero