import { Link } from 'react-router-dom';
import { PlusSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import PlantCard from '@/components/PlantCard';
import { Button } from '@/components/ui/button';
import { getPlants } from '@/lib/api';

const Dashboard = () => {
  const { data: plants = [], isLoading, isError } = useQuery({
    queryKey: ['plants'],
    queryFn: getPlants,
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <AppHeader
        title="Minhas Plantas"
        actions={
          <Link to="/add-plant">
            <Button size="sm" className="font-heading gap-1.5">
              <PlusSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Adicionar</span>
            </Button>
          </Link>
        }
      />

      <main className="container py-6">
        {isLoading && (
          <div className="text-center py-20 space-y-2">
            <p className="font-body text-muted-foreground">Carregando plantas...</p>
          </div>
        )}

        {isError && (
          <div className="text-center py-20 space-y-2">
            <p className="font-body text-muted-foreground">Não foi possível carregar suas plantas.</p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
        {plants.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="font-body text-muted-foreground">Nenhuma planta cadastrada.</p>
            <Link to="/add-plant">
              <Button className="font-heading">Adicionar primeira planta</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {plants.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
