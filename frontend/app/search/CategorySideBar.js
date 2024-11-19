"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setCategoryId } from '../store/slices/categorySlice';

function CategorySideBar() {
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const res = await fetch('http://localhost:5000/api/categories/all');
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

    const handleClick = (categoryId) => {
        console.log(`Category ${categoryId} clicked`);
        dispatch(setCategoryId(categoryId));
    };

    return (
        <div>
            <h2 className="font-bold mb-3 text-lg text-primary">Categories</h2>
            <div>
                {categories.map((category) => (
                    <Link key={category.id} href={`/search/${category.id}`} passHref>
                        <div onClick={() => handleClick(category.id)} className="flex gap-2 p-3 border rounded-lg mb-3 md:mr-10 cursor-pointer hover:bg-blue-50 hover:text-primary hover:border-primary transition-all ease-in-out shadow-md items-center">
                            <Image src={`/${category.name.toLowerCase()}.png`} alt="icon" width={30} height={30} />
                            <h2 className="">{category.name}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CategorySideBar;
