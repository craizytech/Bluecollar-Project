import Hero from "./_components/Hero";
import CategoryList from "./_components/CategoryList";
import BusinessList from "./_components/BusinessList";

export default function Home() {
  return (
    <div>
       <Hero/>
       <CategoryList/>
       <BusinessList title={'Popular Business'}/>
    </div>
  );
}

