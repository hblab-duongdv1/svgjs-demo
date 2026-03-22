import MainLayout from './components/templates/MainLayout';
import DocumentationPage from './pages/DocumentationPage';
import ShowcasePage from './pages/ShowcasePage';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const activePage = useAppStore((s) => s.activePage);

  const page =
    activePage === 'docs' ? <DocumentationPage /> : <ShowcasePage />;

  return <MainLayout>{page}</MainLayout>;
}
