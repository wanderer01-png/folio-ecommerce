"use client";

import { useActionState, useState } from "react";

import type { BookFormState } from "@/app/admin/books/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Genre {
  id: string;
  name: string;
}

interface BookFormDefaultValues {
  title: string;
  author: string;
  isbn: string | null;
  description: string;
  genreId: string;
  coverImages: string[];
  ebookPrice: string | null;
  hardcopyPrice: string | null;
  hardcopyStock: number;
  ebookFileUrl: string | null;
  ebookFileType: "PDF" | "EPUB" | null;
}

interface BookFormProps {
  action: (state: BookFormState, formData: FormData) => Promise<BookFormState>;
  genres: Genre[];
  defaultValues?: BookFormDefaultValues;
  submitLabel: string;
}

export function BookForm({ action, genres, defaultValues, submitLabel }: BookFormProps) {
  const [state, formAction, isPending] = useActionState(action, undefined);
  const [offerEbook, setOfferEbook] = useState(
    defaultValues ? defaultValues.ebookPrice !== null : true,
  );
  const [offerHardcopy, setOfferHardcopy] = useState(
    defaultValues ? defaultValues.hardcopyPrice !== null : true,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required defaultValue={defaultValues?.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="author">Author</Label>
        <Input id="author" name="author" required defaultValue={defaultValues?.author} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="isbn">ISBN (optional)</Label>
        <Input id="isbn" name="isbn" defaultValue={defaultValues?.isbn ?? ""} />
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

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="genreId">Genre</Label>
        <Select name="genreId" defaultValue={defaultValues?.genreId}>
          <SelectTrigger id="genreId" className="w-full">
            <SelectValue placeholder="Select a genre">
              {(value: string | null) =>
                genres.find((genre) => genre.id === value)?.name ?? "Select a genre"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coverImages">Cover image URLs (comma-separated)</Label>
        <Input
          id="coverImages"
          name="coverImages"
          required
          defaultValue={defaultValues?.coverImages.join(", ")}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox checked={offerEbook} onCheckedChange={(c) => setOfferEbook(c === true)} />
          Sell as e-book
        </label>

        {offerEbook && (
          <div className="flex flex-col gap-4 pl-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ebookPrice">E-book price (USD)</Label>
              <Input
                id="ebookPrice"
                name="ebookPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.ebookPrice ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ebookFileUrl">E-book file URL</Label>
              <Input
                id="ebookFileUrl"
                name="ebookFileUrl"
                placeholder="/sample-books/sample-book.pdf"
                defaultValue={defaultValues?.ebookFileUrl ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ebookFileType">E-book file type</Label>
              <Select name="ebookFileType" defaultValue={defaultValues?.ebookFileType ?? undefined}>
                <SelectTrigger id="ebookFileType" className="w-full">
                  <SelectValue placeholder="Select a file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EPUB">EPUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox
            checked={offerHardcopy}
            onCheckedChange={(c) => setOfferHardcopy(c === true)}
          />
          Sell as hardcopy
        </label>

        {offerHardcopy && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hardcopyPrice">Hardcopy price (USD)</Label>
              <Input
                id="hardcopyPrice"
                name="hardcopyPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue={defaultValues?.hardcopyPrice ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hardcopyStock">Stock</Label>
              <Input
                id="hardcopyStock"
                name="hardcopyStock"
                type="number"
                step="1"
                min="0"
                defaultValue={defaultValues?.hardcopyStock ?? 0}
              />
            </div>
          </div>
        )}
      </div>
      {!offerHardcopy && (
        <input type="hidden" name="hardcopyStock" value="0" />
      )}

      {state?.error && <p className="text-destructive text-sm">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="mt-2 w-fit">
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
