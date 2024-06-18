import React from 'react'
import CategorySideBar from './_components/CategorySideBar'

function layout({children}) {
  return (
    <div className="grid grid-cols-4">
        <div className="">
            {/* Side category nav bar */}
             <CategorySideBar/>
        </div>
        <div className="col-span-3">
            {children}
        </div>
    </div>
  )
}

export default layout