export type PriceFilterId = "all" | "cheap" | "middle" | "expensive";

export type PriceFilter = {
  id: PriceFilterId;
  label: string;
  description: string;
  min: number | null;
  max: number | null;
};
