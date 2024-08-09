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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [alert, setAlert] = useState(null); // State for managing alerts
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [categoryUserCounts, setCategoryUserCounts] = useState([]);


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
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <nav className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="#">Categories</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>All Categories</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </nav>
                <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <Tabs defaultValue="all">
                        <div className="flex items-center">
                            <TabsList>
                                <TabsTrigger value="all">Categories</TabsTrigger>
                            </TabsList>
                            <div className="ml-auto flex items-center gap-2">
                                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" className="h-8 gap-1">
                                            <PlusCircle className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                Add Category
                                            </span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Category</DialogTitle>
                                            <DialogDescription>
                                                Please enter the category name and upload an image.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <Input
                                                placeholder="Category name"
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                            />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e)}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAddCategory}>Add Category</Button>
                                            <DialogClose asChild>
                                                <Button variant="outline">Cancel</Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                        <TabsContent value="all">
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
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onSelect={() => {
                                                                            setCategoryToDelete(category);
                                                                            setDeleteDialogOpen(true);
                                                                        }}
                                                                    >
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
                    </Tabs>
                </div>
            </div>
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Please update the category name and image.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Category name"
                            value={categoryToEdit?.name || ''}
                            onChange={(e) =>
                                setCategoryToEdit({ ...categoryToEdit, name: e.target.value })
                            }
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, true)}
                        />
                    </div>
                    <DialogFooter>
                        <Button onClick={handleEditCategory}>Update Category</Button>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this category?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={handleDeleteCategory} variant="destructive">Delete</Button>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default CategoriesPage;
