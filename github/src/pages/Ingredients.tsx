import { useState, useMemo } from 'react';
import { Search, Plus, Heart, FileUp, ScanBarcode } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { IngredientDialog } from '@/components/ingredients/IngredientDialog';
import { BulkImportDialog } from '@/components/ingredients/BulkImportDialog';
import { BarcodeScannerDialog } from '@/components/ingredients/BarcodeScannerDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useDeleteIngredient,
  useToggleFavorite,
  useBulkCreateIngredients,
} from '@/hooks/useIngredients';
import { Ingredient } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites' | 'custom'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [scannedData, setScannedData] = useState<{ name: string; kcal_per_100g: number; protein_per_100g: number } | null>(null);

  const { data: ingredients = [], isLoading } = useIngredients();
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const deleteMutation = useDeleteIngredient();
  const toggleFavoriteMutation = useToggleFavorite();
  const bulkCreateMutation = useBulkCreateIngredients();

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const matchesSearch = ing.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'favorites' && ing.is_favorite) ||
        (filter === 'custom' && ing.is_custom);
      return matchesSearch && matchesFilter;
    });
  }, [ingredients, search, filter]);

  const handleSubmit = (data: Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingIngredient) {
      updateMutation.mutate(
        { id: editingIngredient.id, ...data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleBulkImport = (ingredients: { name: string; kcal_per_100g: number; protein_per_100g: number }[], categoryId?: string | null) => {
    bulkCreateMutation.mutate({ ingredients, category_id: categoryId }, {
      onSuccess: () => setBulkImportOpen(false),
    });
  };

  const handleEdit = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, is_favorite: isFavorite });
  };

  const handleOpenDialog = () => {
    setEditingIngredient(null);
    setScannedData(null);
    setDialogOpen(true);
  };

  const handleBarcodeFound = (data: { name: string; kcal_per_100g: number; protein_per_100g: number }) => {
    setScannedData(data);
    setEditingIngredient(null);
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Ingredients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your ingredient database with nutritional values
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => setBarcodeOpen(true)}>
              <ScanBarcode className="h-4 w-4 mr-2" />
              Scan
            </Button>
            <Button variant="outline" onClick={() => setBulkImportOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleOpenDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ingredients..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="favorites" className="gap-1">
                <Heart className="h-3 w-3" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Ingredients</p>
            <p className="text-2xl font-bold text-foreground">{ingredients.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Favorites</p>
            <p className="text-2xl font-bold text-accent">{ingredients.filter(i => i.is_favorite).length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Custom Added</p>
            <p className="text-2xl font-bold text-primary">{ingredients.filter(i => i.is_custom).length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Search Results</p>
            <p className="text-2xl font-bold text-foreground">{filteredIngredients.length}</p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : filteredIngredients.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No ingredients found.</p>
            <Button variant="link" onClick={handleOpenDialog}>
              Add your first ingredient
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredIngredients.map(ingredient => (
              <IngredientCard
                key={ingredient.id}
                ingredient={ingredient}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      <IngredientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ingredient={editingIngredient}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        initialData={scannedData}
      />

      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImport={handleBulkImport}
        isLoading={bulkCreateMutation.isPending}
      />

      <BarcodeScannerDialog
        open={barcodeOpen}
        onOpenChange={setBarcodeOpen}
        onProductFound={handleBarcodeFound}
      />
    </AppLayout>
  );
}