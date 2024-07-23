import React from 'react'
import DashboardOverview from '../_components/DashboardOverview'
import RecentTransactions from '../_components/RecentTransactions'
import RecentUsers from '../_components/RecentUsers'

function DashboardPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <DashboardOverview/>
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <RecentTransactions/>
                <RecentUsers/>
            </div>
        </div>
    )
}

export default DashboardPage;