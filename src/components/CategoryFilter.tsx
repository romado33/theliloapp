import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Utensils, 
  Palette, 
  TreePine, 
  Music, 
  Camera, 
  Dumbbell,
  Coffee,
  ShoppingBag
} from "lucide-react";

const categories = [
  { id: "all", name: "All", icon: null },
  { id: "food", name: "Food & Drink", icon: Utensils },
  { id: "arts", name: "Arts & Crafts", icon: Palette },
  { id: "outdoors", name: "Outdoors", icon: TreePine },
  { id: "music", name: "Music", icon: Music },
  { id: "photography", name: "Photography", icon: Camera },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "coffee", name: "Coffee", icon: Coffee },
  { id: "shopping", name: "Shopping", icon: ShoppingBag },
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <Card className="p-4 bg-card/50 backdrop-blur-sm border-0 shadow-soft">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Button
              key={category.id}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={`shrink-0 gap-2 transition-all duration-200 ${
                isSelected 
                  ? "bg-primary hover:bg-primary-dark shadow-soft" 
                  : "hover:bg-secondary/80"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span className="whitespace-nowrap">{category.name}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default CategoryFilter;