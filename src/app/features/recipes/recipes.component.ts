import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

import { RecipeService } from './recipe.service';
import { RawMaterialService } from '../inventory/raw-material.service';
import { AuthService } from '../../services/auth.service';
import { OutletService, Outlet } from '../outlets/outlet.service';

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
private authService = inject(AuthService);
private outletService = inject(OutletService);
private http = inject(HttpClient);

recipes: any[] = [];
rawMaterials: any[] = [];
outlets: Outlet[] = [];
organizations: any[] = [];

isSuperAdmin = false;
isPowerAdmin = false;
selectedOutletId = '';
selectedOrganizationId = '';
searchText = '';

showForm = false;
editing = false;

selectedRecipeId = '';

recipe: any = {
name: '',
category: '',
sellingPrice: null,
outletId: '',
imageUrl: '',
ingredients: []
};

ngOnInit(): void {
  const user = this.authService.currentUser;
  this.isSuperAdmin = user?.role === 'super_admin' || user?.role === 'power_admin';
  this.isPowerAdmin = user?.role === 'power_admin';

  if (this.isPowerAdmin) {
    this.loadOrganizations();
  }
  if (this.isSuperAdmin) {
    this.loadOutlets();
  } else {
    this.selectedOutletId = user?.outletId || '';
    this.loadRecipes();
  }
  this.loadRawMaterials();
}

loadOrganizations(): void {
  this.http.get<any>(`${environment.apiUrl}/api/organizations`).subscribe({
    next: (res) => {
      if (res.success) {
        this.organizations = res.data.filter((o: any) => o.status === 'Approved');
      }
    },
    error: (err) => console.error('Error loading organizations:', err)
  });
}

loadOutlets(): void {
  this.outletService.getOutlets(this.selectedOrganizationId).subscribe({
    next: data => {
      this.outlets = data;
      if (this.outlets.length > 0 && !this.selectedOutletId) {
        this.selectedOutletId = this.outlets[0].id || '';
        this.loadRecipes();
        this.loadRawMaterials();
      }
    },
    error: err => console.error(err)
  });
}

onOrganizationChange(): void {
  this.selectedOutletId = '';
  this.loadOutlets();
  this.recipes = [];
  this.rawMaterials = [];
}

onOutletFilterChange(): void {
  if (this.selectedOutletId) {
    this.loadRecipes();
    this.loadRawMaterials();
  } else {
    this.recipes = [];
    this.rawMaterials = [];
  }
}

onModalOutletChange(): void {
  // Reload raw materials for the selected outlet inside the modal
  this.rawMaterialService.getMaterials(this.recipe.outletId).subscribe({
    next: (data) => {
      this.rawMaterials = data || [];
      this.recipe.ingredients = []; // Clear ingredients since they belonged to the other outlet's materials
    },
    error: (err) => console.error(err)
  });
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
  if (this.isSuperAdmin && !this.selectedOutletId) {
    this.recipes = [];
    return;
  }

  this.recipeService.getRecipes(this.selectedOutletId).subscribe({
    next: (data) => {
      this.recipes = data || [];
    },
    error: (err) => {
      console.error('Failed to load recipes', err);
    }
  });
}

loadRawMaterials(): void {
  if (this.isSuperAdmin && !this.selectedOutletId) {
    this.rawMaterials = [];
    return;
  }

  this.rawMaterialService.getMaterials(this.selectedOutletId).subscribe({
    next: (data) => {
      this.rawMaterials = data || [];
    },
    error: (err) => {
      console.error('Failed to load raw materials', err);
    }
  });
}

// ======================
// FORM
// ======================

onFileSelected(event: any): void {
  const file: File = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    this.http.post<any>(`${environment.apiUrl}/api/recipes/upload`, formData).subscribe({
      next: (res) => {
        if (res?.imageUrl) {
          this.recipe.imageUrl = res.imageUrl;
        }
      },
      error: (err) => {
        console.error('Failed to upload image:', err);
        alert('Failed to upload image');
      }
    });
  }
}

newRecipe(): void {


this.editing = false;

this.selectedRecipeId = '';

this.showForm = true;

  this.recipe = {
    name: '',
    category: '',
    sellingPrice: null,
    imageUrl: '',
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
    imageUrl: '',
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
  imageUrl: recipe.imageUrl || '',
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
      this.recipe,
      this.recipe.outletId || this.selectedOutletId
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
      imageUrl: '',
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
