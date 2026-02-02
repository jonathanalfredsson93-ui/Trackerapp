import { useState, useMemo } from 'react';
import { Search, Plus, ChefHat } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { RecipeDialog } from '@/components/recipes/RecipeDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  useRecipes,
  useCreateRecipe,
  useUpdateRecipe,
  useDeleteRecipe,
} from '@/hooks/useRecipes';
import { RecipeWithIngredients } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function RecipesPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeWithIngredients | null>(null);

  const { data: recipes = [], isLoading } = useRecipes();
  const createMutation = useCreateRecipe();
  const updateMutation = useUpdateRecipe();
  const deleteMutation = useDeleteRecipe();

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [recipes, search]);

  const handleSubmit = (
    data: { name: string; description?: string; servings: number },
    ingredients: { ingredient_id: string; quantity: number }[]
  ) => {
    if (editingRecipe) {
      updateMutation.mutate(
        { id: editingRecipe.id, recipe: data, ingredients },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createMutation.mutate(
        { recipe: { ...data, description: data.description || null }, ingredients },
        { onSuccess: () => setDialogOpen(false) }
      );
    }
  };

  const handleEdit = (recipe: RecipeWithIngredients) => {
    setEditingRecipe(recipe);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleOpenDialog = () => {
    setEditingRecipe(null);
    setDialogOpen(true);
  };

  const totalRecipes = recipes.length;
  const avgProtein = recipes.length > 0
    ? recipes.reduce((sum, r) => sum + (r.protein_per_serving || 0), 0) / recipes.length
    : 0;
  const avgKcal = recipes.length > 0
    ? recipes.reduce((sum, r) => sum + (r.kcal_per_serving || 0), 0) / recipes.length
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Recipes</h1>
            <p className="text-muted-foreground mt-1">
              Create and save recipes with automatic nutrition calculations
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Recipe
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Recipes</p>
            <p className="text-2xl font-bold text-foreground">{totalRecipes}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Avg. Protein/Serving</p>
            <p className="text-2xl font-bold text-protein">{avgProtein.toFixed(1)}g</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Avg. Calories/Serving</p>
            <p className="text-2xl font-bold text-kcal">{avgKcal.toFixed(0)}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Search Results</p>
            <p className="text-2xl font-bold text-foreground">{filteredRecipes.length}</p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ChefHat className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No recipes found.</p>
            <Button variant="link" onClick={handleOpenDialog}>
              Create your first recipe
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <RecipeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        recipe={editingRecipe}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </AppLayout>
  );
}
