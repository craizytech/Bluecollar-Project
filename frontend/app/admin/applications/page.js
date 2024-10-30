"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Copy,
    CalendarDays,
    NotepadText,
    LayoutGrid,
    Mail,
    ListTodo,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    MoreHorizontal,
    X,
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);  // Retained State
    const [alert, setAlert] = useState(null);
    const [filter, setFilter] = useState('all');
    const [timeframe, setTimeframe] = useState('week');

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await fetch("http://localhost:5000/api/services/applications");
                const data = await response.json();
                setApplications(data);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Applications fetched successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } catch (error) {
                console.error("Error fetching applications:", error);
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch applications.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        }
        fetchApplications();
    }, []);

    useEffect(() => {
        filterApplications();
    }, [filter, timeframe, applications]);

    const filterApplications = () => {
        let filtered = applications;

        if (filter !== 'all') {
            filtered = filtered.filter(app => app.status === filter);
        }

        const now = new Date();
        filtered = filtered.filter(app => {
            const applicationDate = new Date(app.date_of_application);
            if (timeframe === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return applicationDate >= weekAgo;
            } else if (timeframe === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return applicationDate >= monthAgo;
            } else if (timeframe === 'year') {
                const yearAgo = new Date();
                yearAgo.setFullYear(now.getFullYear() - 1);
                return applicationDate >= yearAgo;
            }
            return true;
        });

        setFilteredApplications(filtered);
    };

    const handleRowClick = (application) => {
        setSelectedApplication(application);
    };

    const handleApprove = async (applicationId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/approve`);

            setApplications(prevApplications => prevApplications.map(app =>
                app.application_id === applicationId ? { ...app, status: 'approved' } : app
            ));

            const userResponse = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/update-role`, { role_id: 2 });
            console.log(userResponse.data);
            setAlert({
                variant: "success",
                title: "Success",
                description: "Application approved successfully.",
                icon: <CheckCircle className="h-4 w-4" />,
            });
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Failed to approve application/Updating User Role failed.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            console.error("Failed to approve application:", error);
        }
    };

    const handleDecline = async (applicationId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/decline`);

            setApplications(prevApplications => prevApplications.map(app =>
                app.application_id === applicationId ? { ...app, status: 'declined' } : app
            ));
            console.log(response);
            const userResponse = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/downgrade-role`, { role_id: 3 });
            console.log(userResponse.data);
            setAlert({
                variant: "success",
                title: "Success",
                description: "Application declined successfully.",
                icon: <CheckCircle className="h-4 w-4" />,
            });
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Failed to decline application.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            console.error("Failed to decline application:", error);
        }
    };

    const handleExport = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Applications Report", 14, 22);

        doc.setFontSize(12);
        const headers = [["Email", "Service Category", "Service", "Status", "Date of Application"]];

        const rows = filteredApplications.map(application => [
            application.email,
            application.service_category,
            application.service_duration,
            application.service,
            application.status.charAt(0).toUpperCase() + application.status.slice(1),
            new Date(application.date_of_application).toLocaleDateString(),
        ]);

        // AutoTable plugin for creating the table structure
        doc.autoTable({
            head: headers,
            body: rows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [22, 160, 133] }, // Custom color for the header
            styles: { halign: 'left' }, // Align text to the left
        });

        doc.save("applications_report.pdf");
        setAlert({
            variant: "success",
            title: "Success",
            description: "Report exported successfully.",
            icon: <CheckCircle className="h-4 w-4" />,
        });
    };


    const handleDelete = async (applicationId) => {
        try {
            await axios.delete(`http://localhost:5000/api/services/applications/${applicationId}`);
            setApplications(prevApplications => prevApplications.filter(app => app.application_id !== applicationId));
            setSelectedApplication(null);
            setAlert({
                variant: "success",
                title: "Success",
                description: "Application deleted successfully.",
                icon: <CheckCircle className="h-4 w-4" />,
            });
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete application.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            console.error("Failed to delete application:", error);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            {alert && (
                <div className="fixed bottom-20 right-20 flex items-center justify-center z-50 w-auto">
                    <Alert variant={alert.variant}>
                        {alert.icon}
                        <AlertTitle>{alert.title}</AlertTitle>
                        <AlertDescription>{alert.description}</AlertDescription>
                    </Alert>
                </div>
            )}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <nav className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-0">
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="#">Applications</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Recent Applications</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-auto h-8 w-8 border-dashed"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open Menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Export PDF</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleExport}>PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </nav>
                <Tabs
                    defaultValue="week"
                    onValueChange={(value) => setTimeframe(value)}
                    className="px-4 pb-4 pt-1 sm:px-0 sm:pt-0"
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <TabsList className="rounded-lg border">
                            <TabsTrigger value="week">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Week
                            </TabsTrigger>
                            <TabsTrigger value="month">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Month
                            </TabsTrigger>
                            <TabsTrigger value="year">
                                <CalendarDays className="mr-2 h-4 w-4" />
                                Year
                            </TabsTrigger>
                        </TabsList>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="sm:w-48">
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setFilter('all')}>
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('approved')}>
                                    Approved
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('pending')}>
                                    Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('declined')}>
                                    Declined
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <TabsContent value="week">
                        <Card className="overflow-hidden rounded-lg border">
                            <CardHeader className="bg-muted/50 px-6 py-4">
                                <CardTitle className="text-base">Application Requests</CardTitle>
                                <CardDescription className="text-sm">
                                    Showing {filteredApplications.length} Applications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="overflow-hidden">
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[100px]">Email</TableHead>
                                            <TableHead>Service Category</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date of Application</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((application) => (
                                            <TableRow
                                                key={application.application_id}
                                                onClick={() => handleRowClick(application)}
                                            >
                                                <TableCell className="font-medium">
                                                    {application.email}
                                                </TableCell>
                                                <TableCell>{application.service_category}</TableCell>
                                                <TableCell>{(application.service_duration / 60).toFixed(2)} hours</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge
                                                        className={`text-xs ${application.status === "approved"
                                                                ? "bg-green-500 text-white"
                                                                : application.status === "pending"
                                                                    ? "bg-yellow-500 text-white"
                                                                    : application.status === "declined"
                                                                        ? "bg-red-500 text-white"
                                                                        : ""
                                                            }`}
                                                    >
                                                        {application.status}
                                                        
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    {new Date(application.date_of_application).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-dashed"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Open Menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleApprove(application.application_id)}>Approve</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDecline(application.application_id)}>Decline</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(application.application_id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="month">
                        {/* Same table structure as above */}
                        <Card className="overflow-hidden rounded-lg border">
                            <CardHeader className="bg-muted/50 px-6 py-4">
                                <CardTitle className="text-base">Application Requests</CardTitle>
                                <CardDescription className="text-sm">
                                    Showing {filteredApplications.length} Applications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="overflow-hidden">
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[100px]">Email</TableHead>
                                            <TableHead>Service Category</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date of Application</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((application) => (
                                            <TableRow
                                                key={application.application_id}
                                                onClick={() => handleRowClick(application)}
                                            >
                                                <TableCell className="font-medium">
                                                    {application.email}
                                                </TableCell>
                                                <TableCell>{application.service_category}</TableCell>
                                                <TableCell>{(application.service_duration / 60).toFixed(2)} hours</TableCell>
                                                <TableCell className="hidden sm:table-cell">
                                                    <Badge
                                                        className={`text-xs ${application.status === "approved"
                                                            ? "bg-green-500 text-white"
                                                            : application.status === "pending"
                                                                ? "bg-yellow-500 text-white"
                                                                : application.status === "declined"
                                                                    ? "bg-red-500 text-white"
                                                                    : ""
                                                            }`}
                                                    >
                                                        {application.status}
                                                    </Badge>
                                                </TableCell>

                                                <TableCell>
                                                    {new Date(application.date_of_application).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-dashed"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Open Menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleApprove(application.application_id)}>Approve</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDecline(application.application_id)}>Decline</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(application.application_id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="year">
                        {/* Same table structure as above */}
                        <Card className="overflow-hidden rounded-lg border">
                            <CardHeader className="bg-muted/50 px-6 py-4">
                                <CardTitle className="text-base">Application Requests</CardTitle>
                                <CardDescription className="text-sm">
                                    Showing {filteredApplications.length} Applications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table className="overflow-hidden">
                                    <TableHeader>
                                        <TableRow className="bg-muted/50">
                                            <TableHead className="w-[100px]">Email</TableHead>
                                            <TableHead>Service Category</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Date of Application</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredApplications.map((application) => (
                                            <TableRow
                                                key={application.application_id}
                                                onClick={() => handleRowClick(application)}
                                            >
                                                <TableCell className="font-medium">
                                                    {application.email}
                                                </TableCell>
                                                <TableCell>{application.service_category}</TableCell>
                                                <TableCell>{(application.service_duration / 60).toFixed(2)} hours</TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        application.status === 'approved'
                                                            ? 'success'
                                                            : application.status === 'pending'
                                                                ? 'warning'
                                                                : 'destructive'
                                                    }>
                                                        {application.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(application.date_of_application).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 border-dashed"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                                <span className="sr-only">Open Menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleApprove(application.application_id)}>Approve</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDecline(application.application_id)}>Decline</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDelete(application.application_id)}>Delete</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Display Selected Application Details */}
                {selectedApplication && (
                    <div>
                        <Card className="overflow-hidden">
                            <CardHeader className="flex flex-row items-start bg-muted/50">
                                <div className="grid gap-0.5">
                                    <CardTitle className="group flex items-center gap-2 text-lg">
                                        Application {selectedApplication.application_id}
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                        >
                                            <Copy className="h-3 w-3" />
                                            <span className="sr-only">
                                                Copy Application ID
                                            </span>
                                        </Button>
                                    </CardTitle>
                                    <CardDescription>
                                        Date:{" "}
                                        {new Date(
                                            selectedApplication.date_of_application
                                        ).toLocaleDateString()}
                                    </CardDescription>
                                </div>
                                {/* <div className="ml-auto flex items-center gap-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                            >
                                                <MoreVertical className="h-3.5 w-3.5" />
                                                <span className="sr-only">More</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Export</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Trash</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div> */}
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2 p-1">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Customer
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            {selectedApplication.email}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Service Category
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                            {selectedApplication.service_category}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Service Duration
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {(selectedApplication.service_duration / 60).toFixed(2)} hours
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Service
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <NotepadText className="h-4 w-4 text-muted-foreground" />
                                            {selectedApplication.service}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Status
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {selectedApplication.status === 'pending' ? (
                                                <div className="flex items-center text-yellow-500">
                                                    <Clock className="h-4 w-4 mr-2" /> Pending
                                                </div>
                                            ) : selectedApplication.status === 'approved' ? (
                                                <div className="flex items-center text-green-500">
                                                    <CheckCircle className="h-4 w-4 mr-2" /> Approved
                                                </div>
                                            ) : selectedApplication.status === 'declined' ? (
                                                <div className="flex items-center text-red-500">
                                                    <XCircle className="h-4 w-4 mr-2" /> Declined
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Date of Application
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            {new Date(selectedApplication.date_of_application).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between px-7 py-6">
                                <div className="grid gap-1">
                                    <Progress value={selectedApplication.progress || 0} />
                                    <p className="text-sm text-muted-foreground">
                                        Application ID: {selectedApplication.application_id}
                                    </p>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>
                )}

            </div>
        </div>
    );
}

export default ApplicationsPage;
