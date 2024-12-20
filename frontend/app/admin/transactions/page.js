"use client";
import React, { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  Copy,
  CreditCard,
  File,
  ListFilter,
  MoreVertical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filters, setFilters] = useState({ paid: true, cancelled: false, failed: false });
  const [activeTab, setActiveTab] = useState("week");

  useEffect(() => {
    async function fetchTransactions() {
      const response = await fetch("http://localhost:5000/api/transactions/all");
      const data = await response.json();
      setTransactions(data);
      filterTransactions(data, filters);
    }
    fetchTransactions();
  }, []);

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const filterTransactions = (data, filters) => {
    const filtered = data.filter(transaction => 
      (filters.paid && transaction.status === "paid") ||
      (filters.cancelled && transaction.status === "cancelled") ||
      (filters.failed && transaction.status === "failed")
    );
    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (filter) => {
    const updatedFilters = { ...filters, [filter]: !filters[filter] };
    setFilters(updatedFilters);
    filterTransactions(transactions, updatedFilters);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Customer", "Status", "Date", "Amount"];
    const tableRows = [];

    filteredTransactions.forEach(transaction => {
      const transactionData = [
        transaction.payer_name,
        transaction.status,
        new Date(transaction.date_of_transaction).toLocaleDateString(),
        `$${transaction.amount_paid.toFixed(2)}`,
      ];
      tableRows.push(transactionData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.text("Transactions Report", 14, 15);
    doc.save(`transactions_${activeTab}.pdf`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <nav className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Transactions</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Recent Transactions</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </nav>
        <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <Tabs defaultValue="week" onValueChange={setActiveTab}>
              <div className="flex items-center">
                <TabsList>
                  <TabsTrigger value="week">Year</TabsTrigger>
                </TabsList>
                <div className="ml-auto flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-sm"
                      >
                        <ListFilter className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem 
                        checked={filters.paid}
                        onCheckedChange={() => handleFilterChange('paid')}
                      >
                        paid
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={filters.cancelled}
                        onCheckedChange={() => handleFilterChange('cancelled')}
                      >
                        cancelled
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem 
                        checked={filters.failed}
                        onCheckedChange={() => handleFilterChange('failed')}
                      >
                        failed
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-sm"
                    onClick={exportToPDF}
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Export</span>
                  </Button>
                </div>
              </div>
              <TabsContent value="week">
                <Card x-chunk="dashboard-05-chunk-3">
                  <CardHeader className="px-7">
                    <CardTitle>Transactions</CardTitle>
                    <CardDescription>
                      Recent transactions from the platform.
                    </CardDescription>
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
                        {filteredTransactions.map((transaction) => (
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
                              Ksh{transaction.amount_paid.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          {selectedTransaction && (
            <div>
              <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
                <CardHeader className="flex flex-row items-start bg-muted/50">
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                      Transaction {selectedTransaction.transaction_id}
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">
                          Copy Transaction ID
                        </span>
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Date:{" "}
                      {new Date(
                        selectedTransaction.date_of_transaction
                      ).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                        >
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Amount Paid
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      Ksh{selectedTransaction.amount_paid.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
                {/* <CardFooter>
                  <Button size="sm">Download Receipt</Button>
                </CardFooter> */}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionsPage;