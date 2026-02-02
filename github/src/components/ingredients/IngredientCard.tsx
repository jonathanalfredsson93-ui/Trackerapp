import { Heart, Pencil, Trash2 } from 'lucide-react';
import { Ingredient } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

export function IngredientCard({
  ingredient,
  onEdit,
  onDelete,
  onToggleFavorite,
}: IngredientCardProps) {
  return (
    <div className="group relative rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-lg hover:border-primary/20 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">{ingredient.name}</h3>
            {ingredient.is_custom && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                Custom
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Default: {ingredient.default_unit === 'per_100g' ? 'per 100g' : 'per unit'}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onToggleFavorite(ingredient.id, !ingredient.is_favorite)}
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-colors',
              ingredient.is_favorite
                ? 'fill-accent text-accent'
                : 'text-muted-foreground'
            )}
          />
        </Button>
      </div>

      {/* Per 100g values */}
      <div className="mt-3">
        <p className="text-xs text-muted-foreground mb-1.5">Per 100g</p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="nutrition-badge bg-protein/10 text-protein">
              <span className="font-semibold">{ingredient.protein_per_100g}g</span>
              <span className="text-xs opacity-80">protein</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="nutrition-badge bg-kcal/10 text-kcal">
              <span className="font-semibold">{ingredient.kcal_per_100g}</span>
              <span className="text-xs opacity-80">kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per unit values - only show if grams_per_unit is set */}
      {ingredient.grams_per_unit > 0 && (
        <div className="mt-2">
          <p className="text-xs text-muted-foreground mb-1.5">
            Per unit ({ingredient.grams_per_unit}g)
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="nutrition-badge bg-protein/10 text-protein">
                <span className="font-semibold">{ingredient.protein_per_unit.toFixed(1)}g</span>
                <span className="text-xs opacity-80">protein</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="nutrition-badge bg-kcal/10 text-kcal">
                <span className="font-semibold">{Math.round(ingredient.kcal_per_unit)}</span>
                <span className="text-xs opacity-80">kcal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(ingredient)}
        >
          <Pencil className="h-3 w-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(ingredient.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
