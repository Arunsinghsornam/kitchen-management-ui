import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RecipeService } from './recipe.service';
import { RawMaterialService } from '../inventory/raw-material.service';

@Component({
selector: 'app-recipes',
standalone: true,
imports: [CommonModule, FormsModule],
templateUrl: './recipes.component.html',
styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

private recipeService = inject(RecipeService);
private rawMaterialService = inject(RawMaterialService);

recipes: any[] = [];
rawMaterials: any[] = [];

searchText = '';

showForm = false;
editing = false;

selectedRecipeId = '';

recipe: any = {
name: '',
category: '',
sellingPrice: null,
ingredients: []
};

ngOnInit(): void {
this.loadRecipes();
this.loadRawMaterials();
}

// ======================
// DASHBOARD
// ======================

get totalRecipes(): number {
return this.recipes.length;
}

get averageCost(): number {


if (!this.recipes.length) {
  return 0;
}

const total = this.recipes.reduce(
  (sum, recipe) => sum + (recipe.recipeCost || 0),
  0
);

return total / this.recipes.length;


}

get highestMargin(): number {


if (!this.recipes.length) {
  return 0;
}

return Math.max(
  ...this.recipes.map(x => this.getMargin(x))
);


}

get lowestMargin(): number {


if (!this.recipes.length) {
  return 0;
}

return Math.min(
  ...this.recipes.map(x => this.getMargin(x))
);


}

// ======================
// SEARCH
// ======================

filteredRecipes(): any[] {


if (!this.searchText?.trim()) {
  return this.recipes;
}

return this.recipes.filter(recipe =>
  recipe.name?.toLowerCase()
    .includes(
      this.searchText.toLowerCase()
    )
);


}

// ======================
// LOAD DATA
// ======================

loadRecipes(): void {


this.recipeService.getRecipes().subscribe({

  next: (data) => {

    this.recipes = data || [];

  },

  error: (err) => {

    console.error(
      'Failed to load recipes',
      err
    );

  }

});


}

loadRawMaterials(): void {


this.rawMaterialService.getMaterials().subscribe({

  next: (data) => {

    this.rawMaterials = data || [];

  },

  error: (err) => {

    console.error(
      'Failed to load raw materials',
      err
    );

  }

});


}

// ======================
// FORM
// ======================

newRecipe(): void {


this.editing = false;

this.selectedRecipeId = '';

this.showForm = true;

this.recipe = {

  name: '',

  category: '',

  sellingPrice: null,

  ingredients: []

};

this.addIngredient();


}

cancel(): void {


this.showForm = false;

this.editing = false;

this.selectedRecipeId = '';

this.recipe = {
  name: '',
  category: '',
  sellingPrice: null,
  ingredients: []
};


}

editRecipe(recipe: any): void {


this.editing = true;

this.selectedRecipeId = recipe.id;

this.showForm = true;

this.recipe = {

  id: recipe.id,

  name: recipe.name,

  category: recipe.category,

  sellingPrice: recipe.sellingPrice,

  ingredients:
    (recipe.ingredients || [])
      .map((x: any) => ({

        rawMaterialId:
          x.rawMaterialId,

        quantity:
          x.quantity

      }))
};


}

// ======================
// INGREDIENTS
// ======================

addIngredient(): void {


if (!this.recipe.ingredients) {

  this.recipe.ingredients = [];

}

this.recipe.ingredients.push({

  rawMaterialId: '',

  quantity: null

});


}

removeIngredient(index: number): void {

  if (
    index >= 0 &&
    index < this.recipe.ingredients.length
  ) {

    this.recipe.ingredients.splice(
      index,
      1
    );

  }

}

deleteRecipe(recipe: any): void {

  if (!confirm(`Delete "${recipe.name}" ?`)) {
    return;
  }

  this.recipeService
    .deleteRecipe(recipe.id)
    .subscribe({

      next: (res) => {

        console.log('DELETE SUCCESS', res);

        this.loadRecipes();

      },

      error: (err) => {

        console.log('STATUS:', err.status);

        console.log('ERROR BODY:', err.error);

        console.log('FULL ERROR:', err);

        alert(err.error);

      }

    });
}

getMaterial(id: string): any {


return this.rawMaterials.find(
  x => x.id === id
);


}

// ======================
// COSTING
// ======================

calculateRecipeCost(): number {


let total = 0;

for (const item of this.recipe.ingredients || []) {

  const material = this.getMaterial(
    item.rawMaterialId
  );

  if (material) {

    total +=
      (material.averageCost || 0)
      *
      (item.quantity || 0);
  }
}

return total;


}

getProfit(recipe: any): number {


return (
  (recipe?.sellingPrice || 0)
  -
  (recipe?.recipeCost || 0)
);


}

getMargin(recipe: any): number {


if (
  !recipe?.sellingPrice ||
  !recipe?.recipeCost
) {
  return 0;
}

return (
  (
    (
      recipe.sellingPrice
      -
      recipe.recipeCost
    )
    /
    recipe.sellingPrice
  )
  * 100
);


}

// ======================
// SAVE
// ======================

save(): void {


if (!this.recipe.name) {

  alert(
    'Recipe Name is required'
  );

  return;
}

if (!this.recipe.category) {

  alert(
    'Category is required'
  );

  return;
}

if (!this.recipe.sellingPrice) {

  alert(
    'Selling Price is required'
  );

  return;
}

if (
  !this.recipe.ingredients ||
  !this.recipe.ingredients.length
) {

  alert(
    'Please add at least one ingredient'
  );

  return;
}
const ingredientIds = this.recipe.ingredients.map(
  (x: any) => x.rawMaterialId
);

if (ingredientIds.length !== new Set(ingredientIds).size) {

  alert('Duplicate ingredients are not allowed.');

  return;
}
const request = this.editing

  ? this.recipeService.updateRecipe(
      this.selectedRecipeId,
      this.recipe
    )

  : this.recipeService.createRecipe(
      this.recipe
    );

request.subscribe({

  next: () => {

    this.loadRecipes();

    this.showForm = false;

    this.editing = false;

    this.selectedRecipeId = '';

    this.recipe = {
      name: '',
      category: '',
      sellingPrice: null,
      ingredients: []
    };
  },

 error: (err) => {

  console.error('Save failed:', err);

  const message =
    err?.error?.message ||
    err?.error?.title ||
    'Failed to save recipe';

  alert(message);
}

});


}

// ======================
// DELETE
// ======================



}
