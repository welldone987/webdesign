import { useMemo, useState } from 'react';
import { AboutPhotography } from './components/AboutPhotography.tsx';
import { CategoryNav } from './components/CategoryNav.tsx';
import { Footer } from './components/Footer.tsx';
import { GalleryGrid } from './components/GalleryGrid.tsx';
import { Hero } from './components/Hero.tsx';
import { Layout } from './components/Layout.tsx';
import { PhotoViewer } from './components/PhotoViewer.tsx';
import photos from './data/photos.json';
import type { Photo } from './types/photography.ts';

const allPhotos = photos as Photo[];

function App() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const categories = useMemo(
    () => ['全部', ...Array.from(new Set(allPhotos.map((photo) => photo.category)))],
    [],
  );

  const visiblePhotos = useMemo(() => {
    if (activeCategory === '全部') {
      return allPhotos;
    }

    return allPhotos.filter((photo) => photo.category === activeCategory);
  }, [activeCategory]);

  return (
    <Layout>
      <Hero featuredPhotos={allPhotos.filter((photo) => photo.featured)} />
      <CategoryNav
        activeCategory={activeCategory}
        categories={categories}
        onChange={setActiveCategory}
      />
      <GalleryGrid photos={visiblePhotos} onOpenPhoto={setSelectedPhoto} />
      <AboutPhotography />
      <Footer />
      <PhotoViewer photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </Layout>
  );
}

export default App;
