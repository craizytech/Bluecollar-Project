"use client";
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function CategoryList() {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('http://localhost:8080/api/categories/all')
                if (!res.ok) {
                    throw new Error('Failed to fetch categories');
                }
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories');
            }
        }

        fetchCategories();
    }, []);

    if (!categories || categories.length === 0) {
        return <div className="bg-blue-200 p-3 rounded-lg text-blue-700">No categories found</div>;
    }
    return (
        <div className="mt-14 mx-4 md:mx-22 lg:mx-52 grid grid-cols md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
            <Link key={category.id} href={`/search/${category.name.toLowerCase()}`} className="flex flex-col items-center justify-center gap-2 bg-blue-50 p-4 rounded-lg hover:cursor-pointer hover:scale-110 transition-all ease-in-out">
                <Image src={`/${category.name.toLowerCase()}.png`}
                    alt="icon"
                    width={35}
                    height={35} />

                <h2 className="text-primary">{category.name}</h2>
            </Link>
            ))}
        </div>
    )
}

export default CategoryList