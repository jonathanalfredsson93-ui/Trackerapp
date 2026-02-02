import { useState, useMemo } from 'react';
import { Search, Plus, Heart, Zap, Pencil, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useQuickFoods,
  useCreateQuickFood,
  useUpdateQuickFood,
  useDeleteQuickFood,
  useToggleQuickFoodFavorite,
} from '@/hooks/useQuickFoods';
import { QuickFood } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const quickFoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  kcal: z.coerce.number().min(0, 'Must be positive'),
  protein: z.coerce.number().min(0, 'Must be positive'),
});

type QuickFoodFormData = z.infer<typeof quickFoodSchema>;

export default function QuickFoodsPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<QuickFood | null>(null);

  const { data: quickFoods = [], isLoading } = useQuickFoods();
  const createMutation = useCreateQuickFood();
  const updateMutation = useUpdateQuickFood();
  const deleteMutation = useDeleteQuickFood();
  const toggleFavoriteMutation = useToggleQuickFoodFavorite();

  const form = useForm<QuickFoodFormData>({
    resolver: zodResolver(quickFoodSchema),
    defaultValues: {
      name: '',
      kcal: 0,
      protein: 0,
    },
  });

  const filteredFoods = useMemo(() => {
    return quickFoods.filter(food =>
      food.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [quickFoods, search]);

  const handleSubmit = (data: QuickFoodFormData) => {
    if (editingFood) {
      updateMutation.mutate(
        { id: editingFood.id, ...data },
        { onSuccess: () => { setDialogOpen(false); form.reset(); } }
      );
    } else {
      createMutation.mutate(
        { name: data.name, kcal: data.kcal, protein: data.protein, is_favorite: false },
        { onSuccess: () => { setDialogOpen(false); form.reset(); } }
      );
    }
  };

  const handleEdit = (food: QuickFood) => {
    setEditingFood(food);
    form.reset({
      name: food.name,
      kcal: food.kcal,
      protein: food.protein,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleFavorite = (id: string, isFavorite: boolean) => {
    toggleFavoriteMutation.mutate({ id, is_favorite: isFavorite });
  };

  const handleOpenDialog = () => {
    setEditingFood(null);
    form.reset({ name: '', kcal: 0, protein: 0 });
    setDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Quick Foods</h1>
            <p className="text-muted-foreground mt-1">
              Standard meals with preset nutrition values
            </p>
          </div>
          <Button onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Quick Food
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quick foods..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Total Quick Foods</p>
            <p className="text-2xl font-bold text-foreground">{quickFoods.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Favorites</p>
            <p className="text-2xl font-bold text-accent">{quickFoods.filter(f => f.is_favorite).length}</p>
          </div>
          <div className="stat-card">
            <p className="text-sm text-muted-foreground">Search Results</p>
            <p className="text-2xl font-bold text-foreground">{filteredFoods.length}</p>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No quick foods found.</p>
            <Button variant="link" onClick={handleOpenDialog}>
              Add your first quick food
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFoods.map(food => (
              <Card key={food.id} className="group relative p-4 transition-all hover:shadow-lg hover:border-primary/20 animate-fade-in">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{food.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-protein font-medium">{food.protein}g protein</span>
                        <span className="text-xs text-kcal font-medium">{food.kcal} kcal</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleToggleFavorite(food.id, !food.is_favorite)}
                  >
                    <Heart
                      className={cn(
                        'h-4 w-4 transition-colors',
                        food.is_favorite ? 'fill-accent text-accent' : 'text-muted-foreground'
                      )}
                    />
                  </Button>
                </div>

                <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(food)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(food.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingFood ? 'Edit Quick Food' : 'Add Quick Food'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Pizza Margherita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="kcal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calories (kcal)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="protein"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Protein (g)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Quick foods are standard meals like pizza or burgers that you can add directly to your meal plan without building from ingredients.
              </p>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingFood ? 'Save Changes' : 'Add Quick Food'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
