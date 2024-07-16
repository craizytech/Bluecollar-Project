import React from 'react';
import Header from "./_components/Header";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
