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
} from "lucide-react";
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
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 3000); // Alert disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [alert]);

    useEffect(() => {
        async function fetchApplications() {
            try {
                const response = await fetch("http://localhost:5000/api/services/applications");
                const data = await response.json();
                console.log("Fetched applications:", data);
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

    const handleRowClick = (application) => {
        setSelectedApplication(application);
    };

    const handleApprove = async (applicationId) => {
        try {
            const response = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/approve`)

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
            const response = await axios.post(`http://localhost:5000/api/services/applications/${applicationId}/decline`)

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
    }

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
                <nav className="sticky top-0 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
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
                </nav>
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
                        <Tabs defaultValue="week">
                            <div className="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="week">Week</TabsTrigger>
                                    <TabsTrigger value="month">Month</TabsTrigger>
                                    <TabsTrigger value="year">Year</TabsTrigger>
                                </TabsList>
                                <div className="ml-auto flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 gap-1 text-sm"
                                            >
                                                <span className="sr-only sm:not-sr-only">Filter</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>Approved</DropdownMenuItem>
                                            <DropdownMenuItem>Declined</DropdownMenuItem>
                                            <DropdownMenuItem>Pending</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 gap-1 text-sm"
                                    >
                                        <span className="sr-only sm:not-sr-only">Export</span>
                                    </Button>
                                </div>
                            </div>
                            <TabsContent value="week">
                                <Card x-chunk="dashboard-05-chunk-3">
                                    <CardHeader className="px-7">
                                        <CardTitle>Applications</CardTitle>
                                        <CardDescription>
                                            Recent applications from the platform.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead className="hidden sm:table-cell">
                                                        Service Category
                                                    </TableHead>
                                                    <TableHead className="hidden sm:table-cell">
                                                        Service
                                                    </TableHead>
                                                    <TableHead className="hidden sm:table-cell">
                                                        Status
                                                    </TableHead>
                                                    <TableHead className="hidden md:table-cell">
                                                        Date of Application
                                                    </TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {applications.map((application) => (
                                                    <TableRow
                                                        key={application.application_id}
                                                        onClick={() => handleRowClick(application)}
                                                        className="cursor-pointer"
                                                    >
                                                        <TableCell>
                                                            <div className="font-medium">
                                                                {application.email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            {application.service_category}
                                                        </TableCell>
                                                        <TableCell className="hidden sm:table-cell">
                                                            {application.service}
                                                        </TableCell>
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
                                                        <TableCell className="hidden md:table-cell">
                                                            {new Date(
                                                                application.date_of_application
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button
                                                                        aria-haspopup="true"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                    >
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                        <span className="sr-only">Toggle menu</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleApprove(application.application_id)}
                                                                    >
                                                                        Approve
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => handleDecline(application.application_id)}
                                                                    >
                                                                        Disapprove
                                                                    </DropdownMenuItem>
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
                    </div>
                    {selectedApplication && (
                        <div>
                            <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
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
                                    <div className="ml-auto flex items-center gap-1">
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
                                    </div>
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
        </div>
    );
}

export default ApplicationsPage;

