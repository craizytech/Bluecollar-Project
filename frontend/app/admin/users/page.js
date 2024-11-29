"use client";

import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertTriangle, BadgeInfo, CheckCircle, ChevronDown, MoreHorizontal, Shield, User, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersPage() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [alert, setAlert] = useState(null); // State for managing alerts
  const token = localStorage.getItem('access_token');
  console.log(token);

  useEffect(() => {
    fetch("http://localhost:5000/api/users/all")
      .then((response) => response.json())
      .then((data) =>
        setData(data),
        setAlert({
          variant: "success",
          title: "Success",
          description: "Users fetched successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
        })
      )
      .catch((error) =>
        console.error("Error fetching users:", error,
          setAlert({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch users.",
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

  const handleMakeAdmin = async (userId) => {
    try {
      console.log("pressed");
      const response = await fetch(`http://localhost:5000/api/users/${userId}/make-admin`, {
        role_id: 1,
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Update the role_id in the local state for the specific user
        setData((prevData) =>
          prevData.map((user) =>
            user.user_id === userId ? { ...user, role_id: 1 } : user
          )
        );
  
        setAlert({
          variant: "default",
          title: "Information",
          description: `Promoted user with ID: ${userId} to Admin`,
          icon: <BadgeInfo className="h-4 w-4" />,
        });
      } else {
        setAlert({
          variant: "destructive",
          title: "Error",
          description: "Failed to promote to admin.",
          icon: <AlertTriangle className="h-4 w-4" />,
        });
        console.error("Failed to promote to admin:", response.statusText);
      }
    } catch (error) {
      setAlert({
        variant: "destructive",
        title: "Error",
        description: "Failed to promote to admin.",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      console.error("Failed to promote to admin:", error);
    }
  };
  
  const handleMakeNormalUser = async (userId) => {
    try {
      console.log("pressed");
      const response = await fetch(`http://localhost:5000/api/users/${userId}/make-general-user`, {
        role_id: 1,
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        // Update the role_id in the local state for the specific user
        setData((prevData) =>
          prevData.map((user) =>
            user.user_id === userId ? { ...user, role_id: 3 } : user
          )
        );
  
        setAlert({
          variant: "default",
          title: "Information",
          description: `Demoted user with ID: ${userId} to General User`,
          icon: <BadgeInfo className="h-4 w-4" />,
        });
      } else {
        setAlert({
          variant: "destructive",
          title: "Error",
          description: "Failed to demote to general user.",
          icon: <AlertTriangle className="h-4 w-4" />,
        });
        console.error("Failed to demote to general user:", response.statusText);
      }
    } catch (error) {
      setAlert({
        variant: "destructive",
        title: "Error",
        description: "Failed to demote to general user.",
        icon: <AlertTriangle className="h-4 w-4" />,
      });
      console.error("Failed to demote to general user:", error);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setData((prevData) => prevData.filter((user) => user.user_id !== userId));
        setAlert({
          variant: "success",
          title: "Success",
          description: "User deleted successfully.",
          icon: <CheckCircle className="h-4 w-4" />,
        });
      } else {
        console.error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
    setDeleteUserId(null);
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "user_id",
        header: "ID",
      },
      {
        accessorKey: "user_name",
        header: "Name",
      },
      {
        accessorKey: "user_email",
        header: "Email",
      },
      {
        accessorKey: "user_phone_number",
        header: "Phone",
      },
      {
        accessorKey: "user_address",
        header: "Address",
      },
      {
        accessorKey: "user_location",
        header: "Location",
      },
      {
        accessorKey: "role_id",
        header: "Role ID",
        cell: ({ row }) => {
          const roleId = row.original.role_id;
          let roleInfo = { icon: null, label: "", color: "" };

          switch (roleId) {
            case 1:
              roleInfo = { icon: <Shield className="h-4 w-4 text-red-500" />, label: "Admin", color: "text-red-500" };
              break;
            case 2:
              roleInfo = { icon: <Users className="h-4 w-4 text-blue-500" />, label: "Specialized User", color: "text-blue-500" };
              break;
            case 3:
              roleInfo = { icon: <User className="h-4 w-4 text-green-500" />, label: "General User", color: "text-green-500" };
              break;
            default:
              roleInfo = { icon: null, label: "Unknown", color: "text-gray-500" };
          }

          return (
            <div className={`flex items-center space-x-2 ${roleInfo.color}`}>
              {roleInfo.icon}
              <span>{roleInfo.label}</span>
            </div>
          );
        },
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-auto">
                  <span className="sr-only">Open actions</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleMakeAdmin(row.original.user_id)}>
                  Promote to admin
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => handleMakeNormalUser(row.original.user_id)}>
                  Demote to general user
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => setDeleteUserId(row.original.user_id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full relative">
      {alert && (
        <div className="fixed bottom-20 right-20 flex items-center justify-center z-50 w-auto">
          <Alert variant={alert.variant}>
            {alert.icon}
            <AlertTitle>{alert.title}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
          </Alert>
        </div>
      )}
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter emails..."
          onChange={(event) => table.getColumn("user_email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllColumns().filter((column) => column.getCanHide()).map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteUserId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteUser(deleteUserId)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default UsersPage;
