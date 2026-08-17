import Layout from '@/components/layout/Layout';
import HeroBanner from '@/components/home/HeroBanner';
import CategorySlider from '@/components/home/CategorySlider';
import ProductGrid from '@/components/home/ProductGrid';
import PromoBanners from '@/components/home/PromoBanners';
import CustomerReviews from '@/components/home/CustomerReviews';
import OthersVsUs from '@/components/home/OthersVsUs';
import KeyPoints from '@/components/home/KeyPoints';

const Index = () => {
  return (
    <Layout>
      <HeroBanner />
      <CategorySlider />
      <ProductGrid featured />
      <PromoBanners />
      <ProductGrid />
      <CustomerReviews />
      <OthersVsUs />
      <KeyPoints />
    </Layout>
  );
};

export default Index;
