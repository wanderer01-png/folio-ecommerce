"use client";

import { useActionState } from "react";

import type { ProductFormState } from "@/app/admin/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Category {
  id: string;
  name: string;
}

interface ProductFormDefaultValues {
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: string;
  images: string[];
}

interface ProductFormProps {
  action: (
    state: ProductFormState,
    formData: FormData,
  ) => Promise<ProductFormState>;
  categories: Category[];
  defaultValues?: ProductFormDefaultValues;
  submitLabel: string;
}

export function ProductForm({
  action,
  categories,
  defaultValues,
  submitLabel,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={defaultValues?.name} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={defaultValues?.description}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={defaultValues?.price}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            step="1"
            min="0"
            required
            defaultValue={defaultValues?.stock}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <Select name="categoryId" defaultValue={defaultValues?.categoryId}>
          <SelectTrigger id="categoryId" className="w-full">
            <SelectValue placeholder="Select a category">
              {(value: string | null) =>
                categories.find((category) => category.id === value)?.name ??
                "Select a category"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="images">Image URLs (comma-separated)</Label>
        <Input
          id="images"
          name="images"
          required
          defaultValue={defaultValues?.images.join(", ")}
        />
      </div>

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
