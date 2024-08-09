"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import {
    ListFilter,
    MoreHorizontal,
    PlusCircle,
    CheckCircle,
    AlertTriangle,
    Trash,
    Edit,
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDescription, setNewServiceDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [alert, setAlert] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [serviceToEdit, setServiceToEdit] = useState(null);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [categoryUserCounts, setCategoryUserCounts] = useState([]);
    const [activeTab, setActiveTab] = useState('categories');



    useEffect(() => {
        fetch('http://localhost:5000/api/categories/all')
            .then(response => response.json())
            .then(data =>
                setCategories(data),
                setNewCategoryImage(null),
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Categories fetched successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                })
            )
            .catch((error) =>
                console.error('Error fetching categories:', error,
                    setAlert({
                        variant: "destructive",
                        title: "Error",
                        description: "Error fetching categories.",
                        icon: <AlertTriangle className="h-4 w-4" />,
                    })
                ));
        fetch('http://localhost:5000/api/services/all')
            .then(response => response.json())
            .then(data => setServices(data))
            .catch(error => console.error('Error fetching services:', error));
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/categories/user_count')
            .then(response => response.json())
            .then(data =>
                setCategoryUserCounts(data),
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "User counts fetched successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                })
            )
            .catch((error) =>
                console.error('Error fetching user counts:', error,
                    setAlert({
                        variant: "destructive",
                        title: "Error",
                        description: "Error fetching user counts.",
                        icon: <AlertTriangle className="h-4 w-4" />,
                    })
                ));
    }, []);


    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                setAlert(null);
            }, 3000); // Alert disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [alert]);

    const handleAddCategory = async () => {
        if (!newCategoryName) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Category name is required.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            return;
        }

        const formData = new FormData();
        formData.append('name', newCategoryName.toLowerCase());
        formData.append('file', newCategoryImage);

        try {
            const response = await fetch('http://localhost:5000/api/categories/create', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const newCategory = await response.json();
                setCategories([...categories, newCategory.category]);
                setDialogOpen(false);
                setNewCategoryName('');
                setNewCategoryImage(null);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Category created successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to create category.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error creating category.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };

    const handleAddService = async () => {
        if (!newServiceName || !newServiceDescription) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Service name and description are required.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            return;
        }

        const formData = new FormData();
        formData.append('name', newServiceName.toLowerCase());
        formData.append('description', newServiceDescription);

        try {
            const response = await fetch('http://localhost:5000/api/services/create', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const newService = await response.json();
                setServices([...services, newService.service]);
                setDialogOpen(false);
                setNewServiceName('');
                setNewServiceDescription('');
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Service created successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to create service.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error creating service.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };

    const handleEditService = async () => {
        if (!serviceToEdit.name || !serviceToEdit.description) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Service name and description are required.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/services/update/${serviceToEdit.id}`, {
                method: 'PUT',
                body: JSON.stringify(serviceToEdit),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const updatedService = await response.json();
                setServices(services.map(service => service.id === updatedService.id ? updatedService : service));
                setEditDialogOpen(false);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Service updated successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update service.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error updating service.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };


    const handleEditCategory = async () => {
        if (!categoryToEdit.name) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Category name is required.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
            return;
        }

        const formData = new FormData();
        formData.append('name', categoryToEdit.name.toLowerCase());
        if (categoryToEdit.image) {
            formData.append('file', categoryToEdit.image);
        }

        try {
            const response = await fetch(`http://localhost:5000/api/categories/update/${categoryToEdit.id}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                const updatedCategory = await response.json();
                setCategories(categories.map(category => category.id === updatedCategory.id ? updatedCategory : category));
                setEditDialogOpen(false);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Category updated successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to update category.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error updating category.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };

    const handleDeleteCategory = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/categories/delete/${categoryToDelete.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setCategories(categories.filter(category => category.id !== categoryToDelete.id));
                setDeleteDialogOpen(false);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Category deleted successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete category.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error deleting category.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };

    const handleDeleteService = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/services/delete/${serviceToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setServices(services.filter(service => service.id !== serviceToDelete.id));
                setDeleteDialogOpen(false);
                setAlert({
                    variant: "success",
                    title: "Success",
                    description: "Service deleted successfully.",
                    icon: <CheckCircle className="h-4 w-4" />,
                });
            } else {
                setAlert({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to delete service.",
                    icon: <AlertTriangle className="h-4 w-4" />,
                });
            }
        } catch (error) {
            setAlert({
                variant: "destructive",
                title: "Error",
                description: "Error deleting service.",
                icon: <AlertTriangle className="h-4 w-4" />,
            });
        }
    };


    const handleImageUpload = (event, isEdit = false) => {
        const file = event.target.files[0];
        if (isEdit) {
            setCategoryToEdit({ ...categoryToEdit, image: file });
        } else {
            setNewCategoryImage(file);
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
            <div className="flex items-center justify-between py-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                    <p className="text-sm text-muted-foreground">Create, edit, and delete categories and services.</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add {activeTab === 'categories' ? 'Category' : 'Service'}
                </Button>
            </div>
            <div className="container flex flex-col gap-8">
                <div className="hidden flex-col md:flex">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="categories">Categories</TabsTrigger>
                            <TabsTrigger value="services">Services</TabsTrigger>
                        </TabsList>

                        <TabsContent value="categories">
                            <Card x-chunk="dashboard-06-chunk-0">
                                <CardHeader>
                                    <CardTitle>Categories</CardTitle>
                                    <CardDescription>
                                        Manage your service categories and view their sales performance.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="hidden w-[100px] sm:table-cell">
                                                    <span className="sr-only">Image</span>
                                                </TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    Total Employees
                                                </TableHead>
                                                <TableHead className="hidden md:table-cell">
                                                    Created at
                                                </TableHead>
                                                <TableHead>
                                                    <span className="sr-only">Actions</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {categories.map((category) => {
                                                const userCount = categoryUserCounts.find(count => count.id === category.id)?.user_count || 0;
                                                return (
                                                    <TableRow key={category.id}>
                                                        <TableCell className="hidden sm:table-cell">
                                                            <Image
                                                                alt="Product image"
                                                                className="aspect-square rounded-md object-cover"
                                                                height="64"
                                                                src={`/${category.name.toLowerCase()}.png`}
                                                                width="64"
                                                            />
                                                        </TableCell>
                                                        <TableCell className="font-medium">
                                                            {category.name}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {userCount}
                                                        </TableCell>
                                                        <TableCell className="hidden md:table-cell">
                                                            {category.creation_date}
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
                                                                        onSelect={() => {
                                                                            setCategoryToEdit(category);
                                                                            setEditDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setCategoryToDelete(category);
                                                                            setDeleteDialogOpen(true);
                                                                        }}
                                                                    >
                                                                        <Trash className="mr-2 h-4 w-4" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>

                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="services">
                            {/* Services table */}
                            <Card>
                                <CardHeader className="flex items-center justify-between">
                                    <CardTitle>Services</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {services.map(service => (
                                                <TableRow key={service.service_id}>
                                                    <TableCell>{service.service_name}</TableCell>
                                                    <TableCell>{service.service_description}</TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem onClick={() => {
                                                                    setServiceToEdit(service);
                                                                    setEditDialogOpen(true);
                                                                }}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem onClick={() => {
                                                                    setServiceToDelete(service);
                                                                    setDeleteDialogOpen(true);
                                                                }}>
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
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
            </div>
            {/* Add Category/Service Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add {activeTab === 'categories' ? 'Category' : 'Service'}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {activeTab === 'categories' ? (
                            <div className="space-y-4">
                                <Input
                                    placeholder="Category name"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <Input
                                    type="file"
                                    onChange={(e) => setNewCategoryImage(e.target.files[0])}
                                />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Input
                                    placeholder="Service name"
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                />
                                <Input
                                    placeholder="Service description"
                                    value={newServiceDescription}
                                    onChange={(e) => setNewServiceDescription(e.target.value)}
                                />
                                <Select onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={activeTab === 'categories' ? handleAddCategory : handleAddService}>
                            Add {activeTab === 'categories' ? 'Category' : 'Service'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Category/Service Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Edit {activeTab === 'categories' ? 'Category' : 'Service'}
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        {activeTab === 'categories' && categoryToEdit ? (
                            <div className="space-y-4">
                                <Input
                                    placeholder="Category name"
                                    value={categoryToEdit.name}
                                    onChange={(e) => setCategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                                />
                                <Input
                                    type="file"
                                    onChange={(e) => setCategoryToEdit({ ...categoryToEdit, imageUrl: URL.createObjectURL(e.target.files[0]) })}
                                />
                            </div>
                        ) : serviceToEdit && (
                            <div className="space-y-4">
                                <Input
                                    placeholder="Service name"
                                    value={serviceToEdit.name}
                                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, name: e.target.value })}
                                />
                                <Input
                                    placeholder="Service description"
                                    value={serviceToEdit.description}
                                    onChange={(e) => setServiceToEdit({ ...serviceToEdit, description: e.target.value })}
                                />
                            </div>
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button onClick={activeTab === 'categories' ? handleEditCategory : handleEditService}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Do you really want to delete this {activeTab === 'categories' ? 'category' : 'service'}? This action cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={activeTab === 'categories' ? handleDeleteCategory : handleDeleteService}>
                            Delete
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CategoriesPage;
