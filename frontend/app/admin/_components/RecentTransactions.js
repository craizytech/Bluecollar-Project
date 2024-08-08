"use client";
import React, { useEffect, useState } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

function RecentTransactions() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        async function fetchTransactions() {
          const response = await fetch("http://localhost:5000/api/transactions/all");
          const data = await response.json();
          setTransactions(data);
        }
        fetchTransactions();
      }, []);
    return (
        <Card
            className="xl:col-span-2" x-chunk="dashboard-01-chunk-4"
        >
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>
                        Recent transactions from your store.
                    </CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href="/admin/transactions">
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden sm:table-cell">
                                Status
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                Date
                            </TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.transaction_id}
                                onClick={() => handleRowClick(transaction)}
                                className="cursor-pointer"
                            >
                                <TableCell>
                                    <div className="font-medium">
                                        {transaction.payer_name}
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge className="text-xs" variant="secondary">
                                        {transaction.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    {new Date(
                                        transaction.date_of_transaction
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    ${transaction.amount_paid.toFixed(2)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default RecentTransactions