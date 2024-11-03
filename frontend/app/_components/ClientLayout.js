"use client";
import { Provider } from 'react-redux';
import Header from './Header';
import store from '../store/store';

export default function ClientLayout({ children }) {
  return (
    <Provider store={store}>
      <div className="mx-6 md:mx-16">
        <Header />
        {children}
      </div>
    </Provider>
  );
}
