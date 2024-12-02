"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

function DashboardOverview() {
    const [customerCount, setCustomerCount] = useState(0);
    const [employeeCount, setEmployeeCount] = useState(0);
    const [serviceCount, setServiceCount] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);

    const TotalRevenueCard = () => {

        useEffect(() => {
            const fetchTotalRevenue = async () => {
                try {
                    const response = await fetch('http://localhost:5000/api/transactions/total-revenue');
                    const data = await response.json();
                    setTotalRevenue(data.total_revenue);
                } catch (error) {
                    console.error('Error fetching total revenue:', error);
                }
            };

            fetchTotalRevenue();
        }, []);
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const customerResponse = await fetch('http://localhost:5000/api/users/count/customers');
                const customerData = await customerResponse.json();
                setCustomerCount(customerData.count);

                const employeeResponse = await fetch('http://localhost:5000/api/users/count/employees');
                const employeeData = await employeeResponse.json();
                setEmployeeCount(employeeData.count);

                const serviceResponse = await fetch('http://localhost:5000/api/services/count/services');
                const serviceData = await serviceResponse.json();
                setServiceCount(serviceData.count);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);

    return (
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card x-chunk="dashboard-01-chunk-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Revenue
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Ksh{totalRevenue.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{customerCount}</div>
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Employees</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{employeeCount}</div>
                </CardContent>
            </Card>
            <Card x-chunk="dashboard-01-chunk-3">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{serviceCount}</div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DashboardOverview;
