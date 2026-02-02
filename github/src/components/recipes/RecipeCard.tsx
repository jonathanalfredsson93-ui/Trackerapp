import { ChefHat, Pencil, Trash2, Users } from 'lucide-react';
import { RecipeWithIngredients } from '@/types';
import { Button } from '@/components/ui/button';

interface RecipeCardProps {
  recipe: RecipeWithIngredients;
  onEdit: (recipe: RecipeWithIngredients) => void;
  onDelete: (id: string) => void;
}

export function RecipeCard({ recipe, onEdit, onDelete }: RecipeCardProps) {
  return (
    <div className="group relative rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 animate-fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">{recipe.name}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {recipe.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {recipe.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 stat-card">
            <p className="text-xs text-muted-foreground">Per serving</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-semibold text-protein">
                {recipe.protein_per_serving?.toFixed(1)}g
              </span>
              <span className="text-xs text-muted-foreground">protein</span>
            </div>
          </div>
          <div className="flex-1 stat-card">
            <p className="text-xs text-muted-foreground">Per serving</p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-lg font-semibold text-kcal">
                {recipe.kcal_per_serving?.toFixed(0)}
              </span>
              <span className="text-xs text-muted-foreground">kcal</span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          {recipe.recipe_ingredients?.length || 0} ingredient{(recipe.recipe_ingredients?.length || 0) !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="border-t border-border/50 px-5 py-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/30">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(recipe)}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(recipe.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
