"use client";
import React from 'react';
import { BriefcaseIcon, GlobeAltIcon, CheckCircleIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const AboutUs = () => {
  return (
    <section className="py-12 px-6 md:px-12 bg-gray-100">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">About Us</h2>
        <p className="text-lg mb-8">
          <strong>Welcome to BlueCollar</strong>
        </p>
        <p className="text-base mb-6">
          At BlueCollar, we believe that finding trustworthy and reliable service professionals should be effortless and stress-free. Our mission is to bridge the gap between you and top-rated local service providers, making your search for home services as seamless as possible.
        </p>
        
        <div className="flex flex-col md:flex-row md:space-x-8 mb-12">
          <div className="flex-1 mb-8 md:mb-0">
            <BriefcaseIcon className="w-10 h-10 mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Who We Are</h3>
            <p className="text-base">
              BlueCollar is a cutting-edge app designed to connect homeowners and businesses with skilled professionals in their area. Whether you're looking for a plumber, electrician, landscaper, or any other home service, BlueCollar offers a comprehensive platform where you can discover, review, and book services with confidence.
            </p>
          </div>
          <div className="flex-1 mb-8 md:mb-0">
            <GlobeAltIcon className="w-10 h-10 mx-auto text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-base">
              We envision a world where finding the right service professional is just a tap away. Our platform aims to provide users with a reliable resource for all their service needs, ensuring that every interaction is smooth and satisfactory. By leveraging advanced technology and a user-friendly interface, we strive to enhance your experience and simplify your life.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-6">What We Do</h3>
        <ul className="list-disc list-inside mb-12 text-left mx-auto max-w-md">
          <li className="mb-4 flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>Discover Trusted Professionals: Browse through a curated list of skilled service providers, complete with detailed profiles and user reviews.</span>
          </li>
          <li className="mb-4 flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>Find the Best Fit: Assess various options and customer feedback to make the most informed choice.</span>
          </li>
          <li className="mb-4 flex items-start">
            <CheckCircleIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>Book with Confidence: Schedule services easily and securely through our app, and communicate directly with service providers.</span>
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mb-6">Why Choose Us?</h3>
        <ul className="list-disc list-inside mb-12 text-left mx-auto max-w-md">
          <li className="mb-4 flex items-start">
            <UserGroupIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>User-Centric Design: Our app is designed with you in mind, offering an intuitive and seamless experience.</span>
          </li>
          <li className="mb-4 flex items-start">
            <UserGroupIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>Verified Professionals: We work with vetted and highly-rated professionals to ensure quality and reliability.</span>
          </li>
          <li className="mb-4 flex items-start">
            <UserGroupIcon className="w-6 h-6 text-blue-500 mr-3" />
            <span>Customer Support: Our dedicated support team is always here to assist you with any questions or concerns.</span>
          </li>
        </ul>

        <p className="text-base">
          Thank you for choosing BlueCollar. We look forward to helping you find the perfect service provider for your needs.
        </p>
      </div>
    </section>
  );
};

export default AboutUs;
